import { Router } from 'express';
import { PetController } from '../controllers/pet.controller.js';
import { uploadPetFotoMiddleware } from '../middleware/upload.middleware.js';

const router = Router();
const controller = new PetController();

router.get('/pets', controller.list);
router.post('/pets', controller.create);
router.get('/pets/:id', controller.getById);
router.put('/pets/:id', controller.update);
router.patch('/pets/:id', controller.update);
router.post('/pets/:id/foto', uploadPetFotoMiddleware.single('foto'), controller.uploadFoto);
router.delete('/pets/:id', controller.delete);

export default router;
