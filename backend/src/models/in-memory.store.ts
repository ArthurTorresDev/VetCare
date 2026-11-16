import {
  Client,
  Pet,
  ClinicService,
  Appointment,
  AuditLogEntry,
  EmailNotification,
  User,
} from '@vetcare/shared';
import {
  initialClients,
  initialPets,
  initialServices,
  createInitialAppointments,
} from '../seeds/data.seed.js';

export class InMemoryStore {
  private static instance: InMemoryStore;

  public clients: Client[] = [];
  public pets: Pet[] = [];
  public services: ClinicService[] = [];
  public appointments: Appointment[] = [];
  public auditLogs: AuditLogEntry[] = [];
  public emailNotifications: EmailNotification[] = [];
  public users: User[] = [];

  private constructor() {
    this.reset();
  }

  public static getInstance(): InMemoryStore {
    if (!InMemoryStore.instance) {
      InMemoryStore.instance = new InMemoryStore();
    }
    return InMemoryStore.instance;
  }

  public reset(): void {
    this.clients = [...initialClients];
    this.pets = [...initialPets];
    this.services = [...initialServices];
    this.appointments = createInitialAppointments();
    this.auditLogs = [
      {
        id: 'log-init-001',
        timestamp: new Date().toISOString(),
        action: 'CREATE',
        targetId: 'apt-001',
        targetType: 'APPOINTMENT',
        user: 'Sistema (Inicialização)',
        details: 'Carga inicial de agendamentos para Thor (Tutor: Arthur Steiner)',
      },
    ];
    this.emailNotifications = [];
    this.users = [];
  }
}
