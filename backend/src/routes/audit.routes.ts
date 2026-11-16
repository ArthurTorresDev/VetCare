import { Router } from 'express';
import { AuditController } from '../controllers/audit.controller.js';

const router = Router();
const controller = new AuditController();

router.get('/audit-logs', controller.list);

export default router;
