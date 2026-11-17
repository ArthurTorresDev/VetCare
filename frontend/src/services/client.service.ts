import { Client } from '@vetcare/shared';
import { API_URL } from '../config/constants';
import { ClientWithPets } from '../types/index';

export async function fetchClients(searchQuery?: string): Promise<ClientWithPets[]> {
  const url = searchQuery
    ? `${API_URL}/clients?search=${encodeURIComponent(searchQuery)}`
    : `${API_URL}/clients`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Falha ao carregar clientes');
  return res.json();
}

export async function createClient(data: {
  name: string;
  phone: string;
  email: string;
  cpf?: string;
}): Promise<Client> {
  const res = await fetch(`${API_URL}/clients`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Falha ao cadastrar tutor');
  }
  return res.json();
}

export async function updateClient(
  id: string,
  data: Partial<Omit<Client, 'id' | 'createdAt'>>,
): Promise<Client> {
  const res = await fetch(`${API_URL}/clients/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Falha ao atualizar tutor');
  }
  return res.json();
}

export async function deleteClient(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/clients/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Falha ao excluir tutor');
  }
}
