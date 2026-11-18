import { app } from './app.js';
import { env } from './config/env.js';
import { db } from './database/db.js';

if (!env.isTest) {
  const startServer = async () => {
    await db.connect();
    app.listen(env.port, () => {
      console.log(`\n[MedPet / VetCare API] Servidor rodando em http://localhost:${env.port}`);
      console.log('[Feriados Nacionais] Integração centralizada com a Brasil API e cache persistente pronta.');
    });
  };

  startServer().catch((error: unknown) => {
    console.error('[Server] API não iniciada. Verifique a conexão PostgreSQL configurada em DATABASE_URL.', error);
    process.exitCode = 1;
  });
}

export default app;
