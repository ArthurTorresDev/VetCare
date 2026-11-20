
'use client';

import React from 'react';
import { CalendarCheck, CalendarX } from '@phosphor-icons/react';
import { TabType } from '../../types/index';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

const NAV_ITEMS: [TabType, string, string][] = [
  ['DASHBOARD', 'ph-squares-four', 'Agenda'],
  ['CLIENTES', 'ph-users', 'Clientes & Pets'],
  ['SERVICOS', 'ph-stethoscope', 'Serviços'],
  ['CONSULTAS_REALIZADAS', 'ph-calendar-check', 'Realizadas'],
  ['CANCELADAS', 'ph-calendar-x', 'Canceladas'],
  ['RELATORIOS', 'ph-chart-line-up', 'Relatórios XML'],
  ['HISTORICO', 'ph-clock-counter-clockwise', 'Auditoria'],
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
}) => {
  return (
    <aside className="sidebar fixed top-0 left-0 h-screen bg-slate-900 text-white shadow-xl flex flex-col justify-between py-6 overflow-hidden z-50">
      <div>
        <div className="px-6 mb-8 flex items-center gap-4 text-emerald-400">
          <i className="ph-fill ph-paw-print text-3xl shrink-0"></i>
          <span className="sidebar-text font-bold text-xl tracking-wide">
            VetCare
          </span>
        </div>

        <nav className="flex flex-col gap-1.5 px-3">
          {NAV_ITEMS.map(([tab, icon, label]) => {
            const isActive = activeTab === tab;

            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`w-full flex items-center gap-4 px-3 py-2.5 rounded-lg transition-colors text-left ${isActive
                    ? 'bg-emerald-500/10 text-emerald-400 font-semibold'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200 font-medium'
                  }`}
              >
                {tab === 'CONSULTAS_REALIZADAS' ? (
                  <CalendarCheck
                    size={24}
                    weight="regular"
                    className="shrink-0"
                  />
                ) : tab === 'CANCELADAS' ? (
                  <CalendarX
                    size={24}
                    weight="regular"
                    className="shrink-0"
                  />
                ) : (
                  <i className={`ph ${icon} text-2xl shrink-0`}></i>
                )}

                <span className="sidebar-text text-sm">{label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="px-4">
        <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full shrink-0 bg-emerald-400"></span>

          <div className="sidebar-text leading-tight">
            <p className="text-xs font-semibold text-slate-200">
              Brasil API
            </p>
            <p className="text-[10px] text-slate-400 truncate max-w-[140px]">
              Feriados Ativos
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};
