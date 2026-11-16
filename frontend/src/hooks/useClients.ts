import { useState, useCallback } from 'react';
import { Client } from '@vetcare/shared';
import { ClientWithPets } from '../types/index';
import * as clientService from '../services/client.service';
import * as petService from '../services/pet.service';

export function useClients(initialClients: ClientWithPets[] = []) {
  const [clients, setClients] = useState<ClientWithPets[]>(initialClients);
  const [loading, setLoading] = useState(false);

  const refreshClients = useCallback(async (query?: string) => {
    setLoading(true);
    try {
      const data = await clientService.fetchClients(query);
      setClients(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const addClient = useCallback(
    async (data: { name: string; phone: string; email: string; cpf?: string }) => {
      const newClient = await clientService.createClient(data);
      const withPets: ClientWithPets = { ...newClient, pets: [] };
      setClients((prev) => [withPets, ...prev]);
      return withPets;
    },
    [],
  );

  const editClient = useCallback(
    async (id: string, data: Partial<Omit<Client, 'id' | 'createdAt'>>) => {
      const updated = await clientService.updateClient(id, data);
      setClients((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...updated } : c)),
      );
      return updated;
    },
    [],
  );

  const removeClient = useCallback(async (id: string) => {
    await clientService.deleteClient(id);
    setClients((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const addPet = useCallback(
    async (
      clientId: string,
      petData: {
        name: string;
        species: 'Cão' | 'Gato' | 'Ave' | 'Outro';
        breed?: string;
        sex?: 'Macho' | 'Fêmea';
        birthDate?: string;
        weightKg?: number;
        notes?: string;
      },
    ) => {
      const newPet = await petService.createPetForClient(clientId, petData);
      setClients((prev) =>
        prev.map((c) =>
          c.id === clientId ? { ...c, pets: [...c.pets, newPet] } : c,
        ),
      );
      return newPet;
    },
    [],
  );

  const removePet = useCallback(async (clientId: string, petId: string) => {
    await petService.deletePet(petId);
    setClients((prev) =>
      prev.map((c) =>
        c.id === clientId ? { ...c, pets: c.pets.filter((p) => p.id !== petId) } : c,
      ),
    );
  }, []);

  return {
    clients,
    setClients,
    loading,
    refreshClients,
    addClient,
    editClient,
    removeClient,
    addPet,
    removePet,
  };
}
