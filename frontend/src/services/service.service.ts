import { ClinicService } from '@vetcare/shared';
import { API_URL } from '../config/constants';

export async function fetchServices(onlyActive = false): Promise<ClinicService[]> {
  const url = onlyActive ? `${API_URL}/services?active=true` : `${API_URL}/services`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Falha ao carregar serviços');
  return res.json();
}

export async function createService(data: Partial<ClinicService>): Promise<ClinicService> {
  const res = await fetch(`${API_URL}/services`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Falha ao cadastrar serviço');
  }
  return res.json();
}

export async function updateService(
  id: string,
  updates: Partial<ClinicService>,
): Promise<ClinicService> {
  const res = await fetch(`${API_URL}/services/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Falha ao atualizar serviço');
  }
  return res.json();
}

export async function deleteService(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/services/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Falha ao excluir serviço');
  }
}
