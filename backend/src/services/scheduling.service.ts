import {
  Appointment,
  AppointmentDetailedView,
  AppointmentStatus,
  CreateAppointmentDTO,
  UpdateAppointmentDTO,
  calculateEndTime,
  hasScheduleConflict,
  formatDateBR,
  formatTimeBR,
  generateAppointmentsXml,
  calculateAppointmentStats,
  AppointmentKPIStats,
} from '@vetcare/shared';
import { AppointmentRepository } from '../repositories/appointment.repository.js';
import { ClientRepository } from '../repositories/client.repository.js';
import { PetRepository } from '../repositories/pet.repository.js';
import { ServiceRepository } from '../repositories/service.repository.js';
import { AuditRepository } from '../repositories/audit.repository.js';
import { NotificationService } from './notification.service.js';
import { getSupabaseClient } from './supabase.service.js';

export class SchedulingService {
  private appointmentRepo: AppointmentRepository;
  private clientRepo: ClientRepository;
  private petRepo: PetRepository;
  private serviceRepo: ServiceRepository;
  private auditRepo: AuditRepository;
  private notificationService: NotificationService;

  constructor(
    appointmentRepo = new AppointmentRepository(),
    clientRepo = new ClientRepository(),
    petRepo = new PetRepository(),
    serviceRepo = new ServiceRepository(),
    auditRepo = new AuditRepository(),
    notificationService = new NotificationService(),
  ) {
    this.appointmentRepo = appointmentRepo;
    this.clientRepo = clientRepo;
    this.petRepo = petRepo;
    this.serviceRepo = serviceRepo;
    this.auditRepo = auditRepo;
    this.notificationService = notificationService;
  }

  listAppointments(filters?: {
    status?: string;
    date?: string;
    serviceId?: string;
    clientId?: string;
    petId?: string;
  }): AppointmentDetailedView[] {
    let list = this.appointmentRepo.findAllDetailed();

    if (filters?.status && filters.status !== 'TODOS') {
      list = list.filter((a) => a.status === filters.status);
    }

    if (filters?.date) {
      list = list.filter((a) => a.startTime.startsWith(filters.date!));
    }

    if (filters?.serviceId && filters.serviceId !== 'TODOS') {
      list = list.filter((a) => a.serviceId === filters.serviceId);
    }

    if (filters?.clientId) {
      list = list.filter((a) => a.clientId === filters.clientId);
    }

    if (filters?.petId) {
      list = list.filter((a) => a.petId === filters.petId);
    }

    list.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    return list;
  }

  getAppointmentById(id: string): AppointmentDetailedView | undefined {
    return this.appointmentRepo.findDetailedById(id);
  }

  getKPIStats(): AppointmentKPIStats {
    const all = this.appointmentRepo.findAllDetailed();
    return calculateAppointmentStats(all);
  }

  /**
   * Checa conflito de horário sem bloquear o salvamento.
   * Retorna objeto com informações de sobreposição caso exista.
   */
  checkConflict(
    startTimeIso: string,
    durationMinutes: number,
    ignoreAppointmentId?: string,
  ): { hasConflict: boolean; conflictingWith?: Appointment } {
    const endTime = calculateEndTime(startTimeIso, durationMinutes);
    const existing = this.appointmentRepo.findAll();
    return hasScheduleConflict(existing, startTimeIso, endTime, ignoreAppointmentId);
  }

  async createAppointment(
    dto: CreateAppointmentDTO,
  ): Promise<{ appointment: AppointmentDetailedView; warning?: string; conflict?: any }> {
    if (!dto.clientId || !dto.petId || !dto.serviceId || !dto.startTime) {
      throw new Error(
        'Campos obrigatórios ausentes: clientId, petId, serviceId e startTime são necessários.',
      );
    }

    const service = this.serviceRepo.findById(dto.serviceId);
    if (!service) {
      throw new Error('Serviço clínico não encontrado.');
    }

    const client = this.clientRepo.findById(dto.clientId);
    if (!client) {
      throw new Error('Cliente tutor não encontrado.');
    }

    const pet = this.petRepo.findById(dto.petId);
    if (!pet) {
      throw new Error('Animal paciente não encontrado.');
    }

    const duration = dto.durationMinutes || service.durationMinutes;
    const endTime = calculateEndTime(dto.startTime, duration);

    // 1. Verificação de conflitos de horário com aviso INFORMATIVO (não bloqueante)
    const existing = this.appointmentRepo.findAll();
    const conflictCheck = hasScheduleConflict(existing, dto.startTime, endTime);
    let warning: string | undefined;
    let conflictData: any | undefined;

    if (conflictCheck.hasConflict) {
      warning = 'Alerta Informativo: Existe outro agendamento no mesmo intervalo de horário.';
      conflictData = conflictCheck.conflictingWith;
    }

    const appointmentId = `apt-${Date.now()}`;
    const veterinarianName = dto.veterinarianName || 'Veterinário(a) Clínico';
    const user = dto.createdByUser || 'Recepção (VetCare)';

    // Persistência local/memória
    const newAppointment: Appointment = {
      id: appointmentId,
      clientId: dto.clientId,
      petId: dto.petId,
      serviceId: dto.serviceId,
      veterinarianName,
      startTime: dto.startTime,
      endTime,
      status: 'AGENDADO',
      notes: dto.notes,
      googleSyncStatus: 'SYNCED',
      createdByUser: user,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const saved = this.appointmentRepo.create(newAppointment);

    // Integração com Supabase real na tabela `atendimento` (quando configurado)
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('atendimento').insert({
          id: appointmentId,
          pet_id: dto.petId,
          veterinario_id: '00000000-0000-0000-0000-000000000000', // Referência padrão caso não haja UUID de veterinário
          atendente_id: '00000000-0000-0000-0000-000000000000', // Atendente padrão
          tipo_servico: service.name,
          data_hora: dto.startTime,
          status: 'Agendado',
          observacoes: dto.notes,
        });
      } catch (sbErr) {
        console.warn('[Supabase Atendimento Insert Warning]:', sbErr);
      }
    }

