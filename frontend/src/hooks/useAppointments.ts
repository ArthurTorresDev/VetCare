import { useState, useMemo, useCallback } from 'react';
import { AppointmentDetailedView, AppointmentStatus } from '@vetcare/shared';
import * as appointmentService from '../services/appointment.service';
import { TabType } from '../types/index';

export function useAppointments(initialAppointments: AppointmentDetailedView[] = []) {
  const [appointments, setAppointments] = useState<AppointmentDetailedView[]>(initialAppointments);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentDetailedView | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const data = await appointmentService.fetchAppointments();
      setAppointments(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar agendamentos');
    } finally {
      setLoading(false);
    }
  }, []);

  const changeStatus = useCallback(
    async (id: string, status: AppointmentStatus) => {
      try {
        const updated = await appointmentService.updateAppointmentStatus(id, status);
        setAppointments((prev) => prev.map((a) => (a.id === id ? updated : a)));
        if (selectedAppointment?.id === id) {
          setSelectedAppointment(updated);
        }
        return updated;
      } catch (err: any) {
        alert(err.message || 'Erro ao atualizar situação');
        throw err;
      }
    },
    [selectedAppointment],
  );

  const cancel = useCallback(
    async (id: string) => {
      if (!confirm('Deseja realmente cancelar este agendamento?')) return;
      try {
        const res = await appointmentService.deleteAppointment(id);
        setAppointments((prev) => prev.map((a) => (a.id === id ? res.appointment : a)));
        if (selectedAppointment?.id === id) {
          setSelectedAppointment(null);
        }
      } catch (err: any) {
        alert(err.message || 'Erro ao cancelar agendamento');
      }
    },
    [selectedAppointment],
  );

  const getFilteredAppointments = useCallback(
    (tab: TabType, searchQuery: string, serviceFilter?: string) => {
      return appointments.filter((appt) => {
        if (tab === 'CONSULTAS_REALIZADAS' && appt.status !== 'CONCLUIDO') return false;
        if (tab === 'CANCELADAS' && appt.status !== 'CANCELADO') return false;
        if (tab === 'DASHBOARD' && appt.status === 'CANCELADO') return false;

        if (serviceFilter && serviceFilter !== 'TODOS' && appt.serviceId !== serviceFilter) {
          return false;
        }

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          return (
            appt.clientName.toLowerCase().includes(q) ||
            appt.petName.toLowerCase().includes(q) ||
            appt.serviceName.toLowerCase().includes(q) ||
            appt.veterinarianName.toLowerCase().includes(q)
          );
        }
        return true;
      });
    },
    [appointments],
  );

  return {
    appointments,
    setAppointments,
    selectedAppointment,
    setSelectedAppointment,
    loading,
    error,
    refreshAppointments,
    changeStatus,
    cancel,
    getFilteredAppointments,
  };
}
