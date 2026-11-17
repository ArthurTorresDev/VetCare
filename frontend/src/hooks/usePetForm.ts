import { useState, useCallback } from 'react';
import { Pet } from '@vetcare/shared';
import { ClientWithPets } from '../types/index';

export function usePetForm(onSuccess: (pet: Pet) => void) {
  const [selectedTutor, setSelectedTutor] = useState<ClientWithPets | null>(null);
  const [name, setName] = useState('');
  const [species, setSpecies] = useState<'Cão' | 'Gato' | 'Ave' | 'Outro'>('Cão');
  const [breed, setBreed] = useState('');
  const [sex, setSex] = useState<'Macho' | 'Fêmea'>('Macho');
  const [birthDate, setBirthDate] = useState('');
  const [weightKg, setWeightKg] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openForTutor = useCallback((tutor: ClientWithPets) => {
    setSelectedTutor(tutor);
    setName('');
    setSpecies('Cão');
    setBreed('');
    setSex('Macho');
    setBirthDate('');
    setWeightKg('');
    setNotes('');
    setError(null);
  }, []);

  const close = useCallback(() => {
    setSelectedTutor(null);
  }, []);

  const submit = useCallback(
    async (
      addPetFn: (
        clientId: string,
        data: {
          name: string;
          species: 'Cão' | 'Gato' | 'Ave' | 'Outro';
          breed?: string;
          sex?: 'Macho' | 'Fêmea';
          birthDate?: string;
          weightKg?: number;
          notes?: string;
        },
      ) => Promise<Pet>,
    ) => {
      if (!selectedTutor) return;
      setSubmitting(true);
      setError(null);
      try {
        const pet = await addPetFn(selectedTutor.id, {
          name,
          species,
          breed,
          sex,
          birthDate: birthDate || undefined,
          weightKg: weightKg ? parseFloat(weightKg) : undefined,
          notes: notes || undefined,
        });
        onSuccess(pet);
        close();
      } catch (err: any) {
        setError(err.message || 'Erro ao cadastrar animal');
      } finally {
        setSubmitting(false);
      }
    },
    [selectedTutor, name, species, breed, sex, birthDate, weightKg, notes, onSuccess, close],
  );

  return {
    selectedTutor,
    openForTutor,
    close,
    name,
    setName,
    species,
    setSpecies,
    breed,
    setBreed,
    sex,
    setSex,
    birthDate,
    setBirthDate,
    weightKg,
    setWeightKg,
    notes,
    setNotes,
    submitting,
    error,
    submit,
  };
}
