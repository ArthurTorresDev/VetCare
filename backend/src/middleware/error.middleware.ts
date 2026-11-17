import { Request, Response, NextFunction } from 'express';
import { AuthenticationError } from '../services/auth.service.js';
import { env } from '../config/env.js';

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof AuthenticationError) {
    return res.status(err.statusCode).json({
      error: err.message,
      details: err.details || undefined,
    });
  }

  if (!env.isTest) {
    console.error('[Unhandled Error]', err);
  }

  const status = typeof err.statusCode === 'number' ? err.statusCode : err.status || 500;
  const message =
    status === 500 && env.isProduction
      ? 'Ocorreu um erro interno no servidor.'
      : err.message || 'Erro interno do servidor';

  res.status(status).json({
    error: message,
    details: err.details || undefined,
  });
}
