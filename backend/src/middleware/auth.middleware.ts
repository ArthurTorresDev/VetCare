import { Request, Response, NextFunction } from 'express';
import { tokenService } from '../services/token.service.js';
import type { UserRole } from '@vetcare/shared';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
  jti: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
  token?: string;
}

/**
 * Middleware para validação de Bearer Token JWT e controle de acesso a rotas protegidas
 */
export function authenticateToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).json({
      error: 'Acesso não autorizado. Cabeçalho de autorização não fornecido.',
      code: 'AUTH_HEADER_MISSING',
    });
    return;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    res.status(401).json({
      error: 'Formato de autorização inválido. Utilize o padrão: Bearer <token>.',
      code: 'AUTH_HEADER_MALFORMED',
    });
    return;
  }

  const token = parts[1];
  const verification = tokenService.verifyToken(token);

  if (!verification.isValid || !verification.payload) {
    if (verification.isRevoked) {
      res.status(401).json({
        error: 'Sessão encerrada ou token revogado. Faça login novamente.',
        code: 'TOKEN_REVOKED',
      });
      return;
    }

    if (verification.isExpired) {
      res.status(401).json({
        error: 'Token de autenticação expirado. Renove sua sessão.',
        code: 'TOKEN_EXPIRED',
      });
      return;
    }

    res.status(401).json({
      error: 'Token de autenticação inválido ou corrompido.',
      code: 'TOKEN_INVALID',
    });
    return;
  }

  // Injetar dados do usuário autenticado na requisição
  req.user = {
    id: verification.payload.sub,
    email: verification.payload.email,
    role: verification.payload.role,
    jti: verification.payload.jti,
  };
  req.token = token;

  next();
}
