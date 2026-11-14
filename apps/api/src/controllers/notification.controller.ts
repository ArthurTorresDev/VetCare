import { Request, Response } from 'express';
import { NotificationRepository } from '../domain/repositories/notification.repository.js';

export class NotificationController {
  private repo: NotificationRepository;

  constructor(repo = new NotificationRepository()) {
    this.repo = repo;
  }

  list = (_req: Request, res: Response) => {
    res.json(this.repo.findAll());
  };
}
