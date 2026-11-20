import { EmailNotification, NotificationType } from '@vetcare/shared';
import { NotificationRepository } from '../repositories/notification.repository.js';

export class NotificationService {
  private repo: NotificationRepository;

  constructor(repo: NotificationRepository = new NotificationRepository()) {
    this.repo = repo;
  }

  send(data: {
    appointmentId: string;
    type: NotificationType;
    recipientEmail: string;
    recipientName: string;
    subject: string;
    body: string;
  }): EmailNotification {
    return this.repo.record({
      appointmentId: data.appointmentId,
      type: data.type,
      recipientEmail: data.recipientEmail,
      recipientName: data.recipientName,
      subject: data.subject,
      body: data.body,
      status: 'SENT',
    });
  }

  sendConfirmation(
    appointmentId: string,
    recipientEmail: string,
    recipientName: string,
    details: string,
  ): EmailNotification {
    return this.send({
      appointmentId,
      type: 'CONFIRMACAO',
      recipientEmail,
      recipientName,
      subject: 'Confirmação de Agendamento - VetCare Clínica Veterinária',
      body: `Olá ${recipientName},\n\nSeu agendamento na VetCare foi confirmado com sucesso!\n\nDetalhes do atendimento:\n${details}\n\nEm caso de dúvidas ou necessidade de reagendamento, entre em contato conosco.\n\nAtenciosamente,\nEquipe VetCare Veterinária`,
    });
  }

  sendUpdate(
    appointmentId: string,
    recipientEmail: string,
    recipientName: string,
    details: string,
  ): EmailNotification {
    return this.send({
      appointmentId,
      type: 'ALTERACAO',
      recipientEmail,
      recipientName,
      subject: 'Aviso de Alteração de Agendamento - VetCare Clínica Veterinária',
      body: `Olá ${recipientName},\n\nHouve uma atualização no seu agendamento.\n\nNovos detalhes:\n${details}\n\nAtenciosamente,\nEquipe VetCare Veterinária`,
    });
  }

  sendCancellation(
    appointmentId: string,
    recipientEmail: string,
    recipientName: string,
    details: string,
  ): EmailNotification {
    return this.send({
      appointmentId,
      type: 'CANCELAMENTO',
      recipientEmail,
      recipientName,
      subject: 'Aviso de Cancelamento de Agendamento - VetCare',
      body: `Olá ${recipientName},\n\nInformamos que o seu agendamento foi cancelado.\n\nDetalhes:\n${details}\n\nSe desejar remarcar uma nova data, estamos à sua disposição.\n\nAtenciosamente,\nEquipe VetCare Veterinária`,
    });
  }

  getAll(): EmailNotification[] {
    return this.repo.findAll();
  }
}
