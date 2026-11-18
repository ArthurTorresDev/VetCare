import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HolidayService } from '../../backend/src/services/holiday.service';
import { holidayRepository } from '../../backend/src/repositories/holiday.repository';

describe('Serviço Centralizado de Feriados Nacionais (Brasil API)', () => {
  let service: HolidayService;

  beforeEach(() => {
    service = new HolidayService();
  });

  it('deve converter corretamente entre os formatos DD-MM-YYYY e YYYY-MM-DD', () => {
    expect(service.toBRFormat('2026-11-20')).toBe('20-11-2026');
    expect(service.toISOFormat('20-11-2026')).toBe('2026-11-20');
    expect(service.toBRFormat('2026-12-25')).toBe('25-12-2026');
    expect(service.toISOFormat('25-12-2026')).toBe('2026-12-25');
  });

  it('deve carregar feriados de um ano e armazenar em cache', async () => {
    const holidays2026 = await service.getHolidaysByYear(2026);
    expect(holidays2026.length).toBeGreaterThan(0);

    const natal = holidays2026.find((h) => h.date === '2026-12-25');
    expect(natal).toBeDefined();
    expect(natal?.name).toContain('Natal');
    expect(natal?.dateBR).toBe('25-12-2026');

    const tiradentes = holidays2026.find((h) => h.date === '2026-04-21');
    expect(tiradentes).toBeDefined();
    expect(tiradentes?.name).toContain('Tiradentes');
    expect(tiradentes?.dateBR).toBe('21-04-2026');
  });

  it('deve identificar feriado tanto com formato ISO (YYYY-MM-DD) quanto BR (DD-MM-YYYY)', async () => {
    const resIso = await service.isHoliday('2026-12-25');
    expect(resIso.isHoliday).toBe(true);
    expect(resIso.holidayName).toContain('Natal');

    const resBR = await service.isHoliday('25-12-2026');
    expect(resBR.isHoliday).toBe(true);
    expect(resBR.holidayName).toContain('Natal');
  });

  it('deve identificar feriados móveis calculados e fixos (ex: Carnaval e Corpus Christi)', async () => {
    const holidays2026 = await service.getHolidaysByYear(2026);
    const names = holidays2026.map((h) => h.name);

    expect(names).toContain('Carnaval');
    expect(names).toContain('Sexta-feira Santa');
    expect(names).toContain('Corpus Christi');
    expect(names).toContain('Dia Nacional de Zumbi e da Consciência Negra');
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
    const sabadoOk = await service.checkDate('2026-11-21', '10:00');
    expect(sabadoOk.isSaturdayAfternoon).toBe(false);
    expect(sabadoOk.isOutsideClinicHours).toBe(false);

    const sabadoTarde = await service.checkDate('2026-11-21', '14:00');
    expect(sabadoTarde.isSaturdayAfternoon).toBe(true);
    expect(sabadoTarde.hasWarning).toBe(true);
    expect(sabadoTarde.warnings.some((w) => w.includes('08:30 às 12:30'))).toBe(true);
  });

  it('deve validar horário regular de Segunda a Sexta (MedPet aberta das 08:00 às 17:30)', async () => {
    // 18 de Novembro de 2026 é Quarta-feira
    const diaUtilOk = await service.checkDate('2026-11-18', '14:30');
    expect(diaUtilOk.hasWarning).toBe(false);

    const diaUtilFora = await service.checkDate('2026-11-18', '19:00');
    expect(diaUtilFora.isOutsideClinicHours).toBe(true);
    expect(diaUtilFora.hasWarning).toBe(true);
  });

  it('não deve fazer chamadas repetidas para o mesmo ano quando já persistido', async () => {
    const firstCall = await service.getHolidaysByYear(2027);
    expect(firstCall.length).toBeGreaterThan(0);

    const countBefore = await holidayRepository.countByYear(2027);
    expect(countBefore).toBeGreaterThan(0);

    // Segunda chamada deve vir direto do repositório/cache
    const secondCall = await service.getHolidaysByYear(2027);
    expect(secondCall.length).toBe(firstCall.length);
  });
});
