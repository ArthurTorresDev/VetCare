import { Client } from '@vetcare/shared';
import { API_URL } from '../config/constants';
import { ClientWithPets } from '../types/index';

export async function fetchClients(searchQuery?: string): Promise<ClientWithPets[]> {
  const url = searchQuery
    ? `${API_URL}/clientes?search=${encodeURIComponent(searchQuery)}`
    : `${API_URL}/clientes`;
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
  console.log('Dados enviados:', data);

  const res = await fetch(`${API_URL}/clientes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const responseText = await res.text();

  console.log('Status HTTP:', res.status);
  console.log('Resposta da API:', responseText);

  if (!res.ok) {
    let message = 'Falha ao cadastrar tutor';

    try {
      const errorData = JSON.parse(responseText);
      message = errorData.error || errorData.message || message;
    } catch {
      message = responseText || message;
    }

    throw new Error(message);
  }

  return JSON.parse(responseText);
}

export async function updateClient(
  id: string,
  data: Partial<Omit<Client, 'id' | 'createdAt'>>,
): Promise<Client> {
  const res = await fetch(`${API_URL}/clientes/${id}`, {
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
  const res = await fetch(`${API_URL}/clientes/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Falha ao excluir tutor');
  }
}
