import { DatabaseConnection } from '../database/db.js';

export interface HolidayEntity {
  id?: string;
  ano: number;
  data_feriado: string; // YYYY-MM-DD
  nome: string;
  tipo: string;
}

export class HolidayRepository {
  private inMemoryHolidays: Map<number, HolidayEntity[]> = new Map();

  async findByYear(year: number): Promise<HolidayEntity[]> {
    const db = DatabaseConnection.getInstance();
    if (db.isAvailable()) {
      try {
        const result = await db.query<HolidayEntity>(
          `SELECT id, ano, TO_CHAR(data_feriado, 'YYYY-MM-DD') as data_feriado, nome, tipo
           FROM feriado_nacional
           WHERE ano = $1
           ORDER BY data_feriado ASC`,
          [year]
        );
        return result.rows;
      } catch (err) {
        console.warn(`[HolidayRepository] Erro ao buscar feriados no DB para o ano ${year}. Fallback para in-memory:`, err);
      }
    }

    return this.inMemoryHolidays.get(year) || [];
  }

  async saveBatch(year: number, holidays: Omit<HolidayEntity, 'id'>[]): Promise<HolidayEntity[]> {
    const db = DatabaseConnection.getInstance();
    if (db.isAvailable()) {
      try {
        for (const h of holidays) {
          await db.query(
            `INSERT INTO feriado_nacional (ano, data_feriado, nome, tipo)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (ano, data_feriado) 
             DO UPDATE SET nome = EXCLUDED.nome, tipo = EXCLUDED.tipo`,
            [h.ano, h.data_feriado, h.nome, h.tipo || 'national']
          );
        }
        return await this.findByYear(year);
      } catch (err) {
        console.warn(`[HolidayRepository] Erro ao salvar feriados no DB para o ano ${year}:`, err);
      }
    }

    // Salva em memória
    const existing = this.inMemoryHolidays.get(year) || [];
    const merged = [...holidays.map((h, i) => ({ ...h, id: `holiday-${year}-${i}` }))];
    this.inMemoryHolidays.set(year, merged);
    return merged;
  }

  async countByYear(year: number): Promise<number> {
    const holidays = await this.findByYear(year);
    return holidays.length;
  }
}

export const holidayRepository = new HolidayRepository();
