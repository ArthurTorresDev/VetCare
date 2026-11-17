import { EmailNotification, NotificationType } from '@vetcare/shared';
import { InMemoryStore } from '../models/in-memory.store.js';

export class NotificationRepository {
  private store: InMemoryStore;

  constructor(store: InMemoryStore = InMemoryStore.getInstance()) {
    this.store = store;
  }

  findAll(): EmailNotification[] {
    return this.store.emailNotifications;
  }

  findByAppointmentId(appointmentId: string): EmailNotification[] {
    return this.store.emailNotifications.filter((n) => n.appointmentId === appointmentId);
  }

  record(data: {
    appointmentId: string;
    type: NotificationType;
    recipientEmail: string;
    recipientName: string;
    subject: string;
    body: string;
    status?: 'SENT' | 'QUEUED' | 'FAILED';
  }): EmailNotification {
    const notification: EmailNotification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      appointmentId: data.appointmentId,
      type: data.type,
      recipientEmail: data.recipientEmail,
      recipientName: data.recipientName,
      subject: data.subject,
      body: data.body,
      status: data.status || 'SENT',
      createdAt: new Date().toISOString(),
    };
    this.store.emailNotifications.unshift(notification);
    return notification;
  }
}
