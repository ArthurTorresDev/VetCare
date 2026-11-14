/**
 * @vetcare/shared - Domínio Central de Agendamento, Entidades, DTOs e Utilitários
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

// ─── Estilos e UI Helpers ─────────────────────────────────────────────────────

export interface ServiceStyleClass {
  borderLeft: string;
  badgeBg: string;
  badgeText: string;
  dot: string;
  iconBg: string;
  iconText: string;
  bannerBg: string;
}

export const SERVICE_STYLES: Record<string, ServiceStyleClass> = {
  CIRURGIA: {
    borderLeft: 'border-l-indigo-500',
    badgeBg: 'bg-indigo-50',
    badgeText: 'text-indigo-600',
    dot: 'bg-indigo-500',
    iconBg: 'bg-indigo-50',
    iconText: 'text-indigo-500',
    bannerBg: 'bg-indigo-50/70 border border-indigo-100 text-indigo-700',
  },
  VACINA: {
    borderLeft: 'border-l-teal-500',
    badgeBg: 'bg-teal-50',
    badgeText: 'text-teal-600',
    dot: 'bg-teal-500',
    iconBg: 'bg-teal-50',
    iconText: 'text-teal-500',
    bannerBg: 'bg-teal-50/70 border border-teal-100 text-teal-700',
  },
  EMERGENCIA: {
    borderLeft: 'border-l-rose-500',
    badgeBg: 'bg-rose-50',
    badgeText: 'text-rose-600',
    dot: 'bg-rose-500',
    iconBg: 'bg-rose-50',
    iconText: 'text-rose-500',
    bannerBg: 'bg-rose-50/70 border border-rose-100 text-rose-700',
  },
  CHECKUP: {
    borderLeft: 'border-l-amber-500',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-600',
    dot: 'bg-amber-500',
    iconBg: 'bg-amber-50',
    iconText: 'text-amber-500',
    bannerBg: 'bg-amber-50/70 border border-amber-100 text-amber-700',
  },
  RETORNO: {
    borderLeft: 'border-l-pink-500',
    badgeBg: 'bg-pink-50',
    badgeText: 'text-pink-600',
    dot: 'bg-pink-500',
    iconBg: 'bg-pink-50',
    iconText: 'text-pink-500',
    bannerBg: 'bg-pink-50/70 border border-pink-100 text-pink-700',
  },
};

export const DEFAULT_SERVICE_STYLE: ServiceStyleClass = {
  borderLeft: 'border-l-emerald-500',
  badgeBg: 'bg-emerald-50',
  badgeText: 'text-emerald-600',
  dot: 'bg-emerald-500',
  iconBg: 'bg-emerald-50',
  iconText: 'text-emerald-500',
  bannerBg: 'bg-emerald-50/70 border border-emerald-100 text-emerald-700',
};

export function getServiceStyleClass(category: string): ServiceStyleClass {
  return SERVICE_STYLES[category] ?? DEFAULT_SERVICE_STYLE;
}

export function getPetIcon(species?: string): string {
  if (!species) return 'ph-paw-print';
  const s = species.toLowerCase();
  if (s.includes('gato') || s.includes('felino')) return 'ph-cat';
  if (s.includes('cão') || s.includes('cao') || s.includes('cachorro') || s.includes('canino'))
    return 'ph-dog';
  if (s.includes('ave') || s.includes('pássaro') || s.includes('passaro') || s.includes('papagaio'))
    return 'ph-bird';
  return 'ph-paw-print';
}

export function formatCurrencyBRL(amount: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount);
}

// ─── Formatação de Datas (Padrão Brasileiro) ──────────────────────────────────

export function formatDateBR(dateInput: string | Date): string {
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return '-';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}/${d.getFullYear()}`;
}

export function formatTimeBR(dateInput: string | Date): string {
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return '-';
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export function formatDateTimeBR(dateInput: string | Date): string {
  return `${formatDateBR(dateInput)} às ${formatTimeBR(dateInput)}`;
}

export function calculateAgeDescription(birthDateString?: string): string {
  if (!birthDateString) return 'Idade não informada';
  const birth = new Date(birthDateString);
  if (isNaN(birth.getTime())) return 'Idade não informada';
  const now = new Date();
  const monthsDiff = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
  if (monthsDiff < 1) return 'Menos de 1 mês';
  if (monthsDiff < 12) return `${monthsDiff} ${monthsDiff === 1 ? 'mês' : 'meses'}`;
  const years = Math.floor(monthsDiff / 12);
  const remainingMonths = monthsDiff % 12;
  if (remainingMonths === 0) return `${years} ${years === 1 ? 'ano' : 'anos'}`;
  return `${years}a ${remainingMonths}m`;
}

// ─── Utilitários de Negócio e KPIs ─────────────────────────────────────────────

export function calculateAppointmentStats(appointments: AppointmentDetailedView[]): AppointmentKPIStats {
  const todayIso = new Date().toISOString().split('T')[0];
  const todayAppts = appointments.filter((a) => a.startTime.startsWith(todayIso));

  let scheduled = 0;
  let confirmed = 0;
  let inProgress = 0;
  let completed = 0;
  let cancelled = 0;
  let revenueProjected = 0;

  for (const a of todayAppts) {
    if (a.status === 'AGENDADO') scheduled++;
    else if (a.status === 'CONFIRMADO') confirmed++;
    else if (a.status === 'EM_ATENDIMENTO') inProgress++;
    else if (a.status === 'CONCLUIDO') completed++;
    else if (a.status === 'CANCELADO') cancelled++;

    if (a.status !== 'CANCELADO') {
      revenueProjected += a.servicePrice || 0;
    }
  }

  // Considerando 12 horas úteis por dia (07:00 às 19:00 = 12 slots base de 1 hora)
  const nonCancelledCount = todayAppts.length - cancelled;
  const occupancyRatePct = Math.min(100, Math.round((nonCancelledCount / 12) * 100));

  return {
    totalToday: todayAppts.length,
    scheduled,
    confirmed,
    inProgress,
    completed,
    cancelled,
    revenueProjected,
    occupancyRatePct,
  };
}

/** Retorna tutores cujo nome contém o termo digitado (mínimo 2 caracteres) */
export function filterClientsByPrefix(clients: Client[], query: string): Client[] {
  const trimmed = query.trim().toLowerCase();
  if (trimmed.length < 2) return [];
  return clients.filter((c) => c.name.toLowerCase().includes(trimmed));
}

