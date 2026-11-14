import { Router } from 'express';
import { GoogleCalendarController } from '../controllers/google-calendar.controller.js';

const router = Router();
const controller = new GoogleCalendarController();

router.get('/google-calendar/status', controller.getStatus);

export default router;
