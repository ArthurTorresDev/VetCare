import { Pet } from '@vetcare/shared';
import { API_URL } from '../config/constants';

export async function createPetForClient(
  clientId: string,
  data: {
    name: string;
    species: 'Cão' | 'Gato' | 'Ave' | 'Outro';
    breed?: string;
    sex?: 'Macho' | 'Fêmea';
    birthDate?: string;
    weightKg?: number;
    notes?: string;
  },
): Promise<Pet> {
  const res = await fetch(`${API_URL}/clients/${clientId}/pets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Falha ao cadastrar animal');
  }
  return res.json();
}

export async function updatePet(
  id: string,
  data: Partial<Omit<Pet, 'id' | 'clientId'>>,
): Promise<Pet> {
  const res = await fetch(`${API_URL}/pets/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Falha ao atualizar animal');
  }
  return res.json();
}

export async function deletePet(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/pets/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Falha ao excluir animal');
  }
}
