import { describe, it, expect } from 'vitest';
import { HolidayService } from '../../apps/api/src/domain/services/holiday.service';

describe('Serviço de Feriados e Expediente MedPet (HolidayService)', () => {
  const service = new HolidayService();

  it('deve identificar feriados nacionais fixos no Brasil', async () => {
    // 25 de Dezembro (Natal)
    const natal = await service.checkDate('2026-12-25', '10:00');
    expect(natal.isHoliday).toBe(true);
    expect(natal.holidayName).toContain('Natal');
    expect(natal.hasWarning).toBe(true);

    // 20 de Novembro (Consciência Negra)
    const zumbi = await service.checkDate('2026-11-20', '14:30');
    expect(zumbi.isHoliday).toBe(true);
    expect(zumbi.holidayName).toContain('Consciência Negra');
    expect(zumbi.hasWarning).toBe(true);
  });

  it('deve identificar feriados móveis calculados (ex: Carnaval e Corpus Christi)', async () => {
    const holidays2026 = service.getNationalHolidays(2026);
    const names = holidays2026.map((h) => h.name);

    expect(names).toContain('Carnaval');
    expect(names).toContain('Sexta-feira Santa');
    expect(names).toContain('Corpus Christi');
  });

  it('deve alertar sobre agendamento aos domingos (MedPet fechada)', async () => {
    // 22 de Novembro de 2026 é Domingo
    const domingo = await service.checkDate('2026-11-22', '10:00');
    expect(domingo.isSunday).toBe(true);
    expect(domingo.hasWarning).toBe(true);
    expect(domingo.warnings.some((w) => w.includes('domingos'))).toBe(true);
  });

  it('deve validar horários de Sábado (MedPet aberta apenas das 08:30 às 12:30)', async () => {
    // 21 de Novembro de 2026 é Sábado
    // Horário dentro do expediente (10:00)
    const sabadoOk = await service.checkDate('2026-11-21', '10:00');
    expect(sabadoOk.isSaturdayAfternoon).toBe(false);
    expect(sabadoOk.isOutsideClinicHours).toBe(false);

    // Horário à tarde (14:00) -> deve gerar aviso
    const sabadoTarde = await service.checkDate('2026-11-21', '14:00');
    expect(sabadoTarde.isSaturdayAfternoon).toBe(true);
    expect(sabadoTarde.hasWarning).toBe(true);
    expect(sabadoTarde.warnings.some((w) => w.includes('08:30 às 12:30'))).toBe(true);
  });

  it('deve validar horário regular de Segunda a Sexta (MedPet aberta das 08:00 às 17:30)', async () => {
    // 18 de Novembro de 2026 é Quarta-feira
    // Dentro do horário (14:30)
    const diaUtilOk = await service.checkDate('2026-11-18', '14:30');
    expect(diaUtilOk.hasWarning).toBe(false);

    // Fora do horário (19:00)
    const diaUtilFora = await service.checkDate('2026-11-18', '19:00');
    expect(diaUtilFora.isOutsideClinicHours).toBe(true);
    expect(diaUtilFora.hasWarning).toBe(true);
  });
});

