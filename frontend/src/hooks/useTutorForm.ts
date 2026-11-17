import { useState, useCallback } from 'react';
import { ClientWithPets } from '../types/index';

export function useTutorForm(onSuccess: (created: ClientWithPets) => void) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openModal = useCallback(() => {
    setName('');
    setPhone('');
    setEmail('');
    setCpf('');
    setError(null);
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  const submit = useCallback(
    async (
      addClientFn: (data: {
        name: string;
        phone: string;
        email: string;
        cpf?: string;
      }) => Promise<ClientWithPets>,
    ) => {
      setSubmitting(true);
      setError(null);
      try {
        const created = await addClientFn({ name, phone, email, cpf });
        onSuccess(created);
        closeModal();
      } catch (err: any) {
        setError(err.message || 'Erro ao cadastrar tutor');
      } finally {
        setSubmitting(false);
      }
    },
    [name, phone, email, cpf, onSuccess, closeModal],
  );

  return {
    isOpen,
    openModal,
    closeModal,
    name,
    setName,
    phone,
    setPhone,
    email,
    setEmail,
    cpf,
    setCpf,
    submitting,
    error,
    submit,
  };
}
