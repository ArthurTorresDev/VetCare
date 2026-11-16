import { API_URL } from '../config/constants';
import { GoogleStatusResponse } from '../types/index';
import { DateCheckResult } from '@vetcare/shared';

export async function fetchGoogleCalendarStatus(): Promise<GoogleStatusResponse> {
  const res = await fetch(`${API_URL}/google-calendar/status`);
  if (!res.ok) throw new Error('Falha ao obter status do Google Calendar');
  return res.json();
}

/**
 * Consulta a API para verificar se a data/hora selecionada é feriado nacional
 * ou horário especial da clínica MedPet.
 */
export async function checkDateAvailability(date: string, time?: string): Promise<DateCheckResult> {
  const url = new URL(`${API_URL}/google-calendar/check-date`);
  url.searchParams.set('date', date);
  if (time) url.searchParams.set('time', time);

  const res = await fetch(url.toString());
  if (!res.ok) {
    // Retorna fallback limpo para não bloquear caso a rede oscile
    return {
      date,
      time,
      isHoliday: false,
      isSunday: false,
      isSaturdayAfternoon: false,
      isOutsideClinicHours: false,
      hasWarning: false,
      warnings: [],
    };
  }
  return res.json();
}

export async function fetchHolidays(year?: number): Promise<{ year: number; count: number; holidays: any[] }> {
  const yr = year || new Date().getFullYear();
  const res = await fetch(`${API_URL}/google-calendar/holidays?year=${yr}`);
  if (!res.ok) return { year: yr, count: 0, holidays: [] };
  return res.json();
}
