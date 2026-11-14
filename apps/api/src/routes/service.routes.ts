import { Router } from 'express';
import { ServiceController } from '../controllers/service.controller.js';

const router = Router();
const controller = new ServiceController();

router.get('/services', controller.list);
router.post('/services', controller.create);
router.get('/services/:id', controller.getById);
router.put('/services/:id', controller.update);
router.patch('/services/:id', controller.update);
router.delete('/services/:id', controller.delete);

export default router;
