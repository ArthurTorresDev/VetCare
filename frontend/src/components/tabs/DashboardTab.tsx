'use client';

import React, { useState, useMemo } from 'react';
import {
  AppointmentDetailedView,
  PeriodFilter,
  AppointmentStatus,
  ClinicService,
  calculateAppointmentStats,
} from '@vetcare/shared';
import { DisplayMode } from '../../types/index';
import { AppointmentCard } from '../dashboard/AppointmentCard';
import { CalendarGrid } from '../dashboard/CalendarGrid';
import { KPIStatsOverview } from '../dashboard/KPIStatsOverview';
import { DidacticTipBanner } from '../dashboard/DidacticTipBanner';
import { FilterToolbar } from '../dashboard/FilterToolbar';

interface DashboardTabProps {
  loading: boolean;
  displayMode: DisplayMode;
  appointments: AppointmentDetailedView[];
  services: ClinicService[];
  gridDays: Date[];
  periodFilter: PeriodFilter;
  appointmentsByDateHour: Map<string, AppointmentDetailedView[]>;
  onSelectAppointment: (appt: AppointmentDetailedView) => void;
  onSelectSlot: (dateIso: string, hourString: string) => void;
  onOpenNewAppointmentModal: () => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  loading,
  displayMode,
  appointments,
  services,
  gridDays,
  periodFilter,
  appointmentsByDateHour,
  onSelectAppointment,
  onSelectSlot,
  onOpenNewAppointmentModal,
}) => {
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | 'TODOS'>('TODOS');
  const [serviceFilter, setServiceFilter] = useState<string>('TODOS');

  // Métricas do Topo
  const stats = useMemo(() => calculateAppointmentStats(appointments), [appointments]);

  // Contadores por status para as abas/chips
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const a of appointments) {
      counts[a.status] = (counts[a.status] || 0) + 1;
    }
    return counts;
  }, [appointments]);

  // Agendamentos filtrados pelos chips de status e serviço
  const filteredAppointments = useMemo(() => {
    return appointments.filter((a) => {
      if (statusFilter !== 'TODOS' && a.status !== statusFilter) return false;
      if (serviceFilter !== 'TODOS' && a.serviceId !== serviceFilter) return false;
      return true;
    });
  }, [appointments, statusFilter, serviceFilter]);

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-400 font-medium flex flex-col items-center justify-center gap-3">
        <i className="ph ph-spinner animate-spin text-3xl text-emerald-500"></i>
        <span className="text-sm">Carregando compromissos e agenda da clínica...</span>
      </div>
    );
  }

  return (
    <div>
      {/* 1. Indicadores Chave de Desempenho (KPIs didáticos) */}
      <KPIStatsOverview stats={stats} />

      {/* 2. Banner Didático de Boas Práticas */}
      <DidacticTipBanner />

      {/* 3. Barra de Filtros Inteligente */}
      <FilterToolbar
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        serviceFilter={serviceFilter}
        onServiceChange={setServiceFilter}
        services={services}
        statusCounts={statusCounts}
        totalCount={appointments.length}
        filteredCount={filteredAppointments.length}
        onResetFilters={() => {
          setStatusFilter('TODOS');
          setServiceFilter('TODOS');
        }}
      />

      {/* 4. Visualização: Grade vs Cards */}
      {displayMode === 'CALENDAR_WEEK' ? (
        <CalendarGrid
          gridDays={gridDays}
          periodFilter={periodFilter}
          appointmentsByDateHour={appointmentsByDateHour}
          onSelectAppointment={onSelectAppointment}
          onSelectSlot={onSelectSlot}
        />
      ) : filteredAppointments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 border-dashed p-12 text-center shadow-sm">
          <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <i className="ph ph-calendar-blank text-3xl"></i>
          </div>
          <h3 className="font-bold text-slate-700 text-base">Nenhum compromisso encontrado</h3>
          <p className="text-slate-400 text-xs mt-1 max-w-sm mx-auto">
            {statusFilter !== 'TODOS' || serviceFilter !== 'TODOS'
              ? 'Nenhum agendamento corresponde aos filtros selecionados. Tente limpar os filtros.'
              : 'Não há consultas cadastradas para este período. Clique abaixo para registrar o primeiro.'}
          </p>
          <div className="flex justify-center gap-2 mt-4">
            {(statusFilter !== 'TODOS' || serviceFilter !== 'TODOS') && (
              <button
                onClick={() => {
                  setStatusFilter('TODOS');
                  setServiceFilter('TODOS');
                }}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer"
              >
                Limpar Filtros
              </button>
            )}
            <button
              onClick={onOpenNewAppointmentModal}
              className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold px-4 py-2 rounded-lg inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm shadow-emerald-500/20"
            >
              <i className="ph ph-plus-circle text-base"></i> + Novo Agendamento
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAppointments.map((appt) => (
            <AppointmentCard
              key={appt.id}
              appointment={appt}
              onClick={onSelectAppointment}
            />
          ))}
        </div>
      )}
    </div>
  );
};
