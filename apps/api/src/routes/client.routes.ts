import { Router } from 'express';
import { ClientController } from '../controllers/client.controller.js';

const router = Router();
const controller = new ClientController();

router.get('/clients', controller.list);
router.post('/clients', controller.create);
router.get('/clients/:id', controller.getById);
router.put('/clients/:id', controller.update);
router.patch('/clients/:id', controller.update);
router.delete('/clients/:id', controller.delete);
router.get('/clients/:id/pets', controller.getPets);
router.post('/clients/:id/pets', controller.addPet);

export default router;
