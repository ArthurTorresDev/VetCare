/**
 * Serviço de Verificação de Feriados e Horários de Atendimento da MedPet
 * - Integra com o Calendário Oficial de Feriados do Google Calendar (pt.brazilian#holiday@group.v.calendar.google.com)
 * - Fallback inteligente com BrasilAPI e motor offline de feriados nacionais brasileiros
 * - Respeita as regras de atendimento da MedPet (Seg-Sex 8h-17h30, Sáb 8h30-12h30, Dom Fechado)
 */

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

export interface HolidayEntry {
  date: string; // YYYY-MM-DD
  name: string;
  type: 'national' | 'custom';
}

export class HolidayService {
  private cacheHolidaysByYear: Map<number, HolidayEntry[]> = new Map();

  /**
   * Calcula feriados móveis baseados na data da Páscoa (Algoritmo de Meeus/Jones/Butcher)
   */
  private calculateEaster(year: number): Date {
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
    const month = Math.floor((h + l - 7 * m + 114) / 31); // 3 = Março, 4 = Abril
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(Date.UTC(year, month - 1, day));
  }

  /**
   * Gera lista completa de feriados nacionais brasileiros para o ano especificado
   */
  public getNationalHolidays(year: number): HolidayEntry[] {
    if (this.cacheHolidaysByYear.has(year)) {
      return this.cacheHolidaysByYear.get(year)!;
    }

    const fmt = (d: Date) => d.toISOString().split('T')[0];
    const addDays = (base: Date, days: number) => {
      const copy = new Date(base.getTime());
      copy.setUTCDate(copy.getUTCDate() + days);
      return copy;
    };

    const easter = this.calculateEaster(year);
    const carnival = addDays(easter, -47); // Terça-feira de Carnaval
    const goodFriday = addDays(easter, -2); // Sexta-feira Santa
    const corpusChristi = addDays(easter, 60); // Corpus Christi

    const list: HolidayEntry[] = [
      { date: `${year}-01-01`, name: 'Confraternização Universal', type: 'national' },
      { date: fmt(carnival), name: 'Carnaval', type: 'national' },
      { date: fmt(goodFriday), name: 'Sexta-feira Santa', type: 'national' },
      { date: fmt(easter), name: 'Páscoa', type: 'national' },
      { date: `${year}-04-21`, name: 'Tiradentes', type: 'national' },
      { date: `${year}-05-01`, name: 'Dia Mundial do Trabalho', type: 'national' },
      { date: fmt(corpusChristi), name: 'Corpus Christi', type: 'national' },
      { date: `${year}-09-07`, name: 'Independência do Brasil', type: 'national' },
      { date: `${year}-10-12`, name: 'Nossa Senhora Aparecida (Padroeira do Brasil)', type: 'national' },
      { date: `${year}-11-02`, name: 'Finados', type: 'national' },
      { date: `${year}-11-15`, name: 'Proclamação da República', type: 'national' },
      { date: `${year}-11-20`, name: 'Dia Nacional de Zumbi e da Consciência Negra', type: 'national' },
      { date: `${year}-12-25`, name: 'Natal', type: 'national' },
    ];

    this.cacheHolidaysByYear.set(year, list);
    return list;
  }

  /**
   * Tenta enriquecer feriados via Google Calendar ou BrasilAPI
   */
  public async fetchOnlineHolidays(year: number, googleAccessToken?: string): Promise<HolidayEntry[]> {
    // 1. Tenta buscar do calendário oficial de feriados do Brasil no Google Calendar
    if (googleAccessToken) {
      try {
        const timeMin = `${year}-01-01T00:00:00Z`;
        const timeMax = `${year}-12-31T23:59:59Z`;
        const gcalUrl = `https://www.googleapis.com/calendar/v3/calendars/pt.brazilian%23holiday%40group.v.calendar.google.com/events?timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true`;
        
        const response = await fetch(gcalUrl, {
          headers: { Authorization: `Bearer ${googleAccessToken}` },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.items && data.items.length > 0) {
            const gcalHolidays: HolidayEntry[] = data.items.map((item: any) => ({
              date: item.start.date || item.start.dateTime.split('T')[0],
              name: item.summary,
              type: 'national',
            }));
            this.cacheHolidaysByYear.set(year, gcalHolidays);
            return gcalHolidays;
          }
        }
      } catch (err) {
        console.warn('[HolidayService] Falha ao consultar Google Calendar holidays:', err);
      }
    }

    // 2. Fallback via BrasilAPI
    try {
      const bApiUrl = `https://brasilapi.com.br/api/feriados/v1/${year}`;
      const response = await fetch(bApiUrl);
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          const bHolidays: HolidayEntry[] = data.map((item: any) => ({
            date: item.date,
            name: this.normalizeHolidayName(item.name),
            type: 'national',
          }));
          this.cacheHolidaysByYear.set(year, bHolidays);
          return bHolidays;
        }
      }
    } catch {
      // Ignora erro e usa gerador offline
    }

    // 3. Fallback determinístico offline
    return this.getNationalHolidays(year);
  }

  private normalizeHolidayName(name: string): string {
    if (!name) return '';
    const lowercaseWords = new Set(['da', 'de', 'do', 'das', 'dos', 'e']);
    return name
      .split(' ')
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
   * Verifica se a data/hora selecionada possui avisos operacionais da MedPet:
   * - Feriados Nacionais (Alerta com nome do feriado)
   * - Domingos (Clínica fechada)
   * - Sábados fora do horário (08:30 às 12:30)
   * - Dias de semana fora do horário (08:00 às 17:30)
   */
  public async checkDate(
    dateStr: string,
    timeStr?: string,
    googleAccessToken?: string,
  ): Promise<DateCheckResult> {
    const [yStr, mStr, dStr] = dateStr.split('-');
    const year = parseInt(yStr, 10);
    const month = parseInt(mStr, 10);
    const day = parseInt(dStr, 10);

    // Feriados do ano
    const holidays = await this.fetchOnlineHolidays(year, googleAccessToken);
    const holiday = holidays.find((h) => h.date === dateStr);

    // Dia da semana em UTC para evitar timezone drift
    const dateObj = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
    const dayOfWeek = dateObj.getUTCDay(); // 0 = Domingo, 6 = Sábado

    const warnings: string[] = [];
    const isSunday = dayOfWeek === 0;
    let isSaturdayAfternoon = false;
    let isOutsideClinicHours = false;

    // 1. Alerta de Feriado
    if (holiday) {
      warnings.push(`Atenção: ${dStr}/${mStr}/${year} é Feriado (${holiday.name}). A MedPet pode não ter expediente ou operar em escala de plantão/emergência.`);
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
        // Sábado: 8h30 (510 min) às 12h30 (750 min)
        if (totalMinutes < 510 || totalMinutes > 750) {
          isSaturdayAfternoon = totalMinutes > 750;
          isOutsideClinicHours = true;
          warnings.push('Aos sábados, o expediente da MedPet é exclusivamente das 08:30 às 12:30.');
        }
      } else if (!isSunday) {
        // Segunda a Sexta: 8h00 (480 min) às 17h30 (1050 min)
        if (totalMinutes < 480 || totalMinutes > 1050) {
          isOutsideClinicHours = true;
          warnings.push('O expediente regular de segunda a sexta é das 08:00 às 17:30.');
        }
      }
    }

    return {
      date: dateStr,
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

