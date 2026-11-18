import { Router } from 'express';
import { AtendenteController } from '../controllers/atendente.controller.js';

const router = Router();
const controller = new AtendenteController();

router.get('/atendentes', controller.list);
router.post('/atendentes', controller.create);
router.get('/atendentes/:id', controller.getById);
router.put('/atendentes/:id', controller.update);
router.patch('/atendentes/:id', controller.update);
router.delete('/atendentes/:id', controller.delete);

export default router;
