import { Request, Response } from 'express';
import { AuditRepository } from '../repositories/audit.repository.js';

export class AuditController {
  private auditRepo: AuditRepository;

  constructor(auditRepo = new AuditRepository()) {
    this.auditRepo = auditRepo;
  }

  list = (_req: Request, res: Response) => {
    res.json(this.auditRepo.findAll());
  };
}
