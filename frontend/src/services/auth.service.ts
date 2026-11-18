import { AuthResponse, LoginDTO, PublicUser, RegisterUserDTO } from '@vetcare/shared';
import { API_URL } from '../config/constants';

const TOKEN_KEY = 'vetcare_auth_token';
const USER_KEY = 'vetcare_auth_user';

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): PublicUser | null {
  if (typeof window === 'undefined') return null;
  const userJson = localStorage.getItem(USER_KEY);
  if (!userJson) return null;
  try {
    return JSON.parse(userJson);
  } catch {
    return null;
  }
}

export function setStoredAuth(token: string, user: PublicUser): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearStoredAuth(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export async function loginUser(dto: LoginDTO): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Credenciais inválidas.');
  }

  setStoredAuth(data.token, data.user);
  return data;
}

export async function registerUser(dto: RegisterUserDTO): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
  });

  const data = await res.json();
  if (!res.ok) {
    const errorMsg = data.details?.length ? data.details.join(', ') : data.error || 'Erro no cadastro.';
    throw new Error(errorMsg);
  }

  setStoredAuth(data.token, data.user);
  return data;
}

export async function logoutUser(): Promise<void> {
  const token = getStoredToken();
  if (token) {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (err) {
      console.warn('[Logout API Warning]', err);
    }
  }
  clearStoredAuth();
}

export async function fetchCurrentUser(): Promise<PublicUser> {
  const token = getStoredToken();
  if (!token) throw new Error('Não autenticado');

  const res = await fetch(`${API_URL}/users/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    clearStoredAuth();
    throw new Error('Sessão expirada');
  }

  const user = await res.json();
  if (typeof window !== 'undefined') {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
  return user;
}

export async function updateCurrentUser(data: { name?: string; email?: string; phone?: string }): Promise<PublicUser> {
  const token = getStoredToken();
  if (!token) throw new Error('Não autenticado');

  const res = await fetch(`${API_URL}/users/me`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const updated = await res.json();
  if (!res.ok) {
    throw new Error(updated.error || 'Erro ao atualizar dados do perfil');
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(USER_KEY, JSON.stringify(updated));
  }
  return updated;
}
