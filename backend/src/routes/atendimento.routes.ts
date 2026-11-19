import { Router } from 'express';
import { AtendimentoController } from '../controllers/atendimento.controller.js';

const router = Router();
const controller = new AtendimentoController();

router.get('/atendimentos', controller.list);
router.post('/atendimentos', controller.create);
router.get('/atendimentos/:id', controller.getById);
router.put('/atendimentos/:id', controller.update);
router.patch('/atendimentos/:id', controller.update);
router.delete('/atendimentos/:id', controller.delete);

export default router;
