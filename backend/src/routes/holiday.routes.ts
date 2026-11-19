import { Router } from 'express';
import { HolidayController } from '../controllers/holiday.controller.js';

const router = Router();
const controller = new HolidayController();

router.get('/holidays/check-date', controller.checkDate);
router.get('/holidays', controller.getHolidays);

// Aliases retrocompatíveis para o frontend/rotas anteriores caso necessário
router.get('/google-Calendario/check-date', controller.checkDate);
router.get('/google-Calendario/holidays', controller.getHolidays);
router.get('/google-Calendario/status', (_req, res) => {
  res.json({
    isMock: false,
    CalendarioId: 'sistema-local-brasilapi',
    description: 'Integração Google removida. Gestão centralizada de feriados nacionais via Brasil API ativa.',
  });
});

export default router;
