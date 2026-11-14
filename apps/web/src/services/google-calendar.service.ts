import { API_URL } from '../config/constants';
import { GoogleStatusResponse } from '../types/index';

export async function fetchGoogleCalendarStatus(): Promise<GoogleStatusResponse> {
  const res = await fetch(`${API_URL}/google-calendar/status`);
  if (!res.ok) throw new Error('Falha ao obter status do Google Calendar');
  return res.json();
}
