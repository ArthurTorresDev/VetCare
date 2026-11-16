import crypto from 'node:crypto';
import { authConfig } from '../config/auth.config.js';
import type { TokenPayload, UserRole } from '@vetcare/shared';

export interface DecodedTokenResult {
  isValid: boolean;
  isExpired: boolean;
  isRevoked: boolean;
  payload?: TokenPayload;
  error?: string;
}

export class TokenBlacklistStore {
  private static instance: TokenBlacklistStore;
  // Mapa de JTI -> timestamp de expiração (ms)
  private blacklistedJtis: Map<string, number> = new Map();

  public static getInstance(): TokenBlacklistStore {
    if (!TokenBlacklistStore.instance) {
      TokenBlacklistStore.instance = new TokenBlacklistStore();
    }
    return TokenBlacklistStore.instance;
  }

  public revoke(jti: string, expTimestampSec: number): void {
    const expiresAtMs = expTimestampSec * 1000;
    this.blacklistedJtis.set(jti, expiresAtMs);
    this.cleanup();
  }

  public isRevoked(jti: string): boolean {
    this.cleanup();
    return this.blacklistedJtis.has(jti);
  }

  public clear(): void {
    this.blacklistedJtis.clear();
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [jti, expiresAtMs] of this.blacklistedJtis.entries()) {
      if (expiresAtMs <= now) {
        this.blacklistedJtis.delete(jti);
      }
    }
  }
}

export class TokenService {
  private static instance: TokenService;
  private blacklist: TokenBlacklistStore;

  constructor(blacklist = TokenBlacklistStore.getInstance()) {
    this.blacklist = blacklist;
  }

  public static getInstance(): TokenService {
    if (!TokenService.instance) {
      TokenService.instance = new TokenService();
    }
    return TokenService.instance;
  }

  /**
   * Converte string para formato Base64URL (RFC 7515 / RFC 7519)
   */
  private toBase64Url(input: string | Buffer): string {
    const buf = typeof input === 'string' ? Buffer.from(input, 'utf-8') : input;
    return buf
      .toString('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
  }

  /**
   * Converte Base64URL para Buffer
   */
  private fromBase64Url(input: string): Buffer {
    let base64 = input.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4 !== 0) {
      base64 += '=';
    }
    return Buffer.from(base64, 'base64');
  }

  /**
   * Converte string de duração (ex: '2h', '1d', '30m', '3600s') para segundos
   */
  private parseExpiresInSeconds(duration: string): number {
    const match = duration.match(/^(\d+)([smhd])$/);
    if (!match) return 7200; // default 2h
    const value = parseInt(match[1], 10);
    const unit = match[2];
    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 3600;
      case 'd':
        return value * 86400;
      default:
        return 7200;
    }
  }

  /**
   * Gera um token de autenticação JWT assinado
   */
  public generateToken(user: { id: string; email: string; role: UserRole }): {
    token: string;
    jti: string;
    expiresIn: string;
    expiresAt: number;
  } {
    const header = {
      alg: authConfig.jwt.algorithm,
      typ: 'JWT',
    };

    const now = Math.floor(Date.now() / 1000);
    const validSeconds = this.parseExpiresInSeconds(authConfig.jwt.expiresIn);
    const exp = now + validSeconds;
    const jti = crypto.randomUUID();

    const payload: TokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      jti,
      iat: now,
      exp,
    };

    const headerB64 = this.toBase64Url(JSON.stringify(header));
    const payloadB64 = this.toBase64Url(JSON.stringify(payload));
    const dataToSign = `${headerB64}.${payloadB64}`;

    const signature = crypto
      .createHmac('sha256', authConfig.jwt.secret)
      .update(dataToSign)
      .digest();

    const signatureB64 = this.toBase64Url(signature);
    const token = `${dataToSign}.${signatureB64}`;

    return {
      token,
      jti,
      expiresIn: authConfig.jwt.expiresIn,
      expiresAt: exp,
    };
  }

  /**
   * Valida e decodifica um token JWT, checando assinatura, expiração e blacklist.
   */
  public verifyToken(token: string): DecodedTokenResult {
    if (!token || typeof token !== 'string') {
      return { isValid: false, isExpired: false, isRevoked: false, error: 'Token não fornecido.' };
    }

    const parts = token.trim().split('.');
    if (parts.length !== 3) {
      return { isValid: false, isExpired: false, isRevoked: false, error: 'Formato de token inválido.' };
    }

    const [headerB64, payloadB64, signatureB64] = parts;
    const dataToSign = `${headerB64}.${payloadB64}`;

    // 1. Verificação da assinatura criptográfica
    const expectedSignature = crypto
      .createHmac('sha256', authConfig.jwt.secret)
      .update(dataToSign)
      .digest();

    const actualSignature = this.fromBase64Url(signatureB64);

    if (
      expectedSignature.length !== actualSignature.length ||
      !crypto.timingSafeEqual(expectedSignature, actualSignature)
    ) {
      return {
        isValid: false,
        isExpired: false,
        isRevoked: false,
        error: 'Assinatura do token inválida.',
      };
    }

    // 2. Parse do payload
    let payload: TokenPayload;
    try {
      const payloadJson = this.fromBase64Url(payloadB64).toString('utf-8');
      payload = JSON.parse(payloadJson);
    } catch {
      return {
        isValid: false,
        isExpired: false,
        isRevoked: false,
        error: 'Payload do token malformado.',
      };
    }

    // 3. Verificação de expiração temporal
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp <= now) {
      return {
        isValid: false,
        isExpired: true,
        isRevoked: false,
        payload,
        error: 'Token expirado.',
      };
    }

    // 4. Verificação de revogação na Blacklist (Logout / Encerramento de sessão)
    if (payload.jti && this.blacklist.isRevoked(payload.jti)) {
      return {
        isValid: false,
        isExpired: false,
        isRevoked: true,
        payload,
        error: 'Token revogado. Sessão encerrada.',
      };
    }

    return {
      isValid: true,
      isExpired: false,
      isRevoked: false,
      payload,
    };
  }

  /**
   * Revoga um token (Logout)
   */
  public revokeToken(token: string): boolean {
    const result = this.verifyToken(token);
    if (result.payload && result.payload.jti) {
      this.blacklist.revoke(result.payload.jti, result.payload.exp);
      return true;
    }
    return false;
  }
}

export const tokenService = TokenService.getInstance();
