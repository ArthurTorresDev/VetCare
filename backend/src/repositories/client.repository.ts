import { Client } from '@vetcare/shared';
import { InMemoryStore } from '../models/in-memory.store.js';

export class ClientRepository {
  private store: InMemoryStore;

  constructor(store: InMemoryStore = InMemoryStore.getInstance()) {
    this.store = store;
  }

  findAll(): Client[] {
    return this.store.clientes;
  }

  findById(id: string): Client | undefined {
    return this.store.clientes.find((c) => c.id === id);
  }

  search(query: string): Client[] {
    const trimmed = query.trim().toLowerCase();
    if (trimmed.length < 2) return [];
    return this.store.clientes.filter(
      (c) =>
        c.name.toLowerCase().includes(trimmed) ||
        c.phone.includes(trimmed) ||
        c.email.toLowerCase().includes(trimmed) ||
        (c.cpf && c.cpf.includes(trimmed)),
    );
  }

  create(clientData: Omit<Client, 'id' | 'createdAt'>): Client {
    const newClient: Client = {
      id: `c_${Date.now()}`,
      name: clientData.name.trim(),
      phone: clientData.phone.trim(),
      email: clientData.email.trim(),
      cpf: clientData.cpf?.trim(),
      createdAt: new Date().toISOString(),
    };
    this.store.clientes.push(newClient);
    return newClient;
  }

  update(id: string, updates: Partial<Omit<Client, 'id' | 'createdAt'>>): Client | undefined {
    const index = this.store.clientes.findIndex((c) => c.id === id);
    if (index === -1) return undefined;

    this.store.clientes[index] = {
      ...this.store.clientes[index],
      ...updates,
      name: updates.name ? updates.name.trim() : this.store.clientes[index].name,
      phone: updates.phone ? updates.phone.trim() : this.store.clientes[index].phone,
      email: updates.email ? updates.email.trim() : this.store.clientes[index].email,
      cpf: updates.cpf !== undefined ? updates.cpf?.trim() : this.store.clientes[index].cpf,
    };
    return this.store.clientes[index];
  }

  delete(id: string): boolean {
    const initialLen = this.store.clientes.length;
    this.store.clientes = this.store.clientes.filter((c) => c.id !== id);
    return this.store.clientes.length < initialLen;
  }
}
