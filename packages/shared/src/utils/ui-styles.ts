import { AppointmentDetailedView, AppointmentKPIStats } from '../models/types.js';

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

export function formatCurrencyBRL(amount: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount);
}

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
