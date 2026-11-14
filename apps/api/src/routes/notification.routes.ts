import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller.js';

const router = Router();
const controller = new NotificationController();

router.get('/notifications', controller.list);

export default router;
