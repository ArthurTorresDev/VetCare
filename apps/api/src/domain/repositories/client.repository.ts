import { Client } from '@vetcare/shared';
import { InMemoryStore } from '../models/in-memory.store.js';

export class ClientRepository {
  private store: InMemoryStore;

  constructor(store: InMemoryStore = InMemoryStore.getInstance()) {
    this.store = store;
  }

  findAll(): Client[] {
    return this.store.clients;
  }

  findById(id: string): Client | undefined {
    return this.store.clients.find((c) => c.id === id);
  }

  search(query: string): Client[] {
    const trimmed = query.trim().toLowerCase();
    if (trimmed.length < 2) return [];
    return this.store.clients.filter(
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
    this.store.clients.push(newClient);
    return newClient;
  }

  update(id: string, updates: Partial<Omit<Client, 'id' | 'createdAt'>>): Client | undefined {
    const index = this.store.clients.findIndex((c) => c.id === id);
    if (index === -1) return undefined;

    this.store.clients[index] = {
      ...this.store.clients[index],
      ...updates,
      name: updates.name ? updates.name.trim() : this.store.clients[index].name,
      phone: updates.phone ? updates.phone.trim() : this.store.clients[index].phone,
      email: updates.email ? updates.email.trim() : this.store.clients[index].email,
      cpf: updates.cpf !== undefined ? updates.cpf?.trim() : this.store.clients[index].cpf,
    };
    return this.store.clients[index];
  }

  delete(id: string): boolean {
    const initialLen = this.store.clients.length;
    this.store.clients = this.store.clients.filter((c) => c.id !== id);
    return this.store.clients.length < initialLen;
  }
}
