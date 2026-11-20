import { Router } from 'express';
import healthRoutes from './health.routes.js';
import clientRoutes from './client.routes.js';
import petRoutes from './pet.routes.js';
import serviceRoutes from './service.routes.js';
import appointmentRoutes from './appointment.routes.js';
import auditRoutes from './audit.routes.js';
import holidayRoutes from './holiday.routes.js';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import docsRoutes from './docs.routes.js';
import veterinarioRoutes from './veterinario.routes.js';
import atendenteRoutes from './atendente.routes.js';
import atendimentoRoutes from './atendimento.routes.js';

const apiRouter = Router();

// Documentação da API (OpenAPI / Swagger UI)
apiRouter.use(docsRoutes);

// Rotas de Autenticação e Usuários
apiRouter.use(authRoutes);
apiRouter.use(userRoutes);

// Rotas de Domínio da Clínica e vetcare.sql
apiRouter.use(healthRoutes);
apiRouter.use(clientRoutes);
apiRouter.use(petRoutes);
apiRouter.use(veterinarioRoutes);
apiRouter.use(atendenteRoutes);
apiRouter.use(atendimentoRoutes);
apiRouter.use(serviceRoutes);
apiRouter.use(appointmentRoutes);
apiRouter.use(auditRoutes);
apiRouter.use(holidayRoutes);

export default apiRouter;
