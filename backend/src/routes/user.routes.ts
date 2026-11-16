import { Router } from 'express';
import { userController } from '../controllers/user.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const userRoutes = Router();

/**
 * @route   GET /users/me
 * @desc    Consulta os dados cadastrais do próprio usuário autenticado
 * @access  Protegido (Bearer Token)
 */
userRoutes.get('/users/me', authenticateToken, userController.getMe);

/**
 * @route   PATCH /users/me
 * @desc    Atualiza dados cadastrais da própria conta
 * @access  Protegido (Bearer Token)
 */
userRoutes.patch('/users/me', authenticateToken, userController.updateMe);

/**
 * @route   PATCH /users/me/password
 * @desc    Altera a senha da própria conta (exige senha atual)
 * @access  Protegido (Bearer Token)
 */
userRoutes.patch('/users/me/password', authenticateToken, userController.changePassword);

/**
 * @route   DELETE /users/me
 * @desc    Exclui a própria conta do usuário (exige confirmação e senha atual)
 * @access  Protegido (Bearer Token)
 */
userRoutes.delete('/users/me', authenticateToken, userController.deleteMe);

export default userRoutes;
