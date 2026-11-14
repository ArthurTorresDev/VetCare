import { describe, it, expect } from 'vitest';
import { AppointmentRepository } from '../../apps/api/src/appointment.repository';
import { MockGoogleCalendarService } from '../../apps/api/src/google-calendar.service';
import {
  calculateEndTime,
  formatGoogleCalendarEventPayload,
} from '../../packages/shared/src/index';

describe('Integração de Agendamento com Google Calendar (Camada de Serviços)', () => {
  it('deve simular criação, atualização e remoção de eventos no Google Calendar', async () => {
    const gcal = new MockGoogleCalendarService();
    expect(gcal.getStatus().isMock).toBe(true);

    const payload = {
      summary: '[VetCare] Consulta: Rex (Tutor: Ana)',
      description: 'Atendimento clínico geral',
      start: { dateTime: '2026-11-20T10:00:00.000Z' },
      end: { dateTime: '2026-11-20T10:30:00.000Z' },
    };

    // Criação
    const result = await gcal.createEvent(payload);
    expect(result.eventId).toBeDefined();
    expect(result.htmlLink).toContain('calendar.google.com');
    expect(result.isMock).toBe(true);

    // Atualização
    await expect(
      gcal.updateEvent(result.eventId, { summary: '[CONFIRMADO] Consulta: Rex' }),
    ).resolves.not.toThrow();

    // Deleção
    await expect(gcal.deleteEvent(result.eventId)).resolves.not.toThrow();
  });

  it('deve gerenciar agendamentos no repositório e montar visualização detalhada com tutor e pet', () => {
    const repo = new AppointmentRepository();
    const clients = repo.getClients();
    const pets = repo.getPets();
    const services = repo.getServices();

    expect(clients.length).toBeGreaterThan(0);
    expect(pets.length).toBeGreaterThan(0);
    expect(services.length).toBeGreaterThan(0);

    const startTime = '2026-11-20T15:00:00.000Z';
    const endTime = calculateEndTime(startTime, services[0].durationMinutes);

    const newAppt = repo.create({
      id: 'apt-test-1',
      clientId: clients[0].id,
      petId: pets[0].id,
      serviceId: services[0].id,
      veterinarianName: 'Dra. Camila Rocha',
      startTime,
      endTime,
      status: 'AGENDADO',
      googleEventId: 'gcal_test_123',
      googleCalendarHtmlLink: 'https://calendar.google.com/test',
      googleSyncStatus: 'SYNCED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    expect(newAppt.id).toBe('apt-test-1');
    expect(newAppt.clientName).toBe(clients[0].name);
    expect(newAppt.petName).toBe(pets[0].name);
    expect(newAppt.serviceName).toBe(services[0].name);

    // Atualiza status para CONFIRMADO
    const updated = repo.updateStatus('apt-test-1', 'CONFIRMADO');
    expect(updated?.status).toBe('CONFIRMADO');
  });
});
