import { Request, Response } from 'express';
import { getGoogleCalendarService } from '../domain/services/google-calendar.service.js';
import { holidayService } from '../domain/services/holiday.service.js';
import { env } from '../config/env.js';

export class GoogleCalendarController {
  private service = getGoogleCalendarService();

  getStatus = (_req: Request, res: Response) => {
    const status = this.service.getStatus();
    res.json({
      ...status,
      description: status.isMock
        ? 'Modo Simulado (Mock) ativo. Pronto para desenvolvimento local sem necessidade de credenciais do Google Cloud.'
        : 'Conectado à API oficial do Google Calendar v3.',
      holidayCalendarId: 'pt.brazilian#holiday@group.v.calendar.google.com',
      clinicHours: {
        weekdays: '08:00 às 17:30',
        saturday: '08:30 às 12:30',
        sunday: 'Fechado',
      },
    });
  };

  /**
   * Endpoint de validação de datas e horários com detecção de feriados
   * GET /api/google-calendar/check-date?date=YYYY-MM-DD&time=HH:mm
   */
  checkDate = async (req: Request, res: Response) => {
    try {
      const date = req.query.date as string;
      const time = req.query.time as string | undefined;

      if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return res.status(400).json({ error: 'Data inválida. Use o formato AAAA-MM-DD (ex: 2026-11-20).' });
      }

      const result = await holidayService.checkDate(date, time, env.googleCalendarAccessToken);
      return res.json(result);
    } catch (err: any) {
      console.error('[GoogleCalendarController.checkDate Error]:', err);
      return res.status(500).json({ error: 'Erro ao validar data e feriados.' });
    }
  };

  /**
   * Endpoint para listar feriados do ano
   * GET /api/google-calendar/holidays?year=2026
   */
  getHolidays = async (req: Request, res: Response) => {
    try {
      const yearStr = req.query.year as string;
      const year = yearStr ? parseInt(yearStr, 10) : new Date().getFullYear();

      const holidays = await holidayService.fetchOnlineHolidays(year, env.googleCalendarAccessToken);
      return res.json({ year, count: holidays.length, holidays });
    } catch (err: any) {
      console.error('[GoogleCalendarController.getHolidays Error]:', err);
      return res.status(500).json({ error: 'Erro ao buscar feriados.' });
    }
  };
}
