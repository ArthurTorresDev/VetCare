import { describe, it, expect } from 'vitest';
import { AppointmentRepository } from '../../backend/src/repositories/appointment.repository';
import {
  calculateEndTime,
} from '../../packages/shared/src/index';

describe('Gestão de Agendamentos e Repositório Clínico', () => {
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
