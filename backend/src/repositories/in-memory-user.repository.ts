import crypto from 'node:crypto';
import type { User } from '@vetcare/shared';
import { InMemoryStore } from '../models/in-memory.store.js';
import type {
  IUserRepository,
  CreateUserData,
  UpdateUserData,
} from './user.repository.interface.js';

export class InMemoryUserRepository implements IUserRepository {
  private store: InMemoryStore;

  constructor(store = InMemoryStore.getInstance()) {
    this.store = store;
  }

  public findById(id: string): User | null {
    const user = this.store.users.find((u) => u.id === id);
    return user ? { ...user } : null;
  }

  public findByEmail(email: string): User | null {
    const normalized = email.trim().toLowerCase();
    const user = this.store.users.find((u) => u.email.toLowerCase() === normalized);
    return user ? { ...user } : null;
  }

  public create(data: CreateUserData): User {
    const now = new Date().toISOString();
    const newUser: User = {
      id: `usr_${crypto.randomUUID()}`,
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      passwordHash: data.passwordHash,
      role: data.role || 'CLIENT',
      phone: data.phone,
      isActive: data.isActive !== undefined ? data.isActive : true,
      createdAt: now,
      updatedAt: now,
    };

    this.store.users.push(newUser);
    return { ...newUser };
  }

  public update(id: string, data: UpdateUserData): User | null {
    const index = this.store.users.findIndex((u) => u.id === id);
    if (index === -1) return null;

    const existing = this.store.users[index];
    const updated: User = {
      ...existing,
      name: data.name !== undefined ? data.name.trim() : existing.name,
      email: data.email !== undefined ? data.email.trim().toLowerCase() : existing.email,
      phone: data.phone !== undefined ? data.phone : existing.phone,
      passwordHash: data.passwordHash !== undefined ? data.passwordHash : existing.passwordHash,
      isActive: data.isActive !== undefined ? data.isActive : existing.isActive,
      lastLoginAt: data.lastLoginAt !== undefined ? data.lastLoginAt : existing.lastLoginAt,
      updatedAt: new Date().toISOString(),
    };

    this.store.users[index] = updated;
    return { ...updated };
  }

  public delete(id: string): boolean {
    const index = this.store.users.findIndex((u) => u.id === id);
    if (index === -1) return false;
    this.store.users.splice(index, 1);
    return true;
  }

  public findAll(): User[] {
    return this.store.users.map((u) => ({ ...u }));
  }

  public count(): number {
    return this.store.users.length;
  }
}
