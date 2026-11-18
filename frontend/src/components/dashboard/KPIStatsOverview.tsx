'use client';

import React from 'react';
import { AppointmentKPIStats, formatCurrencyBRL } from '@vetcare/shared';

interface KPIStatsOverviewProps {
  stats: AppointmentKPIStats;
}

export const KPIStatsOverview: React.FC<KPIStatsOverviewProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
      {/* 1. Hoje */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm hover:border-slate-300 transition-colors">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Hoje
          </span>
          <span className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center text-lg">
            <i className="ph ph-Calendario-check"></i>
          </span>
        </div>
        <p className="text-2xl font-bold text-slate-800">{stats.totalToday}</p>
        <p className="text-[11px] text-slate-400 mt-1">Consultas agendadas p/ hoje</p>
      </div>

      {/* 2. Em Atendimento */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm hover:border-slate-300 transition-colors">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            No Consultório
          </span>
          <span className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center text-lg">
            <i className="ph ph-stethoscope"></i>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <p className="text-2xl font-bold text-slate-800">{stats.inProgress}</p>
          {stats.inProgress > 0 && (
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span>
          )}
        </div>
        <p className="text-[11px] text-slate-400 mt-1">Em atendimento no momento</p>
      </div>

      {/* 3. Confirmados */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm hover:border-slate-300 transition-colors">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Confirmados
          </span>
          <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg">
            <i className="ph ph-check-circle"></i>
          </span>
        </div>
        <p className="text-2xl font-bold text-slate-800">{stats.confirmed}</p>
        <p className="text-[11px] text-slate-400 mt-1">Presença confirmada</p>
      </div>

      {/* 4. Concluídos */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm hover:border-slate-300 transition-colors">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Finalizados
          </span>
          <span className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-lg">
            <i className="ph ph-seal-check"></i>
          </span>
        </div>
        <p className="text-2xl font-bold text-slate-800">{stats.completed}</p>
        <p className="text-[11px] text-slate-400 mt-1">Atendimentos concluídos</p>
      </div>

      {/* 5. Previsão de Faturamento */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm hover:border-slate-300 transition-colors col-span-2 md:col-span-1">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Previsto Hoje
          </span>
          <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg">
            <i className="ph ph-currency-circle-dollar"></i>
          </span>
        </div>
        <p className="text-lg font-bold text-slate-800">
          {formatCurrencyBRL(stats.revenueProjected)}
        </p>
        <p className="text-[11px] text-emerald-600 font-medium mt-1">
          {stats.occupancyRatePct}% de ocupação estimada
        </p>
      </div>
    </div>
  );
};
