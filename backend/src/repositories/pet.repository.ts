import { Pet } from '@vetcare/shared';
import { InMemoryStore } from '../models/in-memory.store.js';

export class PetRepository {
  private store: InMemoryStore;

  constructor(store: InMemoryStore = InMemoryStore.getInstance()) {
    this.store = store;
  }

  findAll(): Pet[] {
    return this.store.pets;
  }

  findById(id: string): Pet | undefined {
    return this.store.pets.find((p) => p.id === id);
  }

  findByClientId(clientId: string): Pet[] {
    return this.store.pets.filter((p) => p.clientId === clientId);
  }

  create(petData: Omit<Pet, 'id'>): Pet {
    const newPet: Pet = {
      id: `p_${Date.now()}`,
      clientId: petData.clientId,
      name: petData.name.trim(),
      species: petData.species,
      breed: petData.breed?.trim() || 'SRD (Sem Raça Definida)',
      sex: petData.sex,
      birthDate: petData.birthDate,
      weightKg: petData.weightKg,
      fotoUrl: petData.fotoUrl,
      alergiasMedicamentos: petData.alergiasMedicamentos,
      notes: petData.notes?.trim(),
    };
    this.store.pets.push(newPet);
    return newPet;
  }

  update(id: string, updates: Partial<Omit<Pet, 'id' | 'clientId'>>): Pet | undefined {
    const index = this.store.pets.findIndex((p) => p.id === id);
    if (index === -1) return undefined;

    this.store.pets[index] = {
      ...this.store.pets[index],
      ...updates,
      name: updates.name ? updates.name.trim() : this.store.pets[index].name,
      breed: updates.breed ? updates.breed.trim() : this.store.pets[index].breed,
      fotoUrl: updates.fotoUrl !== undefined ? updates.fotoUrl : this.store.pets[index].fotoUrl,
      alergiasMedicamentos: updates.alergiasMedicamentos !== undefined ? updates.alergiasMedicamentos : this.store.pets[index].alergiasMedicamentos,
      notes: updates.notes !== undefined ? updates.notes?.trim() : this.store.pets[index].notes,
    };
    return this.store.pets[index];
  }

  delete(id: string): boolean {
    const initialLen = this.store.pets.length;
    this.store.pets = this.store.pets.filter((p) => p.id !== id);
    return this.store.pets.length < initialLen;
  }
}
