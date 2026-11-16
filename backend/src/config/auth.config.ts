import { env } from './env.js';

export const authConfig = {
  jwt: {
    secret: env.jwtSecret,
    expiresIn: env.jwtExpiresIn,
    algorithm: 'HS256' as const,
    issuer: 'vetcare-api',
    audience: 'vetcare-app',
  },
  hash: {
    // Parâmetros Scrypt (NIST / OWASP recomendados: N=16384, r=8, p=1, keylen=64)
    cost: 16384,
    blockSize: 8,
    parallelization: 1,
    keyLength: 64,
    saltLength: 16,
  },
  rateLimit: {
    windowMs: env.rateLimitWindowMs,
    maxRequests: env.rateLimitMaxRequests,
  },
};
