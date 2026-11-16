import { app } from './app.js';
import { env } from './config/env.js';
import { getGoogleCalendarService } from './services/google-calendar.service.js';

// Inicialização do servidor HTTP
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
