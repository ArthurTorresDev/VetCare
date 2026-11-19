import crypto from 'node:crypto';
import { Veterinario } from '@vetcare/shared';
import { InMemoryStore } from '../models/in-memory.store.js';
import { db } from '../database/db.js';

export class VeterinarioRepository {
  private store: InMemoryStore;

  constructor(store = InMemoryStore.getInstance()) {
    this.store = store;
  }

  async findAll(): Promise<Veterinario[]> {
    if (db.isAvailable()) {
      const res = await db.query<any>(
        'SELECT id, nome, crmv, telefone, email, criado_em AS "criadoEm" FROM veterinario ORDER BY nome ASC',
      );
      return res.rows;
    }
    return [...this.store.veterinarios];
  }

  async findById(id: string): Promise<Veterinario | null> {
    if (db.isAvailable()) {
      const res = await db.query<any>(
        'SELECT id, nome, crmv, telefone, email, criado_em AS "criadoEm" FROM veterinario WHERE id = $1 LIMIT 1',
        [id],
      );
      return res.rows[0] || null;
    }
    return this.store.veterinarios.find((v) => v.id === id) || null;
  }

  async findByCrmv(crmv: string): Promise<Veterinario | null> {
    const norm = crmv.trim().toUpperCase();
    if (db.isAvailable()) {
      const res = await db.query<any>(
        'SELECT id, nome, crmv, telefone, email, criado_em AS "criadoEm" FROM veterinario WHERE UPPER(crmv) = $1 LIMIT 1',
        [norm],
      );
      return res.rows[0] || null;
    }
    return this.store.veterinarios.find((v) => v.crmv.toUpperCase() === norm) || null;
  }

  async create(data: Omit<Veterinario, 'id' | 'criadoEm'>): Promise<Veterinario> {
    const now = new Date().toISOString();
    const id = crypto.randomUUID();

    if (db.isAvailable()) {
      const res = await db.query<any>(
        `INSERT INTO veterinario (id, nome, crmv, telefone, email, criado_em)
         VALUES ($1, $2, $3, $4, $5, NOW())
         RETURNING id, nome, crmv, telefone, email, criado_em AS "criadoEm"`,
        [id, data.nome.trim(), data.crmv.trim().toUpperCase(), data.telefone || null, data.email.trim().toLowerCase()],
      );
      return res.rows[0];
    }

    const created: Veterinario = {
      id,
      nome: data.nome.trim(),
      crmv: data.crmv.trim().toUpperCase(),
      telefone: data.telefone,
      email: data.email.trim().toLowerCase(),
      criadoEm: now,
    };
    this.store.veterinarios.push(created);
    return created;
  }

  async update(id: string, data: Partial<Omit<Veterinario, 'id' | 'criadoEm'>>): Promise<Veterinario | null> {
    if (db.isAvailable()) {
      const current = await this.findById(id);
      if (!current) return null;

      const res = await db.query<any>(
        `UPDATE veterinario
         SET nome = COALESCE($2, nome),
             crmv = COALESCE($3, crmv),
             telefone = COALESCE($4, telefone),
             email = COALESCE($5, email)
         WHERE id = $1
         RETURNING id, nome, crmv, telefone, email, criado_em AS "criadoEm"`,
        [
          id,
          data.nome ? data.nome.trim() : null,
          data.crmv ? data.crmv.trim().toUpperCase() : null,
          data.telefone ?? null,
          data.email ? data.email.trim().toLowerCase() : null,
        ],
      );
      return res.rows[0] || null;
    }

    const index = this.store.veterinarios.findIndex((v) => v.id === id);
    if (index === -1) return null;

    const current = this.store.veterinarios[index];
    const updated: Veterinario = {
      ...current,
      nome: data.nome ? data.nome.trim() : current.nome,
      crmv: data.crmv ? data.crmv.trim().toUpperCase() : current.crmv,
      telefone: data.telefone !== undefined ? data.telefone : current.telefone,
      email: data.email ? data.email.trim().toLowerCase() : current.email,
    };
    this.store.veterinarios[index] = updated;
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    if (db.isAvailable()) {
      const res = await db.query('DELETE FROM veterinario WHERE id = $1 RETURNING id', [id]);
      return (res.rowCount ?? 0) > 0;
    }

    const idx = this.store.veterinarios.findIndex((v) => v.id === id);
    if (idx === -1) return false;
    this.store.veterinarios.splice(idx, 1);
    return true;
  }
}
