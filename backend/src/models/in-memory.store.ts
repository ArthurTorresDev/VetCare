import {
  Client,
  Pet,
  ClinicService,
  Appointment,
  AuditLogEntry,
  EmailNotification,
  User,
  Veterinario,
  Atendente,
  Atendimento,
} from '@vetcare/shared';
import {
  initialClients,
  initialPets,
  initialServices,
  createInitialAppointments,
} from '../seeds/data.seed.js';

export class InMemoryStore {
  private static instance: InMemoryStore;

  public clientes: Client[] = [];
  public pets: Pet[] = [];
  public services: ClinicService[] = [];
  public appointments: Appointment[] = [];
  public auditLogs: AuditLogEntry[] = [];
  public emailNotifications: EmailNotification[] = [];
  public users: User[] = [];
  public veterinarios: Veterinario[] = [];
  public atendentes: Atendente[] = [];
  public atendimentos: Atendimento[] = [];

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
    this.clientes = [...initialClients];
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

    // Carga inicial alinhada ao vetcare.sql
    this.veterinarios = [
      {
        id: 'v1',
        nome: 'Dra. Camila Rocha',
        crmv: 'SP-12345',
        telefone: '(11) 98765-1111',
        email: 'camila.rocha@vetcare.com',
        criadoEm: new Date().toISOString(),
      },
      {
        id: 'v2',
        nome: 'Dr. Carlos Alberto',
        crmv: 'SP-67890',
        telefone: '(11) 98765-2222',
        email: 'carlos.alberto@vetcare.com',
        criadoEm: new Date().toISOString(),
      },
    ];

    this.atendentes = [
      {
        id: 'a1',
        nome: 'Ana Paula Santos',
        email: 'ana.santos@vetcare.com',
        telefone: '(11) 98765-3333',
        criadoEm: new Date().toISOString(),
      },
      {
        id: 'a2',
        nome: 'Marcos Vinicius',
        email: 'marcos.vinicius@vetcare.com',
        telefone: '(11) 98765-4444',
        criadoEm: new Date().toISOString(),
      },
    ];

    this.atendimentos = [
      {
        id: 'atend-001',
        petId: 'p1',
        veterinarioId: 'v1',
        atendenteId: 'a1',
        tipoServico: 'Consulta Clínica Geral',
        dataHora: new Date(Date.now() + 3600000).toISOString(),
        status: 'Agendado',
        observacoes: 'Paciente retorno vacinação',
        criadoEm: new Date().toISOString(),
      },
    ];
  }
}
