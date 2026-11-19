import { Veterinario, Atendente, Atendimento } from '@vetcare/shared';
import { API_URL } from '../config/constants';

export async function fetchVeterinarios(): Promise<Veterinario[]> {
  const res = await fetch(`${API_URL}/veterinarios`);
  if (!res.ok) throw new Error('Falha ao buscar veterinários');
  return res.json();
}

export async function createVeterinario(data: Omit<Veterinario, 'id' | 'criadoEm'>): Promise<Veterinario> {
  const res = await fetch(`${API_URL}/veterinarios`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Erro ao criar veterinário');
  }
  return res.json();
}

export async function fetchAtendentes(): Promise<Atendente[]> {
  const res = await fetch(`${API_URL}/atendentes`);
  if (!res.ok) throw new Error('Falha ao buscar atendentes');
  return res.json();
}

export async function createAtendente(data: Omit<Atendente, 'id' | 'criadoEm'>): Promise<Atendente> {
  const res = await fetch(`${API_URL}/atendentes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Erro ao criar atendente');
  }
  return res.json();
}

export async function fetchAtendimentos(petId?: string): Promise<Atendimento[]> {
  const url = petId ? `${API_URL}/atendimentos?petId=${petId}` : `${API_URL}/atendimentos`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Falha ao buscar atendimentos');
  return res.json();
}

export async function createAtendimento(data: Omit<Atendimento, 'id' | 'criadoEm'>): Promise<Atendimento> {
  const res = await fetch(`${API_URL}/atendimentos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Erro ao registrar atendimento');
  }
  return res.json();
}
