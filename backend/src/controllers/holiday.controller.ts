import { Request, Response } from 'express';
import { holidayService } from '../services/holiday.service.js';

export class HolidayController {
  /**
   * Endpoint de validação de datas e horários com detecção de feriados nacionais (Brasil API)
   * GET /api/holidays/check-date?date=YYYY-MM-DD&time=HH:mm ou date=DD-MM-YYYY
   */
  checkDate = async (req: Request, res: Response) => {
    try {
      const date = req.query.date as string;
      const time = req.query.time as string | undefined;

      if (!date) {
        return res.status(400).json({ error: 'Data não informada. Use o formato AAAA-MM-DD ou DD-MM-AAAA.' });
      }

      const result = await holidayService.checkDate(date, time);
      return res.json(result);
    } catch (err: any) {
      console.error('[HolidayController.checkDate Error]:', err);
      return res.status(500).json({ error: 'Erro ao validar data e feriados nacionais.' });
    }
  };

  /**
   * Endpoint para listar feriados nacionais do ano solicitado (armazenados via Brasil API)
   * GET /api/holidays?year=2026
   */
  getHolidays = async (req: Request, res: Response) => {
    try {
      const yearStr = req.query.year as string;
      const year = yearStr ? parseInt(yearStr, 10) : new Date().getFullYear();

      if (isNaN(year) || year < 1900 || year > 2100) {
        return res.status(400).json({ error: 'Ano inválido fornecido.' });
      }

      const holidays = await holidayService.getHolidaysByYear(year);
      return res.json({ year, count: holidays.length, holidays });
    } catch (err: any) {
      console.error('[HolidayController.getHolidays Error]:', err);
      return res.status(500).json({ error: 'Erro ao buscar feriados nacionais.' });
    }
  };
}
