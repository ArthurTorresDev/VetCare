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

export type AtendimentoStatus =
  | 'Agendado'
  | 'Confirmado'
  | 'Em Atendimento'
  | 'Concluído'
  | 'Cancelado'
  | string;

// ─── Entidades vetcare.sql ─────────────────────────────────────────────────────

export interface Veterinario {
  id: string;
  nome: string;
  crmv: string;
  telefone?: string;
  email: string;
  criadoEm?: string;
}

export interface Atendente {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  criadoEm?: string;
}

export interface Atendimento {
  id: string;
  petId: string;
  veterinarioId: string;
  atendenteId: string;
  tipoServico: string;
  dataHora: string;
  status: string;
  observacoes?: string;
  criadoEm?: string;
}

export type GoogleCalendarioSyncStatus =
  | 'SYNCED'
  | 'PENDING'
  | 'FAILED'
  | 'MOCKED';

// ─── Tipos de Filtro de Período ───────────────────────────────────────────────

export type PeriodFilter = 'HOJE' | 'SEMANA' | 'MES' | 'ANO';

// ─── Verificação de Feriados e Disponibilidade (Brasil API) ─────────

export interface DateCheckResult {
  date: string;
  dateBR?: string;
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
  whatsapp?: string;
  endereco?: string;
  createdAt: string;
}

export interface Pet {
  id: string;
  clientId: string;
  name: string;
  species: 'Cão' | 'Gato' | 'Ave' | 'Outro' | string;
  breed: string;
  sex?: 'Macho' | 'Fêmea' | string;
  birthDate?: string;
  weightKg?: number;
  fotoUrl?: string;
  alergiasMedicamentos?: string;
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
  googleCalendarioHtmlLink?: string;
  googleSyncStatus: GoogleCalendarioSyncStatus;
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
  action: 'CREATE' | 'UPDATE_STATUS' | 'RESCHEDULE' | 'CANCEL' | 'SYNC_GCAL' | 'REGISTER' | 'LOGIN' | 'LOGOUT' | 'PASSWORD_CHANGE' | 'ACCOUNT_DELETE';
  targetId: string;
  targetType: 'APPOINTMENT' | 'CLIENT' | 'PET' | 'SERVICE' | 'USER' | 'AUTH';
  user: string;
  details: string;
}

// ─── Autenticação e Gestão de Usuários ─────────────────────────────────────────

export type UserRole = 'ADMIN' | 'VET' | 'RECEPTIONIST' | 'CLIENT';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  phone?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export type PublicUser = Omit<User, 'passwordHash'>;

export interface RegisterUserDTO {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
  phone?: string;
  role?: UserRole;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface UpdateUserDTO {
  name?: string;
  email?: string;
  phone?: string;
}

export interface ChangePasswordDTO {
  currentPassword: string;
  newPassword: string;
  confirmPassword?: string;
}

export interface DeleteAccountDTO {
  password: string;
  confirmation: string;
}

export interface AuthResponse {
  user: PublicUser;
  token: string;
  expiresIn: string;
  tokenType: 'Bearer';
}

export interface TokenPayload {
  sub: string;
  email: string;
  role: UserRole;
  jti: string;
  iat: number;
  exp: number;
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
