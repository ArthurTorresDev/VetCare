/**
 * Serviço Centralizado de Feriados Nacionais - Brasil API & Regras MedPet
 * - Consulta exclusiva via GET https://brasilapi.com.br/api/feriados/v1/{ano}
 * - Cache persistente (PostgreSQL / In-Memory Store centralizado)
 * - Exatamente UMA requisição externa por ano
 * - Proteção contra chamadas simultâneas (in-flight promise lock por ano)
 * - Fallback resiliente offline (Algoritmo Meeus/Jones/Butcher)
 * - Identificação em formato DD-MM-YYYY e YYYY-MM-DD
 */

import { holidayRepository, HolidayEntity } from '../repositories/holiday.repository.js';

export interface BrasilApiHoliday {
  date: string; // YYYY-MM-DD
  name: string;
  type: string;
}

export interface DateCheckResult {
  date: string; // YYYY-MM-DD
  dateBR: string; // DD-MM-YYYY
  time?: string;
  isHoliday: boolean;
  holidayName?: string;
  isSunday: boolean;
  isSaturdayAfternoon: boolean;
  isOutsideClinicHours: boolean;
  hasWarning: boolean;
  warnings: string[];
}

export interface HolidayEntry {
  date: string; // YYYY-MM-DD
  dateBR: string; // DD-MM-YYYY
  name: string;
  type: 'national' | 'custom';
}

export class HolidayService {
  // Controle de promessas ativas para impedir requisições simultâneas para o mesmo ano
  private inFlightSyncs: Map<number, Promise<HolidayEntry[]>> = new Map();
  // Cache rápido em memória para requisições frequentes no mesmo ciclo de vida do backend
  private memoryCache: Map<number, HolidayEntry[]> = new Map();

