import { ClinicService } from '@vetcare/shared';
import { InMemoryStore } from '../models/in-memory.store.js';

export class ServiceRepository {
  private store: InMemoryStore;

  constructor(store: InMemoryStore = InMemoryStore.getInstance()) {
    this.store = store;
  }

  findAll(onlyActive = false): ClinicService[] {
    if (onlyActive) {
      return this.store.services.filter((s) => s.isActive);
    }
    return this.store.services;
  }

  findById(id: string): ClinicService | undefined {
    return this.store.services.find((s) => s.id === id);
  }

  create(serviceData: Omit<ClinicService, 'id'>): ClinicService {
    const newService: ClinicService = {
      id: `s_${Date.now()}`,
      name: serviceData.name.trim(),
      category: serviceData.category,
      durationMinutes: serviceData.durationMinutes,
      price: serviceData.price,
      colorHex: serviceData.colorHex || '#0284c7',
      description: serviceData.description?.trim(),
      isActive: serviceData.isActive ?? true,
      requiredProfessional: serviceData.requiredProfessional?.trim(),
      requiredResource: serviceData.requiredResource?.trim(),
      instructions: serviceData.instructions?.trim(),
    };
    this.store.services.push(newService);
    return newService;
  }

  update(id: string, updates: Partial<ClinicService>): ClinicService | undefined {
    const index = this.store.services.findIndex((s) => s.id === id);
    if (index === -1) return undefined;

    this.store.services[index] = {
      ...this.store.services[index],
      ...updates,
    };
    return this.store.services[index];
  }

  delete(id: string): boolean {
    const initialLen = this.store.services.length;
    this.store.services = this.store.services.filter((s) => s.id !== id);
    return this.store.services.length < initialLen;
  }
}
