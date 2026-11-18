import { Router } from 'express';
import { ClientController } from '../controllers/client.controller.js';

const router = Router();
const controller = new ClientController();

router.get('/clientes', controller.list);
router.post('/clientes', controller.create);
router.get('/clientes/:id', controller.getById);
router.put('/clientes/:id', controller.update);
router.patch('/clientes/:id', controller.update);
router.delete('/clientes/:id', controller.delete);
router.get('/clientes/:id/pets', controller.getPets);
router.post('/clientes/:id/pets', controller.addPet);

export default router;
