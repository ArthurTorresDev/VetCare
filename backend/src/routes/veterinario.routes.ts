import { Router } from 'express';
import { VeterinarioController } from '../controllers/veterinario.controller.js';

const router = Router();
const controller = new VeterinarioController();

router.get('/veterinarios', controller.list);
router.post('/veterinarios', controller.create);
router.get('/veterinarios/:id', controller.getById);
router.put('/veterinarios/:id', controller.update);
router.patch('/veterinarios/:id', controller.update);
router.delete('/veterinarios/:id', controller.delete);

export default router;
