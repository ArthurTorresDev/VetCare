import { describe, expect, it, vi } from 'vitest';
import type { User } from '@vetcare/shared';
import type { IDbPool } from '../../backend/src/database/db.js';
import { PostgresUserRepository } from '../../backend/src/repositories/postgres-user.repository.js';

describe('PostgresUserRepository', () => {
  it('creates the user and attendant in one PostgreSQL statement', async () => {
    const user: User = {
      id: '2c1e6ac2-dfd7-4e8d-a6aa-b5fedf584f8a',
      name: 'Maria Souza',
      email: 'maria@example.com',
      passwordHash: 'scrypt-hash',
      role: 'RECEPTIONIST',
      phone: '11999999999',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const query = vi.fn().mockResolvedValue({ rows: [user] });
    const repository = new PostgresUserRepository({ query } as unknown as IDbPool);

    const created = await repository.create({
      name: user.name,
      email: user.email,
      passwordHash: user.passwordHash,
      role: user.role,
      phone: user.phone,
      isActive: true,
    });

    expect(created).toEqual(user);
    expect(query).toHaveBeenCalledOnce();
    expect(query.mock.calls[0][0]).toContain('INSERT INTO users');
    expect(query.mock.calls[0][0]).toContain('INSERT INTO atendente');
  });
});
