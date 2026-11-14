import { Request, Response } from 'express';
import { SchedulingService } from '../domain/services/scheduling.service.js';

export class AppointmentController {
  private service: SchedulingService;

  constructor(service = new SchedulingService()) {
    this.service = service;
  }

  list = (req: Request, res: Response) => {
    const { status, date, serviceId, clientId, petId } = req.query;
    const list = this.service.listAppointments({
      status: typeof status === 'string' ? status : undefined,
      date: typeof date === 'string' ? date : undefined,
      serviceId: typeof serviceId === 'string' ? serviceId : undefined,
      clientId: typeof clientId === 'string' ? clientId : undefined,
      petId: typeof petId === 'string' ? petId : undefined,
    });
    res.json(list);
  };

  getById = (req: Request, res: Response) => {
    const id = String(req.params.id);
    const appt = this.service.getAppointmentById(id);
    if (!appt) {
      return res.status(404).json({ error: 'Agendamento não encontrado.' });
    }
    res.json(appt);
  };

  getKPIStats = (_req: Request, res: Response) => {
    const stats = this.service.getKPIStats();
    res.json(stats);
  };

  create = async (req: Request, res: Response) => {
    try {
      const created = await this.service.createAppointment(req.body);
      res.status(201).json(created);
    } catch (err: any) {
      const status = err.statusCode || 400;
      res.status(status).json({
        error: err.message || 'Erro ao processar agendamento',
        conflictingAppointment: err.conflictingAppointment,
      });
    }
  };

  update = async (req: Request, res: Response) => {
    const id = String(req.params.id);
    try {
      const updated = await this.service.updateAppointment(id, req.body);
      res.json(updated);
    } catch (err: any) {
      const statusCode = err.statusCode || 400;
      res.status(statusCode).json({
        error: err.message || 'Erro ao atualizar agendamento',
        conflictingAppointment: err.conflictingAppointment,
      });
    }
  };

  updateStatus = async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const { status, user } = req.body;

    const validStatuses = [
      'AGENDADO',
      'CONFIRMADO',
      'EM_ATENDIMENTO',
      'CONCLUIDO',
      'CANCELADO',
      'NAO_COMPARECEU',
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: `Status inválido. Permitidos: ${validStatuses.join(', ')}`,
      });
    }

    try {
      const updated = await this.service.updateAppointmentStatus(id, status, user);
      res.json(updated);
    } catch (err: any) {
      const statusCode = err.statusCode || 500;
      res.status(statusCode).json({ error: err.message });
    }
  };

  delete = async (req: Request, res: Response) => {
    const id = String(req.params.id);
    try {
      const cancelled = await this.service.cancelAppointment(id);
      res.json({ message: 'Agendamento cancelado com sucesso.', appointment: cancelled });
    } catch (err: any) {
      const statusCode = err.statusCode || 500;
      res.status(statusCode).json({ error: err.message });
    }
  };

  exportXml = (_req: Request, res: Response) => {
    const xml = this.service.exportAppointmentsXml();
    res.header('Content-Type', 'application/xml');
    res.header(
      'Content-Disposition',
      'attachment; filename="relatorio_agendamentos_medpet.xml"',
    );
    res.send(xml);
  };
}
