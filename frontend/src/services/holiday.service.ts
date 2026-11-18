import { API_URL } from '../config/constants';
import { DateCheckResult } from '@vetcare/shared';

export interface HolidayItem {
  date: string; // YYYY-MM-DD
  dateBR: string; // DD-MM-YYYY
  name: string;
  type: string;
}

/**
 * Cache compartilhado em memória no frontend por ano (evita requisições repetidas ao trocar de abas)
 */
const frontendHolidayCache = new Map<number, Promise<HolidayItem[]>>();
const checkedHolidaysMap = new Map<string, HolidayItem>();

/**
 * Formata data no padrão brasileiro DD-MM-YYYY
 */
export function formatToDateBR(dateStr: string): string {
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    if (parts[0].length === 4) {
      // YYYY-MM-DD -> DD-MM-YYYY
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
  }
  return dateStr;
}

/**
 * Formata data no padrão ISO YYYY-MM-DD
 */
export function formatToDateISO(dateStr: string): string {
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    if (parts[0].length === 2) {
      // DD-MM-YYYY -> YYYY-MM-DD
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
  }
  return dateStr;
}

/**
 * Consulta a lista centralizada de feriados nacionais de determinado ano.
 * Realiza requisição apenas quando ainda não estiver em cache.
 */
export async function fetchHolidays(year?: number): Promise<HolidayItem[]> {
  const yr = year || new Date().getFullYear();

  if (frontendHolidayCache.has(yr)) {
    return frontendHolidayCache.get(yr)!;
  }

  const promise = (async () => {
    try {
      const res = await fetch(`${API_URL}/holidays?year=${yr}`);
      if (!res.ok) {
        throw new Error(`Erro ao buscar feriados para o ano ${yr}`);
      }
      const data = await res.json();
      const list: HolidayItem[] = data.holidays || [];
      list.forEach((h) => {
        checkedHolidaysMap.set(h.date, h);
        checkedHolidaysMap.set(h.dateBR, h);
      });
      return list;
    } catch (err) {
      console.warn(`[HolidayService] Falha ao carregar feriados para ${yr}:`, err);
      return [];
    }
  })();

  frontendHolidayCache.set(yr, promise);
  return promise;
}

/**
 * Validação centralizada de agendamento em feriado / horário de expediente.
 * Utiliza o backend com cache persistente da Brasil API.
 */
export async function checkDateAvailability(date: string, time?: string): Promise<DateCheckResult> {
  const cleanDate = date.includes('/') ? date.replace(/\//g, '-') : date;
  const isoDate = formatToDateISO(cleanDate);
  const brDate = formatToDateBR(isoDate);

  const url = new URL(`${API_URL}/holidays/check-date`);
  url.searchParams.set('date', isoDate);
  if (time) url.searchParams.set('time', time);

  try {
    const res = await fetch(url.toString());
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('[checkDateAvailability] Erro ao consultar backend:', err);
  }

  // Fallback seguro usando cache local se disponível
  const holiday = checkedHolidaysMap.get(isoDate) || checkedHolidaysMap.get(brDate);
  return {
    date: isoDate,
    dateBR: brDate,
    time,
    isHoliday: !!holiday,
    holidayName: holiday?.name,
    isSunday: false,
    isSaturdayAfternoon: false,
    isOutsideClinicHours: false,
    hasWarning: !!holiday,
    warnings: holiday ? [`Data informada coincide com o Feriado Nacional: ${holiday.name}`] : [],
  };
}
