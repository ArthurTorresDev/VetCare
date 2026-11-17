import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service.js';
import type { AuthenticatedRequest } from '../middleware/auth.middleware.js';

export class AuthController {
  private authService: AuthService;

  constructor(authService = new AuthService()) {
    this.authService = authService;
  }

  public register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const clientIp =
        (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
        req.socket.remoteAddress;
      const userAgent = req.headers['user-agent'];

      const result = await this.authService.register(req.body, {
        ip: clientIp,
        userAgent,
      });

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  public login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const clientIp =
        (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
        req.socket.remoteAddress;
      const userAgent = req.headers['user-agent'];

      const result = await this.authService.login(req.body, {
        ip: clientIp,
        userAgent,
      });

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  public logout = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const token = req.token;
      const user = req.user;

      if (!token || !user) {
        res.status(401).json({ error: 'Sessão não identificada.' });
        return;
      }

      const clientIp =
        (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
        req.socket.remoteAddress;

      const result = await this.authService.logout(token, user.id, user.email, {
        ip: clientIp,
      });

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}

export const authController = new AuthController();
