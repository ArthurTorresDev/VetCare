import { Request, Response } from 'express';

export class HealthController {
  check(_req: Request, res: Response) {
    res.json({
      status: 'ok',
      service: 'VetCare / VetCare API (MVC Architecture)',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  }
}
