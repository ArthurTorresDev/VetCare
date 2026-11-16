import { Router } from 'express';
import healthRoutes from './health.routes.js';
import clientRoutes from './client.routes.js';
import petRoutes from './pet.routes.js';
import serviceRoutes from './service.routes.js';
import appointmentRoutes from './appointment.routes.js';
import auditRoutes from './audit.routes.js';
import notificationRoutes from './notification.routes.js';
import googleCalendarRoutes from './google-calendar.routes.js';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import docsRoutes from './docs.routes.js';

const apiRouter = Router();

// Documentação da API (OpenAPI / Swagger UI)
apiRouter.use(docsRoutes);

// Rotas de Autenticação e Usuários
apiRouter.use(authRoutes);
apiRouter.use(userRoutes);

// Rotas de Domínio da Clínica
apiRouter.use(healthRoutes);
apiRouter.use(clientRoutes);
apiRouter.use(petRoutes);
apiRouter.use(serviceRoutes);
apiRouter.use(appointmentRoutes);
apiRouter.use(auditRoutes);
apiRouter.use(notificationRoutes);
apiRouter.use(googleCalendarRoutes);

export default apiRouter;
