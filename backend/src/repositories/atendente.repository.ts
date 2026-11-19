import crypto from 'node:crypto';
import { Atendente } from '@vetcare/shared';
import { InMemoryStore } from '../models/in-memory.store.js';
import { db } from '../database/db.js';

export class AtendenteRepository {
  private store: InMemoryStore;

  constructor(store = InMemoryStore.getInstance()) {
    this.store = store;
  }

  async findAll(): Promise<Atendente[]> {
    if (db.isAvailable()) {
      const res = await db.query<any>(
        'SELECT id, nome, email, telefone, criado_em AS "criadoEm" FROM atendente ORDER BY nome ASC',
      );
      return res.rows;
    }
    return [...this.store.atendentes];
  }

  async findById(id: string): Promise<Atendente | null> {
    if (db.isAvailable()) {
      const res = await db.query<any>(
        'SELECT id, nome, email, telefone, criado_em AS "criadoEm" FROM atendente WHERE id = $1 LIMIT 1',
        [id],
      );
      return res.rows[0] || null;
    }
    return this.store.atendentes.find((a) => a.id === id) || null;
  }

  async findByEmail(email: string): Promise<Atendente | null> {
    const norm = email.trim().toLowerCase();
    if (db.isAvailable()) {
      const res = await db.query<any>(
        'SELECT id, nome, email, telefone, criado_em AS "criadoEm" FROM atendente WHERE LOWER(email) = $1 LIMIT 1',
        [norm],
      );
      return res.rows[0] || null;
    }
    return this.store.atendentes.find((a) => a.email.toLowerCase() === norm) || null;
  }

  async create(data: Omit<Atendente, 'id' | 'criadoEm'>): Promise<Atendente> {
    const now = new Date().toISOString();
    const id = crypto.randomUUID();

    if (db.isAvailable()) {
      const res = await db.query<any>(
        `INSERT INTO atendente (id, nome, email, telefone, criado_em)
         VALUES ($1, $2, $3, $4, NOW())
         RETURNING id, nome, email, telefone, criado_em AS "criadoEm"`,
        [id, data.nome.trim(), data.email.trim().toLowerCase(), data.telefone || null],
      );
      return res.rows[0];
    }

    const created: Atendente = {
      id,
      nome: data.nome.trim(),
      email: data.email.trim().toLowerCase(),
      telefone: data.telefone,
      criadoEm: now,
    };
    this.store.atendentes.push(created);
    return created;
  }

  async update(id: string, data: Partial<Omit<Atendente, 'id' | 'criadoEm'>>): Promise<Atendente | null> {
    if (db.isAvailable()) {
      const res = await db.query<any>(
        `UPDATE atendente
         SET nome = COALESCE($2, nome),
             email = COALESCE($3, email),
             telefone = COALESCE($4, telefone)
         WHERE id = $1
         RETURNING id, nome, email, telefone, criado_em AS "criadoEm"`,
        [
          id,
          data.nome ? data.nome.trim() : null,
          data.email ? data.email.trim().toLowerCase() : null,
          data.telefone ?? null,
        ],
      );
      return res.rows[0] || null;
    }

    const index = this.store.atendentes.findIndex((a) => a.id === id);
    if (index === -1) return null;

    const current = this.store.atendentes[index];
    const updated: Atendente = {
      ...current,
      nome: data.nome ? data.nome.trim() : current.nome,
      email: data.email ? data.email.trim().toLowerCase() : current.email,
      telefone: data.telefone !== undefined ? data.telefone : current.telefone,
    };
    this.store.atendentes[index] = updated;
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    if (db.isAvailable()) {
      const res = await db.query('DELETE FROM atendente WHERE id = $1 RETURNING id', [id]);
      return (res.rowCount ?? 0) > 0;
    }

    const idx = this.store.atendentes.findIndex((a) => a.id === id);
    if (idx === -1) return false;
    this.store.atendentes.splice(idx, 1);
    return true;
  }
}
