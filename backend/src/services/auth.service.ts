import type {
  RegisterUserDTO,
  LoginDTO,
  AuthResponse,
  PublicUser,
} from '@vetcare/shared';
import {
  validateRegisterDTO,
  validateLoginDTO,
} from '@vetcare/shared';
import type { IUserRepository } from '../repositories/user.repository.interface.js';
import { InMemoryUserRepository } from '../repositories/in-memory-user.repository.js';
import { PostgresUserRepository } from '../repositories/postgres-user.repository.js';
import { AuditRepository } from '../repositories/audit.repository.js';
import { hashService, HashService } from './hash.service.js';
import { tokenService, TokenService } from './token.service.js';
import { env } from '../config/env.js';

export class AuthenticationError extends Error {
  public statusCode: number;
  public details?: string[];

  constructor(message: string, statusCode = 400, details?: string[]) {
    super(message);
    this.name = 'AuthenticationError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

export class AuthService {
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

  /**
   * Converte a entidade interna User em PublicUser para nunca expor a senha ou hash
   */
  public toPublicUser(user: {
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
   * Registra uma nova conta de usuário no sistema
   */
  public async register(
    dto: RegisterUserDTO,
    context?: { ip?: string; userAgent?: string },
  ): Promise<AuthResponse> {
    const validation = validateRegisterDTO(dto);
    if (!validation.isValid || !validation.sanitized) {
      throw new AuthenticationError(
        'Dados de cadastro inválidos.',
        400,
        validation.errors,
      );
    }

    const sanitized = validation.sanitized;

    // Verificar se e-mail já existe
    const existing = await this.userRepo.findByEmail(sanitized.email);
    if (existing) {
      throw new AuthenticationError('O e-mail informado já está em uso.', 409);
    }

    // Gerar hash seguro da senha
    const passwordHash = await this.hasher.hash(sanitized.password);

    // Salvar usuário
    const createdUser = await this.userRepo.create({
      name: sanitized.name,
      email: sanitized.email,
      passwordHash,
      role: sanitized.role || 'CLIENT',
      phone: sanitized.phone,
      isActive: true,
    });

    // Gerar token de autenticação
    const tokenData = this.tokenizer.generateToken({
      id: createdUser.id,
      email: createdUser.email,
      role: createdUser.role,
    });

    // Registrar log de auditoria
    this.auditRepo.log({
      action: 'REGISTER',
      targetId: createdUser.id,
      targetType: 'USER',
      user: createdUser.email,
      details: `Novo usuário registrado: ${createdUser.name} (${createdUser.email}) [IP: ${context?.ip || 'local'}]`,
    });

    return {
      user: this.toPublicUser(createdUser),
      token: tokenData.token,
      expiresIn: tokenData.expiresIn,
      tokenType: 'Bearer',
    };
  }

  /**
   * Autentica o usuário com proteção contra enumeração e timing attacks
   */
  public async login(
    dto: LoginDTO,
    context?: { ip?: string; userAgent?: string },
  ): Promise<AuthResponse> {
    const validation = validateLoginDTO(dto);
    if (!validation.isValid || !validation.sanitized) {
      throw new AuthenticationError(
        'Dados de login inválidos.',
        400,
        validation.errors,
      );
    }

    const { email, password } = validation.sanitized;
    const user = await this.userRepo.findByEmail(email);

    if (!user) {
      // Proteção contra enumeração de usuários por timing attack
      await this.hasher.dummyCompare();
      throw new AuthenticationError('Credenciais inválidas.', 401);
    }

    if (!user.isActive) {
      throw new AuthenticationError('Esta conta de usuário está desativada.', 403);
    }

    // Verificação de senha em tempo constante
    const isPasswordValid = await this.hasher.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new AuthenticationError('Credenciais inválidas.', 401);
    }

    // Atualizar último login
    const nowIso = new Date().toISOString();
    await this.userRepo.update(user.id, { lastLoginAt: nowIso });
    user.lastLoginAt = nowIso;

    // Gerar token de autenticação
    const tokenData = this.tokenizer.generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    // Registrar log de auditoria
    this.auditRepo.log({
      action: 'LOGIN',
      targetId: user.id,
      targetType: 'AUTH',
      user: user.email,
      details: `Login bem-sucedido: ${user.name} (${user.email}) [IP: ${context?.ip || 'local'}]`,
    });

    return {
      user: this.toPublicUser(user),
      token: tokenData.token,
      expiresIn: tokenData.expiresIn,
      tokenType: 'Bearer',
    };
  }

  /**
   * Encerra a sessão atual e invalida o token
   */
  public async logout(
    token: string,
    userId: string,
    userEmail: string,
    context?: { ip?: string },
  ): Promise<{ message: string }> {
    this.tokenizer.revokeToken(token);

    this.auditRepo.log({
      action: 'LOGOUT',
      targetId: userId,
      targetType: 'AUTH',
      user: userEmail,
      details: `Logout efetuado com sucesso. Token revogado. [IP: ${context?.ip || 'local'}]`,
    });

    return { message: 'Sessão encerrada com sucesso.' };
  }
}
