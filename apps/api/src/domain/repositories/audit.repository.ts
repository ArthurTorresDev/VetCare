import { AuditLogEntry } from '@vetcare/shared';
import { InMemoryStore } from '../models/in-memory.store.js';

export class AuditRepository {
  private store: InMemoryStore;

  constructor(store: InMemoryStore = InMemoryStore.getInstance()) {
    this.store = store;
  }

  findAll(): AuditLogEntry[] {
    return this.store.auditLogs;
  }

  log(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): AuditLogEntry {
    const record: AuditLogEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      ...entry,
    };
    this.store.auditLogs.unshift(record);
    return record;
  }
}
