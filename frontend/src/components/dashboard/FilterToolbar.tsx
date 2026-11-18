'use client';

import React from 'react';
import { AppointmentStatus, ClinicService } from '@vetcare/shared';

interface FilterToolbarProps {
  statusFilter: AppointmentStatus | 'TODOS';
  onStatusChange: (status: AppointmentStatus | 'TODOS') => void;
  serviceFilter: string;
  onServiceChange: (serviceId: string) => void;
  services: ClinicService[];
  statusCounts: Record<string, number>;
  totalCount: number;
  filteredCount: number;
  onResetFilters: () => void;
}

const STATUS_OPTIONS: { key: AppointmentStatus | 'TODOS'; label: string; icon: string }[] = [
  { key: 'TODOS', label: 'Todos', icon: 'ph-list' },
  { key: 'AGENDADO', label: 'Agendados', icon: 'ph-Calendario' },
  { key: 'CONFIRMADO', label: 'Confirmados', icon: 'ph-check-circle' },
  { key: 'EM_ATENDIMENTO', label: 'No Consultório', icon: 'ph-stethoscope' },
  { key: 'CONCLUIDO', label: 'Concluídos', icon: 'ph-seal-check' },
  { key: 'CANCELADO', label: 'Cancelados', icon: 'ph-x-circle' },
];

export const FilterToolbar: React.FC<FilterToolbarProps> = ({
  statusFilter,
  onStatusChange,
  serviceFilter,
  onServiceChange,
  services = [],
  statusCounts,
  totalCount,
  filteredCount,
  onResetFilters,
}) => {
  const hasActiveFilters = statusFilter !== 'TODOS' || serviceFilter !== 'TODOS';

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-4 mb-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
      {/* Status Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
        {STATUS_OPTIONS.map((opt) => {
          const isSelected = statusFilter === opt.key;
          const count = opt.key === 'TODOS' ? totalCount : statusCounts[opt.key] || 0;

          return (
            <button
              key={opt.key}
              onClick={() => onStatusChange(opt.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${isSelected
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-800 border border-slate-200/60'
                }`}
            >
              <i className={`ph ${opt.icon} text-sm`}></i>
              <span>{opt.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${isSelected ? 'bg-emerald-700 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filtro por Serviço e Limpar */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-500 font-medium whitespace-nowrap">
            Serviço:
          </label>
          <select
            value={serviceFilter}
            onChange={(e) => onServiceChange(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium cursor-pointer"
          >
            <option value="TODOS">Todos os Serviços</option>
            {(services || []).map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            className="text-xs text-rose-600 hover:text-rose-700 font-semibold px-2 py-1 rounded-md hover:bg-rose-50 transition-colors cursor-pointer flex items-center gap-1"
          >
            <i className="ph ph-arrow-counter-clockwise"></i> Limpar filtros ({filteredCount} de{' '}
            {totalCount})
          </button>
        )}
      </div>
    </div>
  );
};
