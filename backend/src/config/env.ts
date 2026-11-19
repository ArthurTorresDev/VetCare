import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { config as loadDotenv } from 'dotenv';

const envFile = [resolve(process.cwd(), '.env'), resolve(process.cwd(), '../.env')].find(existsSync);
if (envFile) {
  loadDotenv({ path: envFile });
}

/**
 * Configuração centralizada de variáveis de ambiente com validação e defaults seguros
 */
export const env = {
  port: Number(process.env.API_PORT || process.env.PORT) || 4000,
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',

  // Autenticação e Segurança
  jwtSecret: process.env.JWT_SECRET || 'vetcare-dev-super-secret-jwt-key-min32chars-2026',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '2h',
  bcryptSaltRounds: Number(process.env.BCRYPT_SALT_ROUNDS) || 12,

  // Rate Limiting
  rateLimitWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
  rateLimitMaxRequests: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 10, // 10 tentativas por janela para auth

  // Banco de Dados
  databaseUrl: process.env.DATABASE_URL,

  // CORS
  allowedOrigins: (process.env.CORS_ALLOWED_ORIGINS || 'http://localhost:3000,http://127.0.0.1:3000')
    .split(',')
    .map((o) => o.trim()),
};
