import { describe, it, expect } from 'vitest';
import {
  calculateEndTime,
  isOverlapping,
  hasScheduleConflict,
  formatGoogleCalendarEventPayload,
  generateAppointmentsXml,
  formatDateBR,
  filterClientsByPrefix,
  Appointment,
  AppointmentDetailedView,
  Client,
} from '../../packages/shared/src/index';

describe('Regras de Negócio de Agendamento (Domínio VetCare)', () => {
  it('deve calcular corretamente a data de término com base na duração do serviço', () => {
    const start = '2026-11-20T10:00:00.000Z';
    const durationMinutes = 45;
    const end = calculateEndTime(start, durationMinutes);

    expect(end).toBe('2026-11-20T10:45:00.000Z');
  });

  it('deve detectar sobreposição de horários conflitantes', () => {
    // Caso 1: Horário existente: 10:00 até 11:00
    const startA = new Date('2026-11-20T10:00:00.000Z');
    const endA = new Date('2026-11-20T11:00:00.000Z');

    // Novo agendamento que inicia durante o atendimento (10:30 até 11:30) -> Conflito!
    const startB = new Date('2026-11-20T10:30:00.000Z');
    const endB = new Date('2026-11-20T11:30:00.000Z');
    expect(isOverlapping(startA, endA, startB, endB)).toBe(true);

    // Novo agendamento que inicia exatamente no término (11:00 até 11:30) -> Sem conflito!
    const startC = new Date('2026-11-20T11:00:00.000Z');
    const endC = new Date('2026-11-20T11:30:00.000Z');
    expect(isOverlapping(startA, endA, startC, endC)).toBe(false);

    // Novo agendamento antes (09:00 até 10:00) -> Sem conflito!
    const startD = new Date('2026-11-20T09:00:00.000Z');
    const endD = new Date('2026-11-20T10:00:00.000Z');
    expect(isOverlapping(startA, endA, startD, endD)).toBe(false);
  });

  it('deve validar se há conflito na lista de agendamentos e ignorar cancelados', () => {
    const mockAppointments: Appointment[] = [
      {
        id: '1',
        clientId: 'c1',
        petId: 'p1',
        serviceId: 's1',
        veterinarianName: 'Dra. Paula',
        startTime: '2026-11-20T14:00:00.000Z',
        endTime: '2026-11-20T15:00:00.000Z',
        status: 'CONFIRMADO',
        googleSyncStatus: 'SYNCED',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '2',
        clientId: 'c2',
        petId: 'p2',
        serviceId: 's2',
        veterinarianName: 'Dra. Paula',
        startTime: '2026-11-20T16:00:00.000Z',
        endTime: '2026-11-20T17:00:00.000Z',
        status: 'CANCELADO', // Cancelado não deve gerar bloqueio!
        googleSyncStatus: 'SYNCED',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    // Conflita com o agendamento 1 (14:15 às 14:45)
    const check1 = hasScheduleConflict(
      mockAppointments,
      '2026-11-20T14:15:00.000Z',
      '2026-11-20T14:45:00.000Z',
    );
    expect(check1.hasConflict).toBe(true);
    expect(check1.conflictingWith?.id).toBe('1');

    // Tenta agendar no horário do agendamento 2 (cancelado) -> Deve permitir!
    const check2 = hasScheduleConflict(
      mockAppointments,
      '2026-11-20T16:15:00.000Z',
      '2026-11-20T16:45:00.000Z',
    );
    expect(check2.hasConflict).toBe(false);
  });

  it('deve formatar o payload do evento para o Google Calendar com dados da clínica', () => {
    const payload = formatGoogleCalendarEventPayload({
      appointmentId: 'apt-123',
      clientName: 'Arthur Steiner',
      clientPhone: '(11) 99999-8888',
      petName: 'Thor',
      serviceName: 'Consulta Geral e Vacinação',
      veterinarianName: 'Dr. Lucas Mendes',
      startTime: '2026-11-25T14:00:00.000Z',
      endTime: '2026-11-25T14:45:00.000Z',
      notes: 'Pet dócil, trazer carteirinha anterior.',
    });

    expect(payload.summary).toBe(
      '[MedPet] Consulta Geral e Vacinação: Thor (Tutor: Arthur Steiner)',
    );
    expect(payload.description).toContain('PACIENTE: Thor');
    expect(payload.description).toContain('TUTOR: Arthur Steiner (Tel: (11) 99999-8888)');
    expect(payload.description).toContain('ID SISTEMA MEDPET: apt-123');
    expect(payload.start.timeZone).toBe('America/Sao_Paulo');
  });

  it('deve gerar relatório estruturado em formato XML válido com os dados clínicos', () => {
    const mockDetailed: AppointmentDetailedView[] = [
      {
        id: 'apt-xml-1',
        clientId: 'c1',
        petId: 'p1',
        serviceId: 's1',
        veterinarianName: 'Dra. Camila',
        startTime: '2026-11-20T10:00:00.000Z',
        endTime: '2026-11-20T10:30:00.000Z',
        status: 'CONFIRMADO',
        googleEventId: 'gcal_1',
        googleSyncStatus: 'SYNCED',
        clientName: 'Arthur',
        clientPhone: '1199999999',
        clientEmail: 'arthur@test.com',
        petName: 'Thor',
        petSpecies: 'Cão',
        petBreed: 'Golden',
        serviceName: 'Consulta',
        serviceCategory: 'CONSULTA',
        servicePrice: 150,
        serviceColor: '#0284c7',
        createdAt: '2026-11-20T00:00:00.000Z',
        updatedAt: '2026-11-20T00:00:00.000Z',
      },
    ];

    const xml = generateAppointmentsXml(mockDetailed);
    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain('<relatorioAgendamentos clinica="MedPet / VetCare"');
    expect(xml).toContain('<tutor nome="Arthur"');
    expect(xml).toContain('<paciente nome="Thor"');
  });
});
