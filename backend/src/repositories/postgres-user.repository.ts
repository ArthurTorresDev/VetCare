import type { User } from '@vetcare/shared';
import type {
  IUserRepository,
  CreateUserData,
  UpdateUserData,
} from './user.repository.interface.js';

/**
 * Interface mínima para um Pool ou Client PostgreSQL (ex: 'pg' Pool)
 */
export interface IDbPool {
  query<T = unknown>(sql: string, params?: unknown[]): Promise<{ rows: T[] }>;
}

/**
 * Implementação do repositório de usuários para PostgreSQL.
 * Utiliza SQL estritamente parametrizado com placeholders ($1, $2, ...)
 * garantindo imunidade a ataques de SQL Injection.
 *
 * Esta estrutura está pronta para integração com o banco PostgreSQL
 * assim que o driver for inicializado.
 */
export class PostgresUserRepository implements IUserRepository {
  private pool: IDbPool | null;

  constructor(pool: IDbPool | null = null) {
    this.pool = pool;
  }

  private ensureConnected(): IDbPool {
    if (!this.pool) {
      throw new Error(
        'Pool PostgreSQL não configurado. Defina a conexão com o banco em DATABASE_URL.',
      );
    }
    return this.pool;
  }

  public async findById(id: string): Promise<User | null> {
    const db = this.ensureConnected();
    const query = `
      SELECT id, name, email, password_hash AS "passwordHash",
             role, phone, is_active AS "isActive",
             created_at AS "createdAt", updated_at AS "updatedAt",
             last_login_at AS "lastLoginAt"
      FROM users
      WHERE id = $1
      LIMIT 1;
    `;
    const result = await db.query<User>(query, [id]);
    return result.rows[0] || null;
  }

  public async findByEmail(email: string): Promise<User | null> {
    const db = this.ensureConnected();
    const query = `
      SELECT id, name, email, password_hash AS "passwordHash",
             role, phone, is_active AS "isActive",
             created_at AS "createdAt", updated_at AS "updatedAt",
             last_login_at AS "lastLoginAt"
      FROM users
      WHERE LOWER(email) = LOWER($1)
      LIMIT 1;
    `;
    const result = await db.query<User>(query, [email.trim()]);
    return result.rows[0] || null;
  }

  public async create(data: CreateUserData): Promise<User> {
    const db = this.ensureConnected();
    const query = `
      INSERT INTO users (name, email, password_hash, role, phone, is_active)
      VALUES ($1, LOWER($2), $3, $4, $5, $6)
      RETURNING id, name, email, password_hash AS "passwordHash",
                role, phone, is_active AS "isActive",
                created_at AS "createdAt", updated_at AS "updatedAt",
                last_login_at AS "lastLoginAt";
    `;
    const result = await db.query<User>(query, [
      data.name.trim(),
      data.email.trim(),
      data.passwordHash,
      data.role || 'CLIENT',
      data.phone || null,
      data.isActive !== undefined ? data.isActive : true,
    ]);
    return result.rows[0];
  }

  public async update(id: string, data: UpdateUserData): Promise<User | null> {
    const db = this.ensureConnected();
    const updates: string[] = [];
    const params: unknown[] = [id];
    let paramIndex = 2;

    if (data.name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      params.push(data.name.trim());
    }
    if (data.email !== undefined) {
      updates.push(`email = LOWER($${paramIndex++})`);
      params.push(data.email.trim());
    }
    if (data.phone !== undefined) {
      updates.push(`phone = $${paramIndex++}`);
      params.push(data.phone);
    }
    if (data.passwordHash !== undefined) {
      updates.push(`password_hash = $${paramIndex++}`);
      params.push(data.passwordHash);
    }
    if (data.isActive !== undefined) {
      updates.push(`is_active = $${paramIndex++}`);
      params.push(data.isActive);
    }
    if (data.lastLoginAt !== undefined) {
      updates.push(`last_login_at = $${paramIndex++}`);
      params.push(data.lastLoginAt);
    }

    if (updates.length === 0) {
      return this.findById(id);
    }

    updates.push(`updated_at = NOW()`);

    const query = `
      UPDATE users
      SET ${updates.join(', ')}
      WHERE id = $1
      RETURNING id, name, email, password_hash AS "passwordHash",
                role, phone, is_active AS "isActive",
                created_at AS "createdAt", updated_at AS "updatedAt",
                last_login_at AS "lastLoginAt";
    `;

    const result = await db.query<User>(query, params);
    return result.rows[0] || null;
  }

  public async delete(id: string): Promise<boolean> {
    const db = this.ensureConnected();
    const query = `DELETE FROM users WHERE id = $1 RETURNING id;`;
    const result = await db.query<{ id: string }>(query, [id]);
    return result.rows.length > 0;
  }

  public async findAll(): Promise<User[]> {
    const db = this.ensureConnected();
    const query = `
      SELECT id, name, email, password_hash AS "passwordHash",
             role, phone, is_active AS "isActive",
             created_at AS "createdAt", updated_at AS "updatedAt",
             last_login_at AS "lastLoginAt"
      FROM users
      ORDER BY created_at DESC;
    `;
    const result = await db.query<User>(query);
    return result.rows;
  }

  public async count(): Promise<number> {
    const db = this.ensureConnected();
    const query = `SELECT COUNT(*)::int AS count FROM users;`;
    const result = await db.query<{ count: number }>(query);
    return result.rows[0]?.count || 0;
  }
}
