import { Request, Response } from 'express';
import { getGoogleCalendarService } from '../domain/services/google-calendar.service.js';

export class GoogleCalendarController {
  private service = getGoogleCalendarService();

  getStatus = (_req: Request, res: Response) => {
    const status = this.service.getStatus();
    res.json({
      ...status,
      description: status.isMock
        ? 'Modo Simulado (Mock) ativo. Pronto para desenvolvimento local sem necessidade de credenciais do Google Cloud.'
        : 'Conectado à API oficial do Google Calendar v3.',
    });
  };
}
