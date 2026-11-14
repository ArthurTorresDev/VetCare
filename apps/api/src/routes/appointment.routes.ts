import { Router } from 'express';
import { AppointmentController } from '../controllers/appointment.controller.js';

const router = Router();
const controller = new AppointmentController();

router.get('/appointments/stats/kpi', controller.getKPIStats);
router.get('/appointments/export/xml', controller.exportXml);
router.get('/appointments', controller.list);
router.post('/appointments', controller.create);
router.get('/appointments/:id', controller.getById);
router.put('/appointments/:id', controller.update);
router.patch('/appointments/:id', controller.update);
router.patch('/appointments/:id/status', controller.updateStatus);
router.delete('/appointments/:id', controller.delete);

export default router;
