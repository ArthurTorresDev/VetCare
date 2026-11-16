import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { authRateLimiter } from '../middleware/rate-limiter.middleware.js';

const authRoutes = Router();

/**
 * @route   POST /auth/register
 * @desc    Cadastro de nova conta de usuário
 * @access  Público (com Rate Limiting)
 */
authRoutes.post('/auth/register', authRateLimiter.middleware, authController.register);

/**
 * @route   POST /auth/login
 * @desc    Autenticação e obtenção de token JWT
 * @access  Público (com Rate Limiting)
 */
authRoutes.post('/auth/login', authRateLimiter.middleware, authController.login);

/**
 * @route   POST /auth/logout
 * @desc    Encerramento de sessão e revogação do token JWT
 * @access  Protegido (Bearer Token)
 */
authRoutes.post('/auth/logout', authenticateToken, authController.logout);

export default authRoutes;
