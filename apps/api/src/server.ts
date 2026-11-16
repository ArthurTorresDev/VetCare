import express from 'express';
import { env } from './config/env.js';
import { corsMiddleware } from './middleware/cors.middleware.js';
import { errorHandler } from './middleware/error.middleware.js';
import apiRouter from './routes/index.js';
import { getGoogleCalendarService } from './domain/services/google-calendar.service.js';

const app = express();

// Middlewares
app.use(corsMiddleware);
app.use(express.json());

// API Routes
app.use('/api', apiRouter);

// Global Error Handler
app.use(errorHandler);

// Inicialização do servidor
if (!env.isTest) {
  const gcalService = getGoogleCalendarService();
  app.listen(env.port, () => {
    console.log(`\n[MedPet / VetCare API] Servidor rodando em http://localhost:${env.port}`);
    console.log(
      `[Integracao Google Agenda] Status: ${gcalService.getStatus().isMock ? 'Simulador (Mock)' : 'API Oficial'}`,
    );
  });
}

export default app;
