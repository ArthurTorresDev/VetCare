import type {
  Appointment,
  Client,
  RegisterUserDTO,
  LoginDTO,
  UpdateUserDTO,
  ChangePasswordDTO,
  DeleteAccountDTO,
} from './types.js';

/**
 * Retorna tutores cujo nome contém o termo digitado (mínimo 2 caracteres).
 */
export function filterClientsByPrefix(clientes: Client[], query: string): Client[] {
  const trimmed = query.trim().toLowerCase();
  if (trimmed.length < 2) return [];
  return clientes.filter((c) => c.name.toLowerCase().includes(trimmed));
}

/**
 * Verifica sobreposição de dois intervalos de tempo abertos.
 */
export function isOverlapping(startA: Date, endA: Date, startB: Date, endB: Date): boolean {
  return startA.getTime() < endB.getTime() && endA.getTime() > startB.getTime();
}

/**
 * Verifica conflito com agendamentos existentes (ignora compromissos cancelados).
 */
export function hasScheduleConflict(
  existingAppointments: Appointment[],
  newStartIso: string,
  newEndIso: string,
  ignoreAppointmentId?: string,
): { hasConflict: boolean; conflictingWith?: Appointment } {
  const newStart = new Date(newStartIso);
  const newEnd = new Date(newEndIso);
  for (const appt of existingAppointments) {
    if (appt.id === ignoreAppointmentId || appt.status === 'CANCELADO') continue;
    if (isOverlapping(newStart, newEnd, new Date(appt.startTime), new Date(appt.endTime))) {
      return { hasConflict: true, conflictingWith: appt };
    }
  }
  return { hasConflict: false };
}

// ─── Validações de Segurança, Usuário e Autenticação ──────────────────────────

/**
 * Validação rigorosa de formato de e-mail compatível com RFC 5322.
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const trimmed = email.trim();
  if (trimmed.length > 254) return false;
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return emailRegex.test(trimmed);
}

/**
 * Sanitiza entradas de texto para prevenir XSS e injeções de controle.
 */
export function sanitizeString(val: unknown): string {
  if (val === null || val === undefined) return '';
  const str = String(val).trim();
  return str.replace(/[<>]/g, '');
}

/**
 * Critérios mínimos de segurança para senhas:
 * - Mínimo 8 caracteres
 * - Pelo menos uma letra maiúscula
 * - Pelo menos uma letra minúscula
 * - Pelo menos um dígito numérico
 * - Pelo menos um símbolo/caractere especial
 */
