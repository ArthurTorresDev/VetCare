/**
 * @vetcare/shared - Modelos de Domínio, Entidades e DTOs
 */

// ─── Tipos de Status ──────────────────────────────────────────────────────────

export type AppointmentStatus =
  | 'AGENDADO'
  | 'CONFIRMADO'
  | 'EM_ATENDIMENTO'
  | 'CONCLUIDO'
  | 'CANCELADO'
  | 'NAO_COMPARECEU';

export type GoogleCalendarSyncStatus =
  | 'SYNCED'
  | 'PENDING'
  | 'FAILED'
  | 'MOCKED';

// ─── Tipos de Filtro de Período ───────────────────────────────────────────────

export type PeriodFilter = 'HOJE' | 'SEMANA' | 'MES' | 'ANO';

// ─── Verificação de Feriados e Disponibilidade (Google Calendar API) ─────────

export interface DateCheckResult {
  date: string;
  time?: string;
  isHoliday: boolean;
  holidayName?: string;
  isSunday: boolean;
  isSaturdayAfternoon: boolean;
  isOutsideClinicHours: boolean;
  hasWarning: boolean;
  warnings: string[];
}

// ─── Entidades ────────────────────────────────────────────────────────────────

export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  cpf?: string;
  createdAt: string;
}

export interface Pet {
  id: string;
  clientId: string;
  name: string;
  species: 'Cão' | 'Gato' | 'Ave' | 'Outro';
  breed: string;
  sex?: 'Macho' | 'Fêmea';
  birthDate?: string;
  weightKg?: number;
  notes?: string;
}

export type ServiceCategory =
  | 'CONSULTA'
  | 'VACINA'
  | 'CIRURGIA'
  | 'CHECKUP'
  | 'RETORNO'
  | 'EMERGENCIA';

export interface ClinicService {
  id: string;
  name: string;
  category: ServiceCategory;
  durationMinutes: number;
  price: number;
  description?: string;
  colorHex: string;
  isActive: boolean;
  requiredProfessional?: string;
  requiredResource?: string;
  instructions?: string;
}

export interface Appointment {
  id: string;
  clientId: string;
  petId: string;
  serviceId: string;
  veterinarianName: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  notes?: string;
  googleEventId?: string;
  googleCalendarHtmlLink?: string;
  googleSyncStatus: GoogleCalendarSyncStatus;
  googleSyncError?: string;
  createdByUser?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAppointmentDTO {
  clientId: string;
  petId: string;
  serviceId: string;
  veterinarianName?: string;
  startTime: string;
  durationMinutes?: number;
  notes?: string;
  createdByUser?: string;
}

export interface UpdateAppointmentDTO {
  clientId?: string;
  petId?: string;
  serviceId?: string;
  veterinarianName?: string;
  startTime?: string;
  durationMinutes?: number;
  status?: AppointmentStatus;
  notes?: string;
  updatedByUser?: string;
}

export interface AppointmentDetailedView extends Appointment {
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  petName: string;
  petSpecies: string;
  petBreed: string;
  serviceName: string;
  serviceCategory: ServiceCategory;
  servicePrice: number;
  serviceColor: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: 'CREATE' | 'UPDATE_STATUS' | 'RESCHEDULE' | 'CANCEL' | 'SYNC_GCAL';
  targetId: string;
  targetType: 'APPOINTMENT' | 'CLIENT' | 'PET' | 'SERVICE';
  user: string;
  details: string;
}

export type NotificationType =
  | 'CONFIRMACAO'
  | 'LEMBRETE'
  | 'ALTERACAO'
  | 'CANCELAMENTO';

export interface EmailNotification {
  id: string;
  appointmentId: string;
  type: NotificationType;
  recipientEmail: string;
  recipientName: string;
  subject: string;
  body: string;
  status: 'SENT' | 'QUEUED' | 'FAILED';
  createdAt: string;
}

export interface AppointmentKPIStats {
  totalToday: number;
  scheduled: number;
  confirmed: number;
  inProgress: number;
  completed: number;
  cancelled: number;
  revenueProjected: number;
  occupancyRatePct: number;
}
