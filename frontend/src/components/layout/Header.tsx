'use client';

import React, { useState } from 'react';
import { PeriodFilter } from '@vetcare/shared';
import { TabType, DisplayMode, GoogleStatusResponse } from '../../types/index';
import { getExportXmlUrl } from '../../services/appointment.service';

interface HeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  periodFilter: PeriodFilter;
  onPeriodChange: (period: PeriodFilter) => void;
  displayMode: DisplayMode;
  setDisplayMode: (mode: DisplayMode) => void;
  onOpenNewAppointmentModal: () => void;
  googleStatus: GoogleStatusResponse | null;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  periodFilter,
  onPeriodChange,
  displayMode,
  setDisplayMode,
  onOpenNewAppointmentModal,
  googleStatus,
}) => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b border-slate-200 px-8 py-5 sticky top-0 z-40 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-4 flex-1">
        {/* Campo de Busca Global */}
        <div className="relative w-full max-w-md">
          <i className="ph ph-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg"></i>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por tutor, animal, procedimento ou veterinário..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-sm"
          />
        </div>

        {/* Filtro de Período da Agenda */}
        {activeTab === 'DASHBOARD' && (
          <select
            value={periodFilter}
            onChange={(e) => onPeriodChange(e.target.value as PeriodFilter)}
            className="bg-white border border-slate-200 text-slate-600 text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer font-medium"
          >
            <option value="HOJE">Hoje</option>
            <option value="SEMANA">Esta Semana</option>
            <option value="MES">Este Mês</option>
            <option value="ANO">Este Ano</option>
          </select>
        )}

        {/* Alternância Cards vs Grade */}
        {activeTab === 'DASHBOARD' && (
          <div className="flex bg-slate-100 p-1 rounded-lg gap-1 border border-slate-200">
            <button
              onClick={() => setDisplayMode('CARDS')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
                displayMode === 'CARDS'
                  ? 'bg-white text-emerald-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <i className="ph ph-squares-four text-base"></i> Cards
            </button>
            <button
              onClick={() => setDisplayMode('CALENDAR_WEEK')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
                displayMode === 'CALENDAR_WEEK'
                  ? 'bg-white text-emerald-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <i className="ph ph-calendar text-base"></i> Grade
            </button>
          </div>
        )}

        <button
          onClick={onOpenNewAppointmentModal}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-sm shadow-emerald-500/20 cursor-pointer"
        >
          <i className="ph ph-plus-circle text-lg"></i>
          Novo Agendamento
        </button>
      </div>

      {/* Perfil & Menu Rápido */}
      <div className="relative ml-8">
        <button
          onClick={() => setIsProfileMenuOpen((v) => !v)}
          className="flex items-center gap-3 hover:bg-slate-50 p-1.5 rounded-full pr-4 border border-transparent hover:border-slate-200 transition-all cursor-pointer"
        >
          <img
            src="https://i.pravatar.cc/150?img=33"
            alt="Dr. Carlos"
            className="w-10 h-10 rounded-full object-cover border-2 border-emerald-500 p-0.5"
          />
          <div className="text-left hidden md:block">
            <p className="text-sm font-semibold text-slate-700 leading-tight">Dr. Carlos</p>
            <p className="text-xs text-slate-500">Veterinário Chefe</p>
          </div>
          <i className="ph ph-caret-down text-slate-400"></i>
        </button>

        {isProfileMenuOpen && (
          <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-100 rounded-xl shadow-xl py-2 z-50">
            <div className="px-4 py-2 border-b border-slate-100">
              <p className="text-xs font-bold text-slate-700">Google Calendar Conectado</p>
              <p className="text-[11px] text-slate-500 truncate">
                {googleStatus?.calendarId || 'agenda@medpet.com.br'}
              </p>
            </div>
            <button
              onClick={() => {
                setActiveTab('HISTORICO');
                setIsProfileMenuOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-emerald-600"
            >
              Auditoria de Atividades
            </button>
            <button
              onClick={() => {
                setActiveTab('NOTIFICACOES');
                setIsProfileMenuOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-emerald-600"
            >
              Notificações Disparadas
            </button>
            <button
              onClick={() => {
                window.open(getExportXmlUrl(), '_blank');
                setIsProfileMenuOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-emerald-600"
            >
              Exportar Relatório XML
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
