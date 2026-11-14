/**
 * Facade de compatibilidade para AppointmentRepository
 * Delega para os repositórios modulares do domínio e mantém a interface pública esperada.
 */
import {
  Appointment,
  AppointmentDetailedView,
  AppointmentStatus,
  Client,
  Pet,
  ClinicService,
  AuditLogEntry,
  EmailNotification,
} from '@vetcare/shared';
import { InMemoryStore } from './domain/models/in-memory.store.js';
import { AppointmentRepository as DomainAppointmentRepository } from './domain/repositories/appointment.repository.js';
import { ClientRepository } from './domain/repositories/client.repository.js';
import { PetRepository } from './domain/repositories/pet.repository.js';
import { ServiceRepository } from './domain/repositories/service.repository.js';
import { AuditRepository } from './domain/repositories/audit.repository.js';
import { NotificationRepository } from './domain/repositories/notification.repository.js';

export class AppointmentRepository {
  private store: InMemoryStore;
  private appointmentRepo: DomainAppointmentRepository;
  private clientRepo: ClientRepository;
  private petRepo: PetRepository;
  private serviceRepo: ServiceRepository;
  private auditRepo: AuditRepository;
  private notificationRepo: NotificationRepository;

  constructor(store = InMemoryStore.getInstance()) {
    this.store = store;
    this.appointmentRepo = new DomainAppointmentRepository(store);
    this.clientRepo = new ClientRepository(store);
    this.petRepo = new PetRepository(store);
    this.serviceRepo = new ServiceRepository(store);
    this.auditRepo = new AuditRepository(store);
    this.notificationRepo = new NotificationRepository(store);
  }

  getClients(): Client[] {
    return this.clientRepo.findAll();
  }

  getClientById(id: string): Client | undefined {
    return this.clientRepo.findById(id);
  }

  searchClients(query: string): Client[] {
    return this.clientRepo.search(query);
  }

  createClient(name: string, phone: string, email: string, cpf?: string): Client {
    return this.clientRepo.create({ name, phone, email, cpf });
  }

  getPets(): Pet[] {
    return this.petRepo.findAll();
  }

  getPetsByClientId(clientId: string): Pet[] {
    return this.petRepo.findByClientId(clientId);
  }

  createPet(
    clientId: string,
    name: string,
    species: 'Cão' | 'Gato' | 'Ave' | 'Outro',
    breed: string,
    birthDate?: string,
  ): Pet {
    return this.petRepo.create({ clientId, name, species, breed, birthDate });
  }

  getServices(): ClinicService[] {
    return this.serviceRepo.findAll();
  }

  getAllAppointments(): Appointment[] {
    return this.appointmentRepo.findAll();
  }

  getDetailedAppointments(): AppointmentDetailedView[] {
    return this.appointmentRepo.findAllDetailed();
  }

  findById(id: string): Appointment | undefined {
    return this.appointmentRepo.findById(id);
  }

  findDetailedById(id: string): AppointmentDetailedView | undefined {
    return this.appointmentRepo.findDetailedById(id);
  }

  create(appt: Appointment): AppointmentDetailedView {
    return this.appointmentRepo.create(appt);
  }

  update(id: string, updates: Partial<Appointment>): AppointmentDetailedView | undefined {
    return this.appointmentRepo.update(id, updates);
  }

  updateStatus(id: string, status: AppointmentStatus): AppointmentDetailedView | undefined {
    return this.appointmentRepo.updateStatus(id, status);
  }

  getAuditLogs(): AuditLogEntry[] {
    return this.auditRepo.findAll();
  }

  getEmailNotifications(): EmailNotification[] {
    return this.notificationRepo.findAll();
  }

  sendEmailConfirmation(
    appointmentId: string,
    recipientEmail: string,
    recipientName: string,
    details: string,
  ) {
    return this.notificationRepo.record({
      appointmentId,
      type: 'CONFIRMACAO',
      recipientEmail,
      recipientName,
      subject: 'Confirmação de Agendamento - MedPet Clínica Veterinária',
      body: `Olá ${recipientName},\n\nSeu agendamento foi confirmado com sucesso!\n\nDetalhes:\n${details}\n\nMedPet Veterinária`,
      status: 'SENT',
    });
  }
}
