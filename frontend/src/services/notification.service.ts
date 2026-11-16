import { EmailNotification } from '@vetcare/shared';
import { API_URL } from '../config/constants';

export async function fetchNotifications(): Promise<EmailNotification[]> {
  const res = await fetch(`${API_URL}/notifications`);
  if (!res.ok) throw new Error('Falha ao carregar notificações');
  return res.json();
}
