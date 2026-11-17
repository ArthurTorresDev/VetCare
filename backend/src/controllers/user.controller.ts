import { Response, NextFunction } from 'express';
import { UserService } from '../services/user.service.js';
import type { AuthenticatedRequest } from '../middleware/auth.middleware.js';

export class UserController {
  private userService: UserService;

  constructor(userService = new UserService()) {
    this.userService = userService;
  }

  public getMe = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Usuário não autenticado.' });
        return;
      }

      const profile = await this.userService.getProfile(req.user.id);
      res.status(200).json(profile);
    } catch (error) {
      next(error);
    }
  };

  public updateMe = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Usuário não autenticado.' });
        return;
      }

      const clientIp =
        (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
        req.socket.remoteAddress;

      const updated = await this.userService.updateProfile(req.user.id, req.body, {
        ip: clientIp,
      });

      res.status(200).json(updated);
    } catch (error) {
      next(error);
    }
  };

  public changePassword = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Usuário não autenticado.' });
        return;
      }

      const clientIp =
        (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
        req.socket.remoteAddress;

      const result = await this.userService.changePassword(req.user.id, req.body, {
        ip: clientIp,
      });

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  public deleteMe = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Usuário não autenticado.' });
        return;
      }

      const clientIp =
        (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
        req.socket.remoteAddress;

      const result = await this.userService.deleteAccount(
        req.user.id,
        req.body,
        req.token,
        { ip: clientIp },
      );

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}

export const userController = new UserController();
