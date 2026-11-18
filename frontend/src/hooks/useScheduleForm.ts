import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import {
  ClinicService,
  filterClientsByPrefix,
  AppointmentDetailedView,
  DateCheckResult,
} from '@vetcare/shared';
import { ClientWithPets } from '../types/index';
import * as appointmentService from '../services/appointment.service';
import { checkDateAvailability, formatToDateISO } from '../services/holiday.service';

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
  const [vetName, setVetName] = useState('Veterinário(a) Clínico');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [previousValidDate, setPreviousValidDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('14:30');
  const [duration, setDuration] = useState(30);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [conflictingAppointment, setConflictingAppointment] = useState<any | null>(null);

  // Estados de Feriados Nacionais (Brasil API) e Horários Especiais da MedPet
  const [dateCheckResult, setDateCheckResult] = useState<DateCheckResult | null>(null);
  const [showHolidayConfirmation, setShowHolidayConfirmation] = useState(false);
  const [checkingDate, setCheckingDate] = useState(false);
  const [holidayConfirmedForDate, setHolidayConfirmedForDate] = useState<string | null>(null);

  const tutorInputRef = useRef<HTMLInputElement>(null);

  const tutorRecommendations = useMemo(
    () => filterClientsByPrefix(clients, tutorSearchInput) as ClientWithPets[],
    [clients, tutorSearchInput],
  );

  // Checagem automática de feriados e horários ao alterar data ou hora
  useEffect(() => {
    if (!isOpen || !date) return;

    let isMounted = true;
    setCheckingDate(true);

    const timer = setTimeout(async () => {
      try {
        const result = await checkDateAvailability(date, time);
        if (isMounted) {
          setDateCheckResult(result);
          // Se for feriado e o usuário ainda não confirmou esta data explicitamente, exibe modal de confirmação
          if (result.isHoliday && holidayConfirmedForDate !== date) {
            setShowHolidayConfirmation(true);
          }
        }
      } catch (err) {
        console.error('[checkDateAvailability Error]', err);
      } finally {
        if (isMounted) setCheckingDate(false);
      }
    }, 250);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [isOpen, date, time, holidayConfirmedForDate]);

  const handleDateChange = useCallback((newDateRaw: string) => {
    const isoDate = formatToDateISO(newDateRaw);
    if (isoDate !== date) {
      setPreviousValidDate(date);
      setDate(isoDate);
      // Reseta confirmação para a nova data
      if (holidayConfirmedForDate !== isoDate) {
        setHolidayConfirmedForDate(null);
      }
    }
  }, [date, holidayConfirmedForDate]);

  const openModal = useCallback(
    (datePreset?: string, timePreset?: string) => {
      setTutorSearchInput('');
      setSelectedClient(null);
      setPetId('');
      setIsTutorDropdownOpen(false);
      setErrorMessage(null);
      setConflictingAppointment(null);
      setShowHolidayConfirmation(false);
      setHolidayConfirmedForDate(null);

      const targetDate = datePreset ? formatToDateISO(datePreset) : new Date().toISOString().split('T')[0];
      setDate(targetDate);
      setPreviousValidDate(targetDate);
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
    setShowHolidayConfirmation(false);
    setHolidayConfirmedForDate(null);
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

  /**
   * Executa a criação efetiva do agendamento
   */
  const executeCreateAppointment = useCallback(async () => {
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
  }, [
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
  ]);

  /**
   * Submissão do formulário com interceptação de aviso de feriado/horário
   */
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

      // Se houver aviso de feriado ou horário especial e ainda não tiver sido confirmado explicitamente:
      if (dateCheckResult?.hasWarning && !showHolidayConfirmation) {
        setShowHolidayConfirmation(true);
        return;
      }

      await executeCreateAppointment();
    },
    [selectedClient, petId, dateCheckResult, showHolidayConfirmation, executeCreateAppointment],
  );

  /**
   * Usuário confirma que deseja agendar mesmo sendo feriado ou horário especial
   */
  const confirmHolidayAndSave = useCallback(async () => {
    setShowHolidayConfirmation(false);
    setHolidayConfirmedForDate(date);
  }, [date]);

  /**
   * Usuário decide cancelar ou trocar a data do agendamento (restaura data anterior)
   */
  const dismissHolidayPrompt = useCallback(() => {
    setShowHolidayConfirmation(false);
    setDate(previousValidDate);
    setHolidayConfirmedForDate(previousValidDate);
  }, [previousValidDate]);

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
    setDate: handleDateChange,
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

    // Suporte a feriados e alertas
    dateCheckResult,
    checkingDate,
    showHolidayConfirmation,
    confirmHolidayAndSave,
    dismissHolidayPrompt,
  };
}
