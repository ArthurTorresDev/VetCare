import { PeriodFilter } from '../models/types.js';

/**
 * Formatação de data no padrão brasileiro (DD/MM/AAAA).
 */
export function formatDateBR(dateInput: string | Date): string {
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return '-';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}/${d.getFullYear()}`;
}

/**
 * Formatação de horário no padrão brasileiro (HH:mm).
 */
export function formatTimeBR(dateInput: string | Date): string {
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return '-';
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

/**
 * Formatação de data e horário completa em padrão brasileiro.
 */
export function formatDateTimeBR(dateInput: string | Date): string {
  return `${formatDateBR(dateInput)} às ${formatTimeBR(dateInput)}`;
}

/**
 * Calcula a data de término a partir do início e duração em minutos.
 */
export function calculateEndTime(startTimeIso: string, durationMinutes: number): string {
  const start = new Date(startTimeIso);
  if (isNaN(start.getTime())) throw new Error('Data de início inválida.');
  return new Date(start.getTime() + durationMinutes * 60_000).toISOString();
}

/**
 * Retorna os dias do intervalo com base no filtro de período.
 */
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
