import { Request, Response, NextFunction } from 'express';
import { authConfig } from '../config/auth.config.js';

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

export class RateLimiter {
  private records: Map<string, RateLimitRecord> = new Map();
  private windowMs: number;
  private maxRequests: number;

  constructor(
    windowMs = authConfig.rateLimit.windowMs,
    maxRequests = authConfig.rateLimit.maxRequests,
  ) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  public reset(): void {
    this.records.clear();
  }

  public middleware = (req: Request, res: Response, next: NextFunction): void => {
    // Obter identificador do cliente (IP ou X-Forwarded-For)
    const clientIp =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.socket.remoteAddress ||
      'unknown-ip';

    const now = Date.now();
    let record = this.records.get(clientIp);

    if (!record || record.resetAt <= now) {
      record = {
        count: 1,
        resetAt: now + this.windowMs,
      };
      this.records.set(clientIp, record);
    } else {
      record.count += 1;
    }

    const remaining = Math.max(0, this.maxRequests - record.count);
    const retryAfterSeconds = Math.ceil((record.resetAt - now) / 1000);

    res.setHeader('X-RateLimit-Limit', this.maxRequests);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', Math.ceil(record.resetAt / 1000));

    if (record.count > this.maxRequests) {
      res.setHeader('Retry-After', retryAfterSeconds);
      res.status(429).json({
        error: 'Muitas tentativas de autenticação. Por favor, tente novamente mais tarde.',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfterSeconds,
      });
      return;
    }

    next();
  };
}

export const authRateLimiter = new RateLimiter();