export function validatePasswordRequirements(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  if (!password || typeof password !== 'string') {
    return { isValid: false, errors: ['A senha é obrigatória.'] };
  }

  if (password.length < 8) {
    errors.push('A senha deve conter no mínimo 8 caracteres.');
  }
  if (password.length > 128) {
    errors.push('A senha não deve exceder 128 caracteres.');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('A senha deve conter ao menos uma letra maiúscula.');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('A senha deve conter ao menos uma letra minúscula.');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('A senha deve conter ao menos um número.');
  }
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/.test(password)) {
    errors.push('A senha deve conter ao menos um caractere especial (ex: !@#$%^&*).');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validação de dados para cadastro de conta.
 */
export function validateRegisterDTO(data: unknown): {
  isValid: boolean;
  errors: string[];
  sanitized?: RegisterUserDTO;
} {
  const errors: string[] = [];
  if (!data || typeof data !== 'object') {
    return { isValid: false, errors: ['Corpo da requisição inválido.'] };
  }

  const { name, email, password, confirmPassword, phone, role } = data as Record<string, unknown>;

  if (!name || typeof name !== 'string' || name.trim().length < 3) {
    errors.push('O nome é obrigatório e deve ter ao menos 3 caracteres.');
  }

  if (!email || typeof email !== 'string' || !isValidEmail(email)) {
    errors.push('O e-mail informado é inválido.');
  }

  const pwdCheck = validatePasswordRequirements(String(password || ''));
  if (!pwdCheck.isValid) {
    errors.push(...pwdCheck.errors);
  }

  if (confirmPassword !== undefined && password !== confirmPassword) {
    errors.push('A confirmação de senha não confere com a senha informada.');
  }

  const allowedRoles = ['ADMIN', 'VET', 'RECEPTIONIST', 'CLIENT'];
  if (role && !allowedRoles.includes(String(role))) {
    errors.push(`Perfil inválido. Perfis aceitos: ${allowedRoles.join(', ')}.`);
  }

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  return {
    isValid: true,
    errors: [],
    sanitized: {
      name: sanitizeString(name),
      email: String(email).trim().toLowerCase(),
      password: String(password),
      confirmPassword: confirmPassword ? String(confirmPassword) : undefined,
      phone: phone ? sanitizeString(phone) : undefined,
      role: (role as RegisterUserDTO['role']) || 'CLIENT',
    },
  };
}

/**
 * Validação de credenciais para login.
 */
export function validateLoginDTO(data: unknown): {
  isValid: boolean;
  errors: string[];
  sanitized?: LoginDTO;
} {
  const errors: string[] = [];
  if (!data || typeof data !== 'object') {
    return { isValid: false, errors: ['Corpo da requisição inválido.'] };
  }

  const { email, password } = data as Record<string, unknown>;

  if (!email || typeof email !== 'string' || !isValidEmail(email)) {
    errors.push('E-mail inválido ou não fornecido.');
  }

  if (!password || typeof password !== 'string' || password.length === 0) {
    errors.push('A senha é obrigatória.');
  }

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  return {
    isValid: true,
    errors: [],
    sanitized: {
      email: String(email).trim().toLowerCase(),
      password: String(password),
    },
  };
}

/**
 * Validação de dados para atualização de conta própria.
 */
export function validateUpdateUserDTO(data: unknown): {
  isValid: boolean;
  errors: string[];
  sanitized?: UpdateUserDTO;
} {
  const errors: string[] = [];
  if (!data || typeof data !== 'object') {
    return { isValid: false, errors: ['Corpo da requisição inválido.'] };
  }

  const payload = data as Record<string, unknown>;

  // Campos protegidos que nunca podem ser alterados via update comum
  const forbiddenFields = ['id', 'role', 'passwordHash', 'password', 'createdAt', 'updatedAt', 'lastLoginAt'];
  for (const field of forbiddenFields) {
    if (field in payload) {
      errors.push(`O campo '${field}' é protegido e não pode ser alterado por este endpoint.`);
    }
  }

  const { name, email, phone } = payload;
  if (name !== undefined) {
    if (typeof name !== 'string' || name.trim().length < 3) {
      errors.push('O nome deve conter ao menos 3 caracteres.');
    }
  }

  if (email !== undefined) {
    if (typeof email !== 'string' || !isValidEmail(email)) {
      errors.push('O e-mail informado é inválido.');
    }
  }

  if (phone !== undefined && typeof phone !== 'string') {
    errors.push('Telefone inválido.');
  }

  if (name === undefined && email === undefined && phone === undefined) {
    errors.push('Ao menos um campo (name, email, phone) deve ser informado para atualização.');
  }

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  return {
    isValid: true,
    errors: [],
    sanitized: {
      name: name !== undefined ? sanitizeString(name) : undefined,
      email: email !== undefined ? String(email).trim().toLowerCase() : undefined,
      phone: phone !== undefined ? sanitizeString(phone) : undefined,
    },
  };
}

/**
 * Validação de alteração de senha.
 */
export function validateChangePasswordDTO(data: unknown): {
  isValid: boolean;
  errors: string[];
  sanitized?: ChangePasswordDTO;
} {
  const errors: string[] = [];
  if (!data || typeof data !== 'object') {
    return { isValid: false, errors: ['Corpo da requisição inválido.'] };
  }

  const { currentPassword, newPassword, confirmPassword } = data as Record<string, unknown>;

  if (!currentPassword || typeof currentPassword !== 'string') {
    errors.push('A senha atual é obrigatória.');
  }

  const pwdCheck = validatePasswordRequirements(String(newPassword || ''));
  if (!pwdCheck.isValid) {
    errors.push(...pwdCheck.errors);
  }

  if (confirmPassword !== undefined && newPassword !== confirmPassword) {
    errors.push('A confirmação da nova senha não confere.');
  }

  if (currentPassword && newPassword && currentPassword === newPassword) {
    errors.push('A nova senha deve ser diferente da senha atual.');
  }

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  return {
    isValid: true,
    errors: [],
    sanitized: {
      currentPassword: String(currentPassword),
      newPassword: String(newPassword),
      confirmPassword: confirmPassword ? String(confirmPassword) : undefined,
    },
  };
}

/**
 * Validação para exclusão de conta própria.
 */
export function validateDeleteAccountDTO(data: unknown): {
  isValid: boolean;
  errors: string[];
  sanitized?: DeleteAccountDTO;
} {
  const errors: string[] = [];
  if (!data || typeof data !== 'object') {
    return { isValid: false, errors: ['Corpo da requisição inválido.'] };
  }

  const { password, confirmation } = data as Record<string, unknown>;

  if (!password || typeof password !== 'string') {
    errors.push('A confirmação da senha atual é obrigatória para excluir a conta.');
  }

  if (!confirmation || confirmation !== 'EXCLUIR') {
    errors.push('Para confirmar a exclusão definitiva, digite "EXCLUIR" no campo de confirmação.');
  }

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  return {
    isValid: true,
    errors: [],
    sanitized: {
      password: String(password),
      confirmation: 'EXCLUIR',
    },
  };
}
