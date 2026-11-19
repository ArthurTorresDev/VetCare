import crypto from 'node:crypto';
import { Atendimento } from '@vetcare/shared';
import { InMemoryStore } from '../models/in-memory.store.js';
import { db } from '../database/db.js';

export class AtendimentoRepository {
  private store: InMemoryStore;

  constructor(store = InMemoryStore.getInstance()) {
    this.store = store;
  }

  async findAll(): Promise<Atendimento[]> {
    if (db.isAvailable()) {
      const res = await db.query<any>(
        `SELECT id, pet_id AS "petId", veterinario_id AS "veterinarioId", atendente_id AS "atendenteId",
                tipo_servico AS "tipoServico", data_hora AS "dataHora", status, observacoes,
                criado_em AS "criadoEm"
         FROM atendimento
         ORDER BY data_hora DESC`,
      );
      return res.rows;
    }
    return [...this.store.atendimentos];
  }

  async findById(id: string): Promise<Atendimento | null> {
    if (db.isAvailable()) {
      const res = await db.query<any>(
        `SELECT id, pet_id AS "petId", veterinario_id AS "veterinarioId", atendente_id AS "atendenteId",
                tipo_servico AS "tipoServico", data_hora AS "dataHora", status, observacoes,
                criado_em AS "criadoEm"
         FROM atendimento
         WHERE id = $1
         LIMIT 1`,
        [id],
      );
      return res.rows[0] || null;
    }
    return this.store.atendimentos.find((a) => a.id === id) || null;
  }

  async findByPetId(petId: string): Promise<Atendimento[]> {
    if (db.isAvailable()) {
      const res = await db.query<any>(
        `SELECT id, pet_id AS "petId", veterinario_id AS "veterinarioId", atendente_id AS "atendenteId",
                tipo_servico AS "tipoServico", data_hora AS "dataHora", status, observacoes,
                criado_em AS "criadoEm"
         FROM atendimento
         WHERE pet_id = $1
         ORDER BY data_hora DESC`,
        [petId],
      );
      return res.rows;
    }
    return this.store.atendimentos.filter((a) => a.petId === petId);
  }

  async create(data: Omit<Atendimento, 'id' | 'criadoEm'>): Promise<Atendimento> {
    const now = new Date().toISOString();
    const id = crypto.randomUUID();

    if (db.isAvailable()) {
      const res = await db.query<any>(
        `INSERT INTO atendimento (id, pet_id, veterinario_id, atendente_id, tipo_servico, data_hora, status, observacoes, criado_em)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
         RETURNING id, pet_id AS "petId", veterinario_id AS "veterinarioId", atendente_id AS "atendenteId",
                   tipo_servico AS "tipoServico", data_hora AS "dataHora", status, observacoes,
                   criado_em AS "criadoEm"`,
        [
          id,
          data.petId,
          data.veterinarioId,
          data.atendenteId,
          data.tipoServico.trim(),
          data.dataHora,
          data.status || 'Agendado',
          data.observacoes || null,
        ],
      );
      return res.rows[0];
    }

    const created: Atendimento = {
      id,
      petId: data.petId,
      veterinarioId: data.veterinarioId,
      atendenteId: data.atendenteId,
      tipoServico: data.tipoServico.trim(),
      dataHora: data.dataHora,
      status: data.status || 'Agendado',
      observacoes: data.observacoes,
      criadoEm: now,
    };
    this.store.atendimentos.push(created);
    return created;
  }

  async update(id: string, data: Partial<Omit<Atendimento, 'id' | 'criadoEm'>>): Promise<Atendimento | null> {
    if (db.isAvailable()) {
      const res = await db.query<any>(
        `UPDATE atendimento
         SET pet_id = COALESCE($2, pet_id),
             veterinario_id = COALESCE($3, veterinario_id),
             atendente_id = COALESCE($4, atendente_id),
             tipo_servico = COALESCE($5, tipo_servico),
             data_hora = COALESCE($6, data_hora),
             status = COALESCE($7, status),
             observacoes = COALESCE($8, observacoes)
         WHERE id = $1
         RETURNING id, pet_id AS "petId", veterinario_id AS "veterinarioId", atendente_id AS "atendenteId",
                   tipo_servico AS "tipoServico", data_hora AS "dataHora", status, observacoes,
                   criado_em AS "criadoEm"`,
        [
          id,
          data.petId ?? null,
          data.veterinarioId ?? null,
          data.atendenteId ?? null,
          data.tipoServico ?? null,
          data.dataHora ?? null,
          data.status ?? null,
          data.observacoes ?? null,
        ],
      );
      return res.rows[0] || null;
    }

    const index = this.store.atendimentos.findIndex((a) => a.id === id);
    if (index === -1) return null;

    const current = this.store.atendimentos[index];
    const updated: Atendimento = {
      ...current,
      petId: data.petId || current.petId,
      veterinarioId: data.veterinarioId || current.veterinarioId,
      atendenteId: data.atendenteId || current.atendenteId,
      tipoServico: data.tipoServico || current.tipoServico,
      dataHora: data.dataHora || current.dataHora,
      status: data.status || current.status,
      observacoes: data.observacoes !== undefined ? data.observacoes : current.observacoes,
    };
    this.store.atendimentos[index] = updated;
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    if (db.isAvailable()) {
      const res = await db.query('DELETE FROM atendimento WHERE id = $1 RETURNING id', [id]);
      return (res.rowCount ?? 0) > 0;
    }

    const idx = this.store.atendimentos.findIndex((a) => a.id === id);
    if (idx === -1) return false;
    this.store.atendimentos.splice(idx, 1);
    return true;
  }
}