  /**
   * Converte data ISO (YYYY-MM-DD) para formato brasileiro padrão (DD-MM-YYYY)
   */
  public toBRFormat(dateStr: string): string {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const [y, m, d] = parts;
      return `${d}-${m}-${y}`;
    }
    return dateStr;
  }

  /**
   * Converte formato brasileiro (DD-MM-YYYY) para ISO (YYYY-MM-DD)
   */
  public toISOFormat(dateStr: string): string {
    const parts = dateStr.split('-');
    if (parts.length === 3 && parts[0].length === 2) {
      const [d, m, y] = parts;
      return `${y}-${m}-${d}`;
    }
    return dateStr;
  }

  /**
   * Normaliza nome do feriado mantendo boa apresentação
   */
  private normalizeHolidayName(name: string): string {
    if (!name) return '';
    const lowercaseWords = new Set(['da', 'de', 'do', 'das', 'dos', 'e']);
    return name
      .trim()
      .split(/\s+/)
      .map((word, idx) => {
        const lower = word.toLowerCase();
        if (idx > 0 && lowercaseWords.has(lower)) {
          return lower;
        }
        return lower.charAt(0).toUpperCase() + lower.slice(1);
      })
      .join(' ');
  }

  /**
   * Algoritmo determinístico Meeus/Jones/Butcher para Páscoa e feriados móveis.
   * Usado exclusivamente como fallback de segurança caso a Brasil API esteja indisponível.
   */
  public getOfflineDeterministicHolidays(year: number): HolidayEntry[] {
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31);
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    const easter = new Date(Date.UTC(year, month - 1, day));

    const fmt = (base: Date, days: number) => {
      const copy = new Date(base.getTime());
      copy.setUTCDate(copy.getUTCDate() + days);
      return copy.toISOString().split('T')[0];
    };

    const carnival = fmt(easter, -47);
    const goodFriday = fmt(easter, -2);
    const corpusChristi = fmt(easter, 60);

    const list: Array<{ date: string; name: string }> = [
      { date: `${year}-01-01`, name: 'Confraternização Universal' },
      { date: carnival, name: 'Carnaval' },
      { date: goodFriday, name: 'Sexta-feira Santa' },
      { date: easter.toISOString().split('T')[0], name: 'Páscoa' },
      { date: `${year}-04-21`, name: 'Tiradentes' },
      { date: `${year}-05-01`, name: 'Dia Mundial do Trabalho' },
      { date: corpusChristi, name: 'Corpus Christi' },
      { date: `${year}-09-07`, name: 'Independência do Brasil' },
      { date: `${year}-10-12`, name: 'Nossa Senhora Aparecida' },
      { date: `${year}-11-02`, name: 'Finados' },
      { date: `${year}-11-15`, name: 'Proclamação da República' },
      { date: `${year}-11-20`, name: 'Dia Nacional de Zumbi e da Consciência Negra' },
      { date: `${year}-12-25`, name: 'Natal' },
    ];

    return list.map((item) => ({
      date: item.date,
      dateBR: this.toBRFormat(item.date),
      name: item.name,
      type: 'national',
    }));
  }

  /**
   * Obtém feriados de um determinado ano.
   * Se já existirem no repositório persistido ou cache, reutiliza sem fazer nova chamada externa.
   * Se for um novo ano sem dados, consulta a Brasil API apenas UMA vez.
   */
  public async getHolidaysByYear(year: number): Promise<HolidayEntry[]> {
    // 1. Verifica cache rápido de memória
    if (this.memoryCache.has(year)) {
      return this.memoryCache.get(year)!;
    }

    // 2. Verifica repositório persistente (PostgreSQL / In-memory centralizado)
    const persisted = await holidayRepository.findByYear(year);
    if (persisted.length > 0) {
      const formatted: HolidayEntry[] = persisted.map((p) => ({
        date: p.data_feriado,
        dateBR: this.toBRFormat(p.data_feriado),
        name: p.nome,
        type: 'national',
      }));
      this.memoryCache.set(year, formatted);
      return formatted;
    }

    // 3. Se já existe uma requisição em andamento para este ano, aguarda a mesma (evita requisições concorrentes)
    if (this.inFlightSyncs.has(year)) {
      return await this.inFlightSyncs.get(year)!;
    }

    // 4. Inicia consulta à Brasil API protegida por lock
    const syncPromise = (async () => {
      try {
        console.log(`[HolidayService] Consultando Brasil API para o ano ${year}: https://brasilapi.com.br/api/feriados/v1/${year}`);
        const response = await fetch(`https://brasilapi.com.br/api/feriados/v1/${year}`, {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            'User-Agent': 'VetCare-MedPet-Application',
          },
        });

        if (response.ok) {
          const data: BrasilApiHoliday[] = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            const holidaysToSave = data.map((item) => ({
              ano: year,
              data_feriado: item.date,
              nome: this.normalizeHolidayName(item.name),
              tipo: item.type || 'national',
            }));

            const saved = await holidayRepository.saveBatch(year, holidaysToSave);
            const result: HolidayEntry[] = saved.map((s) => ({
              date: s.data_feriado,
              dateBR: this.toBRFormat(s.data_feriado),
              name: s.nome,
              type: 'national',
            }));

            this.memoryCache.set(year, result);
            return result;
          }
        } else {
          console.warn(`[HolidayService] Brasil API retornou HTTP ${response.status} para o ano ${year}. Ativando gerador determinístico.`);
        }
      } catch (err) {
        console.error(`[HolidayService] Falha de conexão com a Brasil API para o ano ${year}:`, err);
      }

      // Se falhou ou API offline, usa fallback offline seguro e persiste para não tentar repetir desnecessariamente
      const offlineHolidays = this.getOfflineDeterministicHolidays(year);
      await holidayRepository.saveBatch(
        year,
        offlineHolidays.map((h) => ({
          ano: year,
          data_feriado: h.date,
          nome: h.name,
          tipo: 'national',
        }))
      );
      this.memoryCache.set(year, offlineHolidays);
      return offlineHolidays;
    })();

    this.inFlightSyncs.set(year, syncPromise);

    try {
      return await syncPromise;
    } finally {
      this.inFlightSyncs.delete(year);
    }
  }

  /**
   * Verifica se uma data específica (em formato YYYY-MM-DD ou DD-MM-YYYY) é feriado nacional
   */
  public async isHoliday(dateInput: string): Promise<{ isHoliday: boolean; holidayName?: string }> {
    const isoDate = dateInput.includes('/') ? dateInput.replace(/\//g, '-') : dateInput;
    const dateFormatted = this.toISOFormat(isoDate);
    const [yStr] = dateFormatted.split('-');
    const year = parseInt(yStr, 10);

    if (isNaN(year)) {
      return { isHoliday: false };
    }

    const holidays = await this.getHolidaysByYear(year);
    const found = holidays.find((h) => h.date === dateFormatted || h.dateBR === this.toBRFormat(dateFormatted));

    return {
      isHoliday: !!found,
      holidayName: found?.name,
    };
  }

  /**
   * Checagem unificada de regras operacionais de data e horário da MedPet
   */
  public async checkDate(dateStr: string, timeStr?: string): Promise<DateCheckResult> {
    const rawClean = dateStr.includes('/') ? dateStr.replace(/\//g, '-') : dateStr;
    const isoDate = this.toISOFormat(rawClean);
    const brDate = this.toBRFormat(isoDate);

    const [yStr, mStr, dStr] = isoDate.split('-');
    const year = parseInt(yStr, 10);
    const month = parseInt(mStr, 10);
    const day = parseInt(dStr, 10);

    const holidays = await this.getHolidaysByYear(year);
    const holiday = holidays.find((h) => h.date === isoDate || h.dateBR === brDate);

    // Evitar timezone drift usando Date.UTC
    const dateObj = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
    const dayOfWeek = dateObj.getUTCDay(); // 0 = Domingo, 6 = Sábado

    const warnings: string[] = [];
    const isSunday = dayOfWeek === 0;
    let isSaturdayAfternoon = false;
    let isOutsideClinicHours = false;

    // 1. Alerta de Feriado Nacional
    if (holiday) {
      warnings.push(
        `Atenção: ${dStr}/${mStr}/${year} é Feriado Nacional (${holiday.name}). A MedPet pode não ter expediente ou operar em escala de plantão/emergência.`
      );
    }

    // 2. Alerta de Domingo
    if (isSunday) {
      warnings.push('A clínica MedPet não possui expediente aos domingos.');
    }

    // 3. Alertas de Horário de Atendimento da MedPet
    if (timeStr) {
      const [hourStr, minStr] = timeStr.split(':');
      const totalMinutes = parseInt(hourStr, 10) * 60 + parseInt(minStr, 10);

      if (dayOfWeek === 6) {
        // Sábado: 08:30 (510 min) às 12:30 (750 min)
        if (totalMinutes < 510 || totalMinutes > 750) {
          isSaturdayAfternoon = totalMinutes > 750;
          isOutsideClinicHours = true;
          warnings.push('Aos sábados, o expediente da MedPet é exclusivamente das 08:30 às 12:30.');
        }
      } else if (!isSunday) {
        // Segunda a Sexta: 08:00 (480 min) às 17:30 (1050 min)
        if (totalMinutes < 480 || totalMinutes > 1050) {
          isOutsideClinicHours = true;
          warnings.push('O expediente regular de segunda a sexta é das 08:00 às 17:30.');
        }
      }
    }

    return {
      date: isoDate,
      dateBR: brDate,
      time: timeStr,
      isHoliday: !!holiday,
      holidayName: holiday?.name,
      isSunday,
      isSaturdayAfternoon,
      isOutsideClinicHours,
      hasWarning: warnings.length > 0,
      warnings,
    };
  }
}

export const holidayService = new HolidayService();