    // 4. Auditoria
    this.auditRepo.log({
      action: 'CREATE',
      targetId: appointmentId,
      targetType: 'APPOINTMENT',
      user,
      details: `Agendamento criado para ${pet.name} (Tutor: ${client.name}) em ${formatDateBR(dto.startTime)} às ${formatTimeBR(dto.startTime)}${conflictCheck.hasConflict ? ' [COM CONFLITO REGISTRADO]' : ''}`,
    });

    // 5. Notificação por E-mail
    if (client.email) {
      this.notificationService.sendConfirmation(
        appointmentId,
        client.email,
        client.name,
        `Pet: ${pet.name}\nServiço: ${service.name}\nData: ${formatDateBR(dto.startTime)} às ${formatTimeBR(dto.startTime)}\nVeterinário: ${veterinarianName}`,
      );
    }

    return {
      appointment: saved,
      warning,
      conflict: conflictData,
    };
  }

  async updateAppointment(
    id: string,
    dto: UpdateAppointmentDTO,
  ): Promise<{ appointment: AppointmentDetailedView; warning?: string; conflict?: any }> {
    const existing = this.appointmentRepo.findById(id);
    if (!existing) {
      const err: any = new Error('Agendamento não encontrado.');
      err.statusCode = 404;
      throw err;
    }

    const startTime = dto.startTime || existing.startTime;
    let endTime = existing.endTime;
    let warning: string | undefined;
    let conflictData: any | undefined;

    if (dto.startTime || dto.durationMinutes) {
      const service = this.serviceRepo.findById(dto.serviceId || existing.serviceId);
      const duration = dto.durationMinutes || (service ? service.durationMinutes : 30);
      endTime = calculateEndTime(startTime, duration);

      // Verificação de conflito informativo ignorando a si próprio
      const existingAll = this.appointmentRepo.findAll();
      const conflictCheck = hasScheduleConflict(existingAll, startTime, endTime, id);
      if (conflictCheck.hasConflict) {
        warning = 'Alerta Informativo: Existe outro agendamento no mesmo intervalo de horário.';
        conflictData = conflictCheck.conflictingWith;
      }
    }

    const updated = this.appointmentRepo.update(id, {
      ...dto,
      startTime,
      endTime,
    });

    if (!updated) {
      throw new Error('Falha ao atualizar agendamento.');
    }

    // Atualização no Supabase se configurado
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase
          .from('atendimento')
          .update({
            data_hora: startTime,
            status: dto.status || existing.status,
            observacoes: dto.notes !== undefined ? dto.notes : existing.notes,
          })
          .eq('id', id);
      } catch (sbErr) {
        console.warn('[Supabase Atendimento Update Warning]:', sbErr);
      }
    }

    const user = dto.updatedByUser || 'Recepção (VetCare)';
    this.auditRepo.log({
      action: 'RESCHEDULE',
      targetId: id,
      targetType: 'APPOINTMENT',
      user,
      details: `Agendamento ${id} alterado. Início: ${formatDateBR(startTime)} às ${formatTimeBR(startTime)}`,
    });

    return {
      appointment: updated,
      warning,
      conflict: conflictData,
    };
  }

  async updateAppointmentStatus(
    id: string,
    newStatus: AppointmentStatus,
    user = 'Recepção (VetCare)',
  ): Promise<AppointmentDetailedView> {
    const existing = this.appointmentRepo.findDetailedById(id);
    if (!existing) {
      const err: any = new Error('Agendamento não encontrado.');
      err.statusCode = 404;
      throw err;
    }

    const updated = this.appointmentRepo.updateStatus(id, newStatus);
    if (!updated) {
      throw new Error('Falha ao atualizar agendamento.');
    }

    // Atualiza status no Supabase se configurado
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase
          .from('atendimento')
          .update({ status: newStatus })
          .eq('id', id);
      } catch (sbErr) {
        console.warn('[Supabase Atendimento Status Warning]:', sbErr);
      }
    }

    this.auditRepo.log({
      action: newStatus === 'CANCELADO' ? 'CANCEL' : 'UPDATE_STATUS',
      targetId: id,
      targetType: 'APPOINTMENT',
      user,
      details: `Situação do agendamento alterada de ${existing.status} para ${newStatus}`,
    });

    // Notificação E-mail Tutor
    if (updated.clientEmail && updated.clientEmail !== '-') {
      if (newStatus === 'CANCELADO') {
        this.notificationService.sendCancellation(
          id,
          updated.clientEmail,
          updated.clientName,
          `Atendimento para ${updated.petName} agendado para ${formatDateBR(updated.startTime)} às ${formatTimeBR(updated.startTime)}.`,
        );
      } else {
        this.notificationService.sendUpdate(
          id,
          updated.clientEmail,
          updated.clientName,
          `Situação atual: ${newStatus}\nPet: ${updated.petName}\nData: ${formatDateBR(updated.startTime)} às ${formatTimeBR(updated.startTime)}.`,
        );
      }
    }

    return updated;
  }

  async cancelAppointment(
    id: string,
    user = 'Recepção (VetCare)',
  ): Promise<AppointmentDetailedView> {
    return await this.updateAppointmentStatus(id, 'CANCELADO', user);
  }

  exportAppointmentsXml(): string {
    const appointments = this.appointmentRepo.findAllDetailed();
    return generateAppointmentsXml(appointments);
  }
}
