import { describe, it, expect, beforeEach } from 'vitest';
import { HashService } from '../../backend/src/services/hash.service.js';
import { TokenService, TokenBlacklistStore } from '../../backend/src/services/token.service.js';
import { InMemoryUserRepository } from '../../backend/src/repositories/in-memory-user.repository.js';
import { InMemoryStore } from '../../backend/src/models/in-memory.store.js';
import { AuditRepository } from '../../backend/src/repositories/audit.repository.js';
import { AuthService, AuthenticationError } from '../../backend/src/services/auth.service.js';
import { UserService } from '../../backend/src/services/user.service.js';
import { RateLimiter } from '../../backend/src/middleware/rate-limiter.middleware.js';
import { authenticateToken, AuthenticatedRequest } from '../../backend/src/middleware/auth.middleware.js';
import {
  isValidEmail,
  validatePasswordRequirements,
  validateRegisterDTO,
  validateLoginDTO,
  validateUpdateUserDTO,
  validateChangePasswordDTO,
  validateDeleteAccountDTO,
} from '../../packages/shared/src/index.js';

describe('Sistema de Autenticação e Gerenciamento de Usuários (MVC & RESTful)', () => {
  let hashService: HashService;
  let tokenService: TokenService;
  let blacklistStore: TokenBlacklistStore;
  let userRepo: InMemoryUserRepository;
  let auditRepo: AuditRepository;
  let authService: AuthService;
  let userService: UserService;

  beforeEach(() => {
    InMemoryStore.getInstance().reset();
    blacklistStore = TokenBlacklistStore.getInstance();
    blacklistStore.clear();

    hashService = new HashService();
    tokenService = new TokenService(blacklistStore);
    userRepo = new InMemoryUserRepository();
    auditRepo = new AuditRepository();

    authService = new AuthService(userRepo, auditRepo, hashService, tokenService);
    userService = new UserService(userRepo, auditRepo, hashService, tokenService);
  });

  // ─── 1. Criptografia e Hashing Seguro (Scrypt & Timing Protection) ───────────
  describe('1. Criptografia e Hashing Seguro (HashService)', () => {
    it('deve gerar hash seguro no formato scrypt com salt aleatório', async () => {
      const password = 'SenhaForte#2026';
      const hash1 = await hashService.hash(password);
      const hash2 = await hashService.hash(password);

      expect(hash1).toMatch(/^scrypt\$N=\d+,r=\d+,p=\d+\$[a-f0-9]+\$[a-f0-9]+$/);
      // Salting: dois hashes para a mesma senha devem ser diferentes
      expect(hash1).not.toBe(hash2);
    });

    it('deve validar corretamente a senha com compare()', async () => {
      const password = 'SenhaForte#2026';
      const hash = await hashService.hash(password);

      const isValid = await hashService.compare(password, hash);
      const isInvalid = await hashService.compare('SenhaIncorreta#2026', hash);

      expect(isValid).toBe(true);
      expect(isInvalid).toBe(false);
    });

    it('deve retornar false de forma segura caso o hash esteja corrompido', async () => {
      const isValid = await hashService.compare('qualquerSenha', 'hash_corrompido_invalido');
      expect(isValid).toBe(false);
    });

    it('deve executar dummyCompare() para prevenção de enumeração por timing attack', async () => {
      await expect(hashService.dummyCompare()).resolves.not.toThrow();
    });
  });

  // ─── 2. Geração e Verificação de Tokens JWT (RFC 7519) ──────────────────────
  describe('2. Gestão Segura de Tokens JWT (TokenService)', () => {
    it('deve gerar um token JWT com 3 partes e payload correto', () => {
      const user = { id: 'usr_test_1', email: 'arthur@exemplo.com', role: 'ADMIN' as const };
      const { token, jti, expiresIn } = tokenService.generateToken(user);

      expect(token).toBeDefined();
      expect(token.split('.')).toHaveLength(3);
      expect(jti).toBeDefined();
      expect(expiresIn).toBe('2h');

      const verification = tokenService.verifyToken(token);
      expect(verification.isValid).toBe(true);
      expect(verification.payload?.sub).toBe(user.id);
      expect(verification.payload?.email).toBe(user.email);
      expect(verification.payload?.role).toBe('ADMIN');
      expect(verification.payload?.jti).toBe(jti);
    });

    it('deve rejeitar tokens com assinatura violada ou adulterada', () => {
      const user = { id: 'usr_test_2', email: 'maria@exemplo.com', role: 'CLIENT' as const };
      const { token } = tokenService.generateToken(user);

      // Adulterar a assinatura
      const parts = token.split('.');
      const tamperedToken = `${parts[0]}.${parts[1]}.assinaturaFalsaOuAlterada12345`;

      const verification = tokenService.verifyToken(tamperedToken);
      expect(verification.isValid).toBe(false);
      expect(verification.error).toBe('Assinatura do token inválida.');
    });

    it('deve revogar o token no logout e impedi-lo de ser utilizado novamente', () => {
      const user = { id: 'usr_test_3', email: 'carlos@exemplo.com', role: 'VET' as const };
      const { token } = tokenService.generateToken(user);

      // Token válido antes do logout
      expect(tokenService.verifyToken(token).isValid).toBe(true);

      // Revogação
      const revoked = tokenService.revokeToken(token);
      expect(revoked).toBe(true);

      // Verificação após revogação
      const afterRevocation = tokenService.verifyToken(token);
      expect(afterRevocation.isValid).toBe(false);
      expect(afterRevocation.isRevoked).toBe(true);
      expect(afterRevocation.error).toContain('revogado');
    });
  });

  // ─── 3. Validações e Regras de Negócio (Camada de Domínio / Validation) ─────
  describe('3. Validações de Entrada e Segurança', () => {
    it('deve validar formatos de e-mail válidos e inválidos', () => {
      expect(isValidEmail('tutor@clinica.com.br')).toBe(true);
      expect(isValidEmail('arthur.steiner@medpet.vet')).toBe(true);
      expect(isValidEmail('invalido@')).toBe(false);
      expect(isValidEmail('@semdominio.com')).toBe(false);
      expect(isValidEmail('email sem arroba')).toBe(false);
    });

    it('deve validar os critérios mínimos de segurança para senhas', () => {
      // Falta maiúscula
      expect(validatePasswordRequirements('senha123!').isValid).toBe(false);
      // Falta minúscula
      expect(validatePasswordRequirements('SENHA123!').isValid).toBe(false);
      // Falta número
      expect(validatePasswordRequirements('SenhaSemNumero!').isValid).toBe(false);
      // Falta especial
      expect(validatePasswordRequirements('SenhaComNumero123').isValid).toBe(false);
      // Menos de 8 caracteres
      expect(validatePasswordRequirements('Ab1!').isValid).toBe(false);
      // Senha Forte válida
      expect(validatePasswordRequirements('SenhaSegura#2026').isValid).toBe(true);
    });

    it('deve validar e sanitizar dados de cadastro (RegisterUserDTO)', () => {
      const invalid = validateRegisterDTO({
        name: 'Ar',
        email: 'invalido',
        password: '123',
      });
      expect(invalid.isValid).toBe(false);
      expect(invalid.errors.length).toBeGreaterThan(0);

      const valid = validateRegisterDTO({
        name: '   Arthur Steiner   ',
        email: '  ARTHUR@VETCARE.COM  ',
        password: 'SenhaForte#2026',
        confirmPassword: 'SenhaForte#2026',
        phone: '(11) 98765-4321',
      });
      expect(valid.isValid).toBe(true);
      expect(valid.sanitized?.name).toBe('Arthur Steiner');
      expect(valid.sanitized?.email).toBe('arthur@vetcare.com');
    });

    it('deve rejeitar campos protegidos em UpdateUserDTO', () => {
      const maliciousUpdate = validateUpdateUserDTO({
        name: 'Nome Atualizado',
        role: 'ADMIN', // Não pode mudar role por aqui
        id: 'outro_id', // Não pode mudar ID
      });
      expect(maliciousUpdate.isValid).toBe(false);
      expect(maliciousUpdate.errors).toEqual(
        expect.arrayContaining([
          expect.stringContaining('role'),
          expect.stringContaining('id'),
        ]),
      );
    });
  });

  // ─── 4. Cadastro de Usuários (AuthService.register) ──────────────────────────
  describe('4. Cadastro de Usuários (POST /auth/register)', () => {
    it('deve registrar usuário com sucesso e retornar token sem expor a senha', async () => {
      const result = await authService.register({
        name: 'Arthur Steiner',
        email: 'arthur@vetcare.com',
        password: 'SenhaForte#2026',
        phone: '(11) 98765-4321',
      });

      expect(result.token).toBeDefined();
      expect(result.tokenType).toBe('Bearer');
      expect(result.user.id).toBeDefined();
      expect(result.user.name).toBe('Arthur Steiner');
      expect(result.user.email).toBe('arthur@vetcare.com');
      // Garantir categoricamente que password ou passwordHash NUNCA trafegam
      expect((result.user as any).password).toBeUndefined();
      expect((result.user as any).passwordHash).toBeUndefined();

      // Checar se foi registrado na auditoria
      const logs = auditRepo.findAll();
      expect(logs.some((l) => l.action === 'REGISTER')).toBe(true);
    });

    it('deve impedir cadastro com e-mail duplicado (case-insensitive)', async () => {
      await authService.register({
        name: 'Arthur Steiner',
        email: 'arthur@vetcare.com',
        password: 'SenhaForte#2026',
      });

      await expect(
        authService.register({
          name: 'Arthur Outro',
          email: 'ARTHUR@VETCARE.COM', // maiúsculo
          password: 'OutraSenhaForte#2026',
        }),
      ).rejects.toThrow(AuthenticationError);

      try {
        await authService.register({
          name: 'Arthur Outro',
          email: 'arthur@vetcare.com',
          password: 'OutraSenhaForte#2026',
        });
      } catch (err: any) {
        expect(err.statusCode).toBe(409);
        expect(err.message).toBe('O e-mail informado já está em uso.');
      }
    });

    it('deve rejeitar cadastro com dados inválidos ou senhas fracas', async () => {
      await expect(
        authService.register({
          name: 'A',
          email: 'email-errado',
          password: 'fraca',
        }),
      ).rejects.toThrow(AuthenticationError);
    });
  });

  // ─── 5. Autenticação e Login (AuthService.login) ─────────────────────────────
  describe('5. Autenticação e Login (POST /auth/login)', () => {
    beforeEach(async () => {
      await authService.register({
        name: 'Dra. Camila',
        email: 'camila@vetcare.com',
        password: 'SenhaForte#2026',
        role: 'VET',
      });
    });

    it('deve autenticar usuário com credenciais corretas', async () => {
      const result = await authService.login({
        email: 'CAMILA@VETCARE.COM',
        password: 'SenhaForte#2026',
      });

      expect(result.token).toBeDefined();
      expect(result.user.email).toBe('camila@vetcare.com');
      expect(result.user.lastLoginAt).toBeDefined();
      expect((result.user as any).passwordHash).toBeUndefined();

      const logs = auditRepo.findAll();
      expect(logs.some((l) => l.action === 'LOGIN')).toBe(true);
    });

    it('deve rejeitar login com senha incorreta com mensagem genérica (anti-enumeração)', async () => {
      try {
        await authService.login({
          email: 'camila@vetcare.com',
          password: 'SenhaErrada#2026',
        });
        expect.fail('Deveria ter lançado AuthenticationError');
      } catch (err: any) {
        expect(err.statusCode).toBe(401);
        expect(err.message).toBe('Credenciais inválidas.');
      }
    });

    it('deve rejeitar login com e-mail inexistente com a mesma mensagem genérica', async () => {
      try {
        await authService.login({
          email: 'usuario.inexistente@vetcare.com',
          password: 'SenhaForte#2026',
        });
        expect.fail('Deveria ter lançado AuthenticationError');
      } catch (err: any) {
        expect(err.statusCode).toBe(401);
        expect(err.message).toBe('Credenciais inválidas.');
      }
    });
  });

  // ─── 6. Visualização e Atualização de Conta (UserService) ───────────────────
  describe('6. Gestão de Conta Própria (GET & PATCH /users/me)', () => {
    let testUserId: string;

    beforeEach(async () => {
      const reg = await authService.register({
        name: 'Bruno Silva',
        email: 'bruno@vetcare.com',
        password: 'SenhaForte#2026',
        phone: '(11) 91111-2222',
      });
      testUserId = reg.user.id;
    });

    it('deve consultar o perfil próprio sem expor dados confidenciais', async () => {
      const profile = await userService.getProfile(testUserId);
      expect(profile.id).toBe(testUserId);
      expect(profile.name).toBe('Bruno Silva');
      expect(profile.email).toBe('bruno@vetcare.com');
      expect((profile as any).passwordHash).toBeUndefined();
    });

    it('deve atualizar dados cadastrais próprios com sucesso', async () => {
      const updated = await userService.updateProfile(testUserId, {
        name: 'Bruno Silva Santos',
        phone: '(11) 93333-4444',
      });

      expect(updated.name).toBe('Bruno Silva Santos');
      expect(updated.phone).toBe('(11) 93333-4444');
      expect(updated.email).toBe('bruno@vetcare.com');
    });

    it('deve impedir que o usuário atualize seu e-mail para um que já pertence a outro usuário', async () => {
      // Criar segundo usuário
      await authService.register({
        name: 'Outro Usuario',
        email: 'outro@vetcare.com',
        password: 'SenhaForte#2026',
      });

      try {
        await userService.updateProfile(testUserId, {
          email: 'outro@vetcare.com',
        });
        expect.fail('Deveria ter lançado erro de conflito de e-mail');
      } catch (err: any) {
        expect(err.statusCode).toBe(409);
        expect(err.message).toContain('já está em uso');
      }
    });
  });

  // ─── 7. Alteração de Senha (PATCH /users/me/password) ────────────────────────
  describe('7. Alteração de Senha Segura (PATCH /users/me/password)', () => {
    let testUserId: string;

    beforeEach(async () => {
      const reg = await authService.register({
        name: 'Felipe Alencar',
        email: 'felipe@vetcare.com',
        password: 'SenhaAntiga#2026',
      });
      testUserId = reg.user.id;
    });

    it('deve alterar a senha com validação da senha atual', async () => {
      const result = await userService.changePassword(testUserId, {
        currentPassword: 'SenhaAntiga#2026',
        newPassword: 'NovaSenhaUltraSegura#2027',
      });

      expect(result.message).toBe('Senha alterada com sucesso.');

      // O login com a nova senha deve funcionar
      const loginNew = await authService.login({
        email: 'felipe@vetcare.com',
        password: 'NovaSenhaUltraSegura#2027',
      });
      expect(loginNew.token).toBeDefined();

      // O login com a senha antiga deve falhar
      await expect(
        authService.login({
          email: 'felipe@vetcare.com',
          password: 'SenhaAntiga#2026',
        }),
      ).rejects.toThrow(AuthenticationError);
    });

    it('deve rejeitar alteração se a senha atual informada estiver incorreta', async () => {
      try {
        await userService.changePassword(testUserId, {
          currentPassword: 'SenhaErrada#2026',
          newPassword: 'NovaSenhaUltraSegura#2027',
        });
        expect.fail('Deveria ter rejeitado senha atual errada');
      } catch (err: any) {
        expect(err.statusCode).toBe(400);
        expect(err.message).toContain('incorreta');
      }
    });

    it('deve rejeitar se a nova senha for idêntica à senha atual', async () => {
      try {
        await userService.changePassword(testUserId, {
          currentPassword: 'SenhaAntiga#2026',
          newPassword: 'SenhaAntiga#2026',
        });
        expect.fail('Deveria ter rejeitado senha idêntica');
      } catch (err: any) {
        expect(err.statusCode).toBe(400);
        expect(err.details).toEqual(
          expect.arrayContaining([expect.stringContaining('diferente')]),
        );
      }
    });
  });

  // ─── 8. Exclusão de Conta Própria (DELETE /users/me) ────────────────────────
  describe('8. Exclusão de Conta Própria (DELETE /users/me)', () => {
    let testUserId: string;
    let testToken: string;

    beforeEach(async () => {
      const reg = await authService.register({
        name: 'Usuario Temporario',
        email: 'temp@vetcare.com',
        password: 'SenhaForte#2026',
      });
      testUserId = reg.user.id;
      testToken = reg.token;
    });

    it('deve excluir a própria conta mediante confirmação e senha, revogando o token', async () => {
      const deleteResult = await userService.deleteAccount(
        testUserId,
        {
          password: 'SenhaForte#2026',
          confirmation: 'EXCLUIR',
        },
        testToken,
      );

      expect(deleteResult.message).toContain('excluída com sucesso');
      expect(deleteResult.id).toBe(testUserId);

      // Usuário não deve mais existir no repositório
      const search = await userRepo.findById(testUserId);
      expect(search).toBeNull();

      // Token deve ter sido revogado imediatamente
      const verify = tokenService.verifyToken(testToken);
      expect(verify.isValid).toBe(false);
      expect(verify.isRevoked).toBe(true);

      // Nova tentativa de login deve falhar
      await expect(
        authService.login({
          email: 'temp@vetcare.com',
          password: 'SenhaForte#2026',
        }),
      ).rejects.toThrow();
    });

    it('deve rejeitar exclusão se a senha de confirmação estiver incorreta', async () => {
      try {
        await userService.deleteAccount(testUserId, {
          password: 'SenhaIncorreta#2026',
          confirmation: 'EXCLUIR',
        });
        expect.fail('Deveria ter rejeitado senha incorreta');
      } catch (err: any) {
        expect(err.statusCode).toBe(400);
        expect(err.message).toContain('Senha incorreta');
      }
    });

    it('deve rejeitar exclusão se a palavra de confirmação não for "EXCLUIR"', async () => {
      try {
        await userService.deleteAccount(testUserId, {
          password: 'SenhaForte#2026',
          confirmation: 'CONFIRMAR', // Errado
        });
        expect.fail('Deveria ter rejeitado confirmação inválida');
      } catch (err: any) {
        expect(err.statusCode).toBe(400);
        expect(err.details).toEqual(
          expect.arrayContaining([expect.stringContaining('EXCLUIR')]),
        );
      }
    });
  });

  // ─── 9. Middlewares (Auth & Rate Limiting) ──────────────────────────────────
  describe('9. Middlewares de Segurança e Proteção', () => {
    it('deve rejeitar requisição protegida sem cabeçalho Authorization', () => {
      const req: Partial<AuthenticatedRequest> = { headers: {} };
      let statusCode = 0;
      let responseBody: any = null;

      const res: any = {
        status: (code: number) => {
          statusCode = code;
          return {
            json: (body: any) => {
              responseBody = body;
            },
          };
        },
      };

      let nextCalled = false;
      authenticateToken(req as any, res, () => {
        nextCalled = true;
      });

      expect(nextCalled).toBe(false);
      expect(statusCode).toBe(401);
      expect(responseBody.code).toBe('AUTH_HEADER_MISSING');
    });

    it('deve autorizar requisição com token Bearer válido e injetar req.user', () => {
      const { token } = tokenService.generateToken({
        id: 'usr_valid_123',
        email: 'valido@vetcare.com',
        role: 'CLIENT',
      });

      const req: Partial<AuthenticatedRequest> = {
        headers: {
          authorization: `Bearer ${token}`,
        },
      };

      let nextCalled = false;
      const res: any = {};

      authenticateToken(req as any, res, () => {
        nextCalled = true;
      });

      expect(nextCalled).toBe(true);
      expect(req.user?.id).toBe('usr_valid_123');
      expect(req.user?.email).toBe('valido@vetcare.com');
      expect(req.token).toBe(token);
    });

    it('deve bloquear requisições excedentes via RateLimiter (HTTP 429)', () => {
      const limiter = new RateLimiter(60000, 3); // Max 3 requisições
      const req: any = {
        headers: { 'x-forwarded-for': '192.168.1.100' },
        socket: {},
      };

      let lastStatus = 0;
      let lastBody: any = null;
      const res: any = {
        setHeader: () => {},
        status: (code: number) => {
          lastStatus = code;
          return {
            json: (body: any) => {
              lastBody = body;
            },
          };
        },
      };

      // 1ª, 2ª e 3ª tentativas (devem passar)
      let passCount = 0;
      for (let i = 0; i < 3; i++) {
        limiter.middleware(req, res, () => {
          passCount++;
        });
      }
      expect(passCount).toBe(3);

      // 4ª tentativa (deve ser bloqueada com 429)
      limiter.middleware(req, res, () => {
        passCount++;
      });
      expect(passCount).toBe(3); // Não incrementou
      expect(lastStatus).toBe(429);
      expect(lastBody.code).toBe('RATE_LIMIT_EXCEEDED');
    });
  });
});
