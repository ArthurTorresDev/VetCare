import type { User } from '@vetcare/shared';

export interface CreateUserData {
  name: string;
  email: string;
  passwordHash: string;
  role: User['role'];
  phone?: string;
  isActive?: boolean;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  phone?: string;
  passwordHash?: string;
  isActive?: boolean;
  lastLoginAt?: string;
}

export interface IUserRepository {
  findById(id: string): Promise<User | null> | User | null;
  findByEmail(email: string): Promise<User | null> | User | null;
  create(data: CreateUserData): Promise<User> | User;
  update(id: string, data: UpdateUserData): Promise<User | null> | User | null;
  delete(id: string): Promise<boolean> | boolean;
  findAll(): Promise<User[]> | User[];
  count(): Promise<number> | number;
}
