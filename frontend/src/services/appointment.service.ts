import {
  AppointmentDetailedView,
  AppointmentStatus,
  CreateAppointmentDTO,
  UpdateAppointmentDTO,
  AppointmentKPIStats,
} from '@vetcare/shared';
import { API_URL } from '../config/constants';

export async function fetchAppointments(filters?: {
  status?: string;
  date?: string;
  serviceId?: string;
  clientId?: string;
  petId?: string;
}): Promise<AppointmentDetailedView[]> {
  const params = new URLSearchParams();
  if (filters?.status && filters.status !== 'TODOS') params.append('status', filters.status);
  if (filters?.date) params.append('date', filters.date);
  if (filters?.serviceId && filters.serviceId !== 'TODOS') params.append('serviceId', filters.serviceId);
  if (filters?.clientId) params.append('clientId', filters.clientId);
  if (filters?.petId) params.append('petId', filters.petId);

  const url = `${API_URL}/appointments${params.toString() ? `?${params.toString()}` : ''}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Falha ao carregar agendamentos');
  return res.json();
}

export async function fetchAppointmentKPIStats(): Promise<AppointmentKPIStats> {
  const res = await fetch(`${API_URL}/appointments/stats/kpi`);
  if (!res.ok) throw new Error('Falha ao carregar métricas');
  return res.json();
}

export async function checkScheduleConflict(
  startTime: string,
  durationMinutes: number,
  ignoreAppointmentId?: string,
): Promise<{ hasConflict: boolean; conflictingWith?: any }> {
  const params = new URLSearchParams({
    startTime,
    durationMinutes: String(durationMinutes),
  });
  if (ignoreAppointmentId) params.append('ignoreAppointmentId', ignoreAppointmentId);

  const res = await fetch(`${API_URL}/appointments/check-conflict?${params.toString()}`);
  if (!res.ok) return { hasConflict: false };
  return res.json();
}

export async function createAppointment(
  dto: CreateAppointmentDTO,
): Promise<AppointmentDetailedView & { warning?: string; conflict?: any }> {
  const res = await fetch(`${API_URL}/appointments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
  });
  const data = await res.json();
  if (!res.ok) {
    const error: any = new Error(data.error || 'Erro ao registrar agendamento');
    error.conflictingAppointment = data.conflictingAppointment || data.conflict;
    throw error;
  }
  return data;
}

export async function updateAppointment(
  id: string,
  dto: UpdateAppointmentDTO,
): Promise<AppointmentDetailedView & { warning?: string; conflict?: any }> {
  const res = await fetch(`${API_URL}/appointments/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
  });
  const data = await res.json();
  if (!res.ok) {
    const error: any = new Error(data.error || 'Erro ao atualizar agendamento');
    error.conflictingAppointment = data.conflictingAppointment || data.conflict;
    throw error;
  }
  return data;
}

export async function updateAppointmentStatus(
  id: string,
  status: AppointmentStatus,
  user?: string,
): Promise<AppointmentDetailedView> {
  const res = await fetch(`${API_URL}/appointments/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, user }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Falha ao atualizar situação do agendamento');
  }
  return res.json();
}

export async function deleteAppointment(
  id: string,
): Promise<{ message: string; appointment: AppointmentDetailedView }> {
  const res = await fetch(`${API_URL}/appointments/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Falha ao cancelar agendamento');
  }
  return res.json();
}

export function getExportXmlUrl(): string {
  return `${API_URL}/appointments/export/xml`;
}