/** Calcula a data de término a partir do início e duração */
export function calculateEndTime(startTimeIso: string, durationMinutes: number): string {
  const start = new Date(startTimeIso);
  if (isNaN(start.getTime())) throw new Error('Data de início inválida.');
  return new Date(start.getTime() + durationMinutes * 60_000).toISOString();
}

/** Verifica sobreposição de dois intervalos de tempo */
export function isOverlapping(startA: Date, endA: Date, startB: Date, endB: Date): boolean {
  return startA.getTime() < endB.getTime() && endA.getTime() > startB.getTime();
}

/** Verifica conflito com agendamentos existentes (ignora cancelados) */
export function hasScheduleConflict(
  existingAppointments: Appointment[],
  newStartIso: string,
  newEndIso: string,
  ignoreAppointmentId?: string,
): { hasConflict: boolean; conflictingWith?: Appointment } {
  const newStart = new Date(newStartIso);
  const newEnd = new Date(newEndIso);
  for (const appt of existingAppointments) {
    if (appt.id === ignoreAppointmentId || appt.status === 'CANCELADO') continue;
    if (isOverlapping(newStart, newEnd, new Date(appt.startTime), new Date(appt.endTime))) {
      return { hasConflict: true, conflictingWith: appt };
    }
  }
  return { hasConflict: false };
}

