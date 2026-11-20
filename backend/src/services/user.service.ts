import type {
  UpdateUserDTO,
  ChangePasswordDTO,
  DeleteAccountDTO,
  PublicUser,
} from '@vetcare/shared';
import {
  validateUpdateUserDTO,
  validateChangePasswordDTO,
  validateDeleteAccountDTO,
} from '@vetcare/shared';
import type { IUserRepository } from '../repositories/user.repository.interface.js';
import { InMemoryUserRepository } from '../repositories/in-memory-user.repository.js';
import { PostgresUserRepository } from '../repositories/postgres-user.repository.js';
import { AuditRepository } from '../repositories/audit.repository.js';
import { hashService, HashService } from './hash.service.js';
import { tokenService, TokenService } from './token.service.js';
import { AuthenticationError } from './auth.service.js';
import { env } from '../config/env.js';
import { getSupabaseClient } from './supabase.service.js';

export class UserService {
  private userRepo: IUserRepository;
  private auditRepo: AuditRepository;
  private hasher: HashService;
  private tokenizer: TokenService;

  constructor(
    userRepo?: IUserRepository,
    auditRepo: AuditRepository = new AuditRepository(),
    hasher: HashService = hashService,
    tokenizer: TokenService = tokenService,
  ) {
    this.userRepo = userRepo ?? (env.isTest ? new InMemoryUserRepository() : new PostgresUserRepository());
    this.auditRepo = auditRepo;
    this.hasher = hasher;
    this.tokenizer = tokenizer;
  }

  private toPublicUser(user: {
    id: string;
    name: string;
    email: string;
    role: any;
    phone?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    lastLoginAt?: string;
  }): PublicUser {
    const { id, name, email, role, phone, isActive, createdAt, updatedAt, lastLoginAt } = user;
    return { id, name, email, role, phone, isActive, createdAt, updatedAt, lastLoginAt };
  }

  /**
   * Consulta os dados cadastrais do próprio usuário autenticado
   */
  public async getProfile(userId: string): Promise<PublicUser> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new AuthenticationError('Usuário não encontrado.', 404);
    }
    return this.toPublicUser(user);
  }

  /**
   * Atualiza os dados cadastrais da própria conta
   */
  public async updateProfile(
    userId: string,
    dto: UpdateUserDTO,
    context?: { ip?: string },
  ): Promise<PublicUser> {
    const validation = validateUpdateUserDTO(dto);
    if (!validation.isValid || !validation.sanitized) {
      throw new AuthenticationError(
        'Dados de atualização inválidos.',
        400,
        validation.errors,
      );
    }

    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new AuthenticationError('Usuário não encontrado.', 404);
    }

    const sanitized = validation.sanitized;

    // Se houver alteração de e-mail, verificar se outro usuário já possui esse e-mail
    if (sanitized.email && sanitized.email !== user.email.toLowerCase()) {
      const existing = await this.userRepo.findByEmail(sanitized.email);
      if (existing && existing.id !== userId) {
        throw new AuthenticationError('O e-mail informado já está em uso por outro usuário.', 409);
      }
    }

    const updatedUser = await this.userRepo.update(userId, {
      name: sanitized.name,
      email: sanitized.email,
      phone: sanitized.phone,
    });

    if (!updatedUser) {
      throw new AuthenticationError('Erro ao atualizar usuário.', 500);
    }

    this.auditRepo.log({
      action: 'UPDATE_STATUS',
      targetId: userId,
      targetType: 'USER',
      user: updatedUser.email,
      details: `Dados do perfil atualizados pelo próprio usuário. [IP: ${context?.ip || 'local'}]`,
    });

    return this.toPublicUser(updatedUser);
  }

  /**
   * Altera a senha do próprio usuário mediante verificação rigorosa da senha atual
   */
  public async changePassword(
    userId: string,
    dto: ChangePasswordDTO,
    context?: { ip?: string },
  ): Promise<{ message: string }> {
    const validation = validateChangePasswordDTO(dto);
    if (!validation.isValid || !validation.sanitized) {
      throw new AuthenticationError(
        'Dados de alteração de senha inválidos.',
        400,
        validation.errors,
      );
    }

    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new AuthenticationError('Usuário não encontrado.', 404);
    }

    const { currentPassword, newPassword } = validation.sanitized;

    // Verificar se a senha atual confere
    const isCurrentValid = await this.hasher.compare(currentPassword, user.passwordHash);
    if (!isCurrentValid) {
      throw new AuthenticationError('A senha atual informada está incorreta.', 400);
    }

    // Gerar novo hash para a nova senha
    const newHash = await this.hasher.hash(newPassword);
    await this.userRepo.update(userId, { passwordHash: newHash });

    this.auditRepo.log({
      action: 'PASSWORD_CHANGE',
      targetId: userId,
      targetType: 'USER',
      user: user.email,
      details: `Senha de acesso alterada com sucesso pelo próprio usuário. [IP: ${context?.ip || 'local'}]`,
    });

    return { message: 'Senha alterada com sucesso.' };
  }

  /**
   * Exclui a conta do próprio usuário mediante confirmação e senha
   */
  public async deleteAccount(
    userId: string,
    dto: DeleteAccountDTO,
    currentToken?: string,
    context?: { ip?: string },
  ): Promise<{ message: string; id: string }> {
    const validation = validateDeleteAccountDTO(dto);
    if (!validation.isValid || !validation.sanitized) {
      throw new AuthenticationError(
        'Dados de confirmação de exclusão inválidos.',
        400,
        validation.errors,
      );
    }

    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new AuthenticationError('Usuário não encontrado.', 404);
    }

    // Validar a senha antes de efetivar a exclusão definitiva
    const isPasswordValid = await this.hasher.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new AuthenticationError('Senha incorreta para confirmação de exclusão da conta.', 400);
    }

    // Revogar token atual para bloquear novas requisições imediatamente
    if (currentToken) {
      this.tokenizer.revokeToken(currentToken);
    }

    // Excluir no Supabase Auth caso o cliente Supabase esteja configurado
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.auth.admin.deleteUser(userId);
      } catch (sbErr) {
        console.warn(`[Supabase Auth deleteUser warning for ${userId}]:`, sbErr);
      }
    }

    // Excluir a conta do repositório
    await this.userRepo.delete(userId);

    this.auditRepo.log({
      action: 'CANCEL',
      targetId: userId,
      targetType: 'USER',
      user: user.email,
      details: `Conta de usuário excluída definitivamente pelo próprio usuário. [IP: ${context?.ip || 'local'}]`,
    });

    return {
      message: 'Conta de usuário excluída com sucesso.',
      id: userId,
    };
  }
}
