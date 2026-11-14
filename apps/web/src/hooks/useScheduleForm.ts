import { useState, useMemo, useCallback, useRef } from 'react';
import {
  ClinicService,
  filterClientsByPrefix,
  AppointmentDetailedView,
} from '@vetcare/shared';
import { ClientWithPets } from '../types/index';
import * as appointmentService from '../services/appointment.service';

export function useScheduleForm(
  clients: ClientWithPets[],
  services: ClinicService[],
  onSuccess: (created: AppointmentDetailedView) => void,
) {
  const [isOpen, setIsOpen] = useState(false);
  const [tutorSearchInput, setTutorSearchInput] = useState('');
  const [isTutorDropdownOpen, setIsTutorDropdownOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ClientWithPets | null>(null);
  const [petId, setPetId] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [vetName, setVetName] = useState('Dr. Carlos - Veterinário Chefe');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('14:30');
  const [duration, setDuration] = useState(30);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [conflictingAppointment, setConflictingAppointment] = useState<any | null>(null);

  const tutorInputRef = useRef<HTMLInputElement>(null);

  const tutorRecommendations = useMemo(
    () => filterClientsByPrefix(clients, tutorSearchInput) as ClientWithPets[],
    [clients, tutorSearchInput],
  );

  const openModal = useCallback(
    (datePreset?: string, timePreset?: string) => {
      setTutorSearchInput('');
      setSelectedClient(null);
      setPetId('');
      setIsTutorDropdownOpen(false);
      setErrorMessage(null);
      setConflictingAppointment(null);

      if (datePreset) setDate(datePreset);
      if (timePreset) setTime(timePreset);

      if (services.length > 0) {
        setServiceId(services[0].id);
        setDuration(services[0].durationMinutes);
      }

      setIsOpen(true);
    },
    [services],
  );

  const closeModal = useCallback(() => {
    setIsOpen(false);
    setErrorMessage(null);
    setConflictingAppointment(null);
  }, []);

  const selectTutor = useCallback((client: ClientWithPets) => {
    setSelectedClient(client);
    setTutorSearchInput(client.name);
    setIsTutorDropdownOpen(false);
    setPetId(client.pets?.[0]?.id ?? '');
  }, []);

  const clearTutor = useCallback(() => {
    setSelectedClient(null);
    setTutorSearchInput('');
    setPetId('');
    setIsTutorDropdownOpen(false);
    tutorInputRef.current?.focus();
  }, []);

  const handleServiceChange = useCallback(
    (newServiceId: string) => {
      setServiceId(newServiceId);
      const srv = services.find((s) => s.id === newServiceId);
      if (srv) {
        setDuration(srv.durationMinutes);
      }
    },
    [services],
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setErrorMessage(null);
      setConflictingAppointment(null);

      if (!selectedClient) {
        setErrorMessage('Por favor, selecione um tutor na lista de sugestões.');
        return;
      }
      if (!petId) {
        setErrorMessage('Por favor, selecione um paciente (pet) deste tutor.');
        return;
      }

      setSubmitting(true);
      try {
        const startIso = new Date(`${date}T${time}:00`).toISOString();
        const created = await appointmentService.createAppointment({
          clientId: selectedClient.id,
          petId,
          serviceId,
          veterinarianName: vetName,
          startTime: startIso,
          durationMinutes: Number(duration),
          notes,
          createdByUser: 'Recepção (MedPet)',
        });

        onSuccess(created);
        closeModal();
      } catch (err: any) {
        setErrorMessage(err.message || 'Falha ao registrar agendamento');
        if (err.conflictingAppointment) {
          setConflictingAppointment(err.conflictingAppointment);
        }
      } finally {
        setSubmitting(false);
      }
    },
    [
      selectedClient,
      petId,
      serviceId,
      vetName,
      date,
      time,
      duration,
      notes,
      onSuccess,
      closeModal,
    ],
  );

  return {
    isOpen,
    openModal,
    closeModal,
    tutorSearchInput,
    setTutorSearchInput,
    isTutorDropdownOpen,
    setIsTutorDropdownOpen,
    selectedClient,
    tutorRecommendations,
    selectTutor,
    clearTutor,
    petId,
    setPetId,
    serviceId,
    handleServiceChange,
    vetName,
    setVetName,
    date,
    setDate,
    time,
    setTime,
    duration,
    setDuration,
    notes,
    setNotes,
    submitting,
    errorMessage,
    conflictingAppointment,
    handleSubmit,
    tutorInputRef,
  };
}