/** Formata payload para a API do Google Calendar */
export function formatGoogleCalendarEventPayload(params: {
  appointmentId: string;
  clientName: string;
  clientPhone: string;
  petName: string;
  serviceName: string;
  veterinarianName: string;
  startTime: string;
  endTime: string;
  notes?: string;
  clinicAddress?: string;
}) {
  return {
    summary: `[MedPet] ${params.serviceName}: ${params.petName} (Tutor: ${params.clientName})`,
    description: [
      `🐾 PACIENTE: ${params.petName}`,
      `👤 TUTOR: ${params.clientName} (Tel: ${params.clientPhone})`,
      `🩺 SERVIÇO: ${params.serviceName}`,
      `👨‍⚕️ VETERINÁRIO: ${params.veterinarianName}`,
      params.notes ? `📝 OBSERVAÇÕES: ${params.notes}` : null,
      `🔗 ID SISTEMA MEDPET: ${params.appointmentId}`,
    ]
      .filter(Boolean)
      .join('\n'),
    location: params.clinicAddress || 'Clínica Veterinária MedPet - Rua dos Pets, 100',
    start: { dateTime: params.startTime, timeZone: 'America/Sao_Paulo' },
    end: { dateTime: params.endTime, timeZone: 'America/Sao_Paulo' },
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'popup', minutes: 30 },
        { method: 'email', minutes: 120 },
      ],
    },
  };
}

// ─── Exportação XML ───────────────────────────────────────────────────────────

export function generateAppointmentsXml(appointments: AppointmentDetailedView[]): string {
  const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>';
  const xmlNodes = appointments
    .map(
      (a) => `  <agendamento id="${escapeXml(a.id)}">
    <status>${escapeXml(a.status)}</status>
    <tutor nome="${escapeXml(a.clientName)}" telefone="${escapeXml(a.clientPhone)}" email="${escapeXml(a.clientEmail)}" />
    <paciente nome="${escapeXml(a.petName)}" especie="${escapeXml(a.petSpecies)}" raca="${escapeXml(a.petBreed)}" />
    <servico nome="${escapeXml(a.serviceName)}" categoria="${escapeXml(a.serviceCategory)}" valor="${a.servicePrice.toFixed(2)}" />
    <veterinario>${escapeXml(a.veterinarianName)}</veterinario>
    <horario inicio="${escapeXml(formatDateBR(a.startTime))} ${escapeXml(formatTimeBR(a.startTime))}" termino="${escapeXml(formatDateBR(a.endTime))} ${escapeXml(formatTimeBR(a.endTime))}" />
    <googleCalendar eventId="${escapeXml(a.googleEventId || '')}" status="${escapeXml(a.googleSyncStatus)}" />
    <observacoes>${escapeXml(a.notes || '')}</observacoes>
  </agendamento>`,
    )
    .join('\n');

  return `${xmlHeader}\n<relatorioAgendamentos clinica="MedPet / VetCare" total="${appointments.length}" geradoEm="${new Date().toISOString()}">\n${xmlNodes}\n</relatorioAgendamentos>`;
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// ─── Utilitário de Calendário ─────────────────────────────────────────────────

export function getDateRange(period: PeriodFilter, reference: Date = new Date()): Date[] {
  const start = new Date(reference);
  start.setHours(0, 0, 0, 0);

  switch (period) {
    case 'HOJE':
      return [start];
    case 'SEMANA': {
      const weekStart = new Date(start);
      weekStart.setDate(start.getDate() - start.getDay());
      return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(weekStart);
        d.setDate(weekStart.getDate() + i);
        return d;
      });
    }
    case 'MES': {
      const monthStart = new Date(start.getFullYear(), start.getMonth(), 1);
      const daysInMonth = new Date(start.getFullYear(), start.getMonth() + 1, 0).getDate();
      return Array.from({ length: daysInMonth }, (_, i) => {
        const d = new Date(monthStart);
        d.setDate(monthStart.getDate() + i);
        return d;
      });
    }
    case 'ANO': {
      const year = start.getFullYear();
      return Array.from({ length: 12 }, (_, i) => new Date(year, i, 1));
    }
  }
}
