import {
  Appointment,
  AppointmentDetailedView,
  AppointmentStatus,
} from '@vetcare/shared';
import { InMemoryStore } from '../models/in-memory.store.js';

export class AppointmentRepository {
  private store: InMemoryStore;

  constructor(store: InMemoryStore = InMemoryStore.getInstance()) {
    this.store = store;
  }

  getClients() {
    return this.store.clients;
  }

  getPets() {
    return this.store.pets;
  }

  getServices() {
    return this.store.services;
  }

  findAll(): Appointment[] {
    return this.store.appointments;
  }

  findById(id: string): Appointment | undefined {
    return this.store.appointments.find((a) => a.id === id);
  }

  findDetailedById(id: string): AppointmentDetailedView | undefined {
    const appt = this.findById(id);
    return appt ? this.toDetailedView(appt) : undefined;
  }

  findAllDetailed(): AppointmentDetailedView[] {
    return this.store.appointments.map((a) => this.toDetailedView(a));
  }

  create(appointment: Appointment): AppointmentDetailedView {
    this.store.appointments.push(appointment);
    return this.toDetailedView(appointment);
  }

  update(id: string, updates: Partial<Appointment>): AppointmentDetailedView | undefined {
    const index = this.store.appointments.findIndex((a) => a.id === id);
    if (index === -1) return undefined;

    this.store.appointments[index] = {
      ...this.store.appointments[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    return this.toDetailedView(this.store.appointments[index]);
  }

  updateStatus(id: string, status: AppointmentStatus): AppointmentDetailedView | undefined {
    return this.update(id, { status });
  }

  toDetailedView(appt: Appointment): AppointmentDetailedView {
    const client = this.store.clients.find((c) => c.id === appt.clientId);
    const pet = this.store.pets.find((p) => p.id === appt.petId);
    const service = this.store.services.find((s) => s.id === appt.serviceId);

    return {
      ...appt,
      clientName: client?.name || 'Cliente Desconhecido',
      clientPhone: client?.phone || '-',
      clientEmail: client?.email || '-',
      petName: pet?.name || 'Pet Desconhecido',
      petSpecies: pet?.species || '-',
      petBreed: pet?.breed || '-',
      serviceName: service?.name || 'Serviço Personalizado',
      serviceCategory: service?.category || 'CONSULTA',
      servicePrice: service?.price || 0,
      serviceColor: service?.colorHex || '#0284c7',
    };
  }
}
