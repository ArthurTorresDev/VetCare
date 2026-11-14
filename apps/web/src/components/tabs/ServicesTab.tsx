'use client';

import React from 'react';
import { ClinicService, formatCurrencyBRL } from '@vetcare/shared';

interface ServicesTabProps {
  services: ClinicService[];
  onOpenNewServiceModal: () => void;
  onToggleActive: (id: string, currentStatus: boolean) => void;
  onDeleteService?: (id: string, name: string) => void;
}

export const ServicesTab: React.FC<ServicesTabProps> = ({
  services,
  onOpenNewServiceModal,
  onToggleActive,
  onDeleteService,
}) => {
  return (
    <div>
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 mb-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <i className="ph ph-stethoscope text-emerald-600 text-lg"></i>
            Catálogo de Serviços da Clínica
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Administre procedimentos, durações padrão, valores, orientações e recursos necessários para o atendimento.
          </p>
        </div>

        <button
          onClick={onOpenNewServiceModal}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm shadow-emerald-500/20 shrink-0"
        >
          <i className="ph ph-plus-circle text-base"></i> + Novo Serviço Clínico
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((s) => (
          <div
            key={s.id}
            className={`bg-white rounded-xl border p-5 shadow-sm flex flex-col justify-between transition-all hover:shadow-md ${
              s.isActive ? 'border-slate-200/90' : 'border-slate-200 opacity-60 bg-slate-50/60'
            }`}
          >
            <div>
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 flex items-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: s.colorHex || '#0284c7' }}
                  ></span>
                  {s.category}
                </span>

                <button
                  onClick={() => onToggleActive(s.id, s.isActive)}
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full border transition-colors cursor-pointer ${
                    s.isActive
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                      : 'bg-slate-100 border-slate-300 text-slate-600 hover:bg-slate-200'
                  }`}
                  title="Clique para alternar situação ativo/inativo"
                >
                  {s.isActive ? '✓ Ativo' : '✕ Inativo'}
                </button>
              </div>

              <h3 className="font-bold text-slate-800 text-base mb-1">{s.name}</h3>
              {s.description && (
                <p className="text-xs text-slate-500 mb-3 leading-relaxed">{s.description}</p>
              )}

              <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Duração Padrão:</span>
                  <span className="font-semibold text-slate-700">{s.durationMinutes} minutos</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Valor Estimado:</span>
                  <span className="font-bold text-slate-800">{formatCurrencyBRL(s.price)}</span>
                </div>
                {s.requiredProfessional && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Profissional Necessário:</span>
                    <span className="font-medium text-slate-700 truncate max-w-[170px]">
                      {s.requiredProfessional}
                    </span>
                  </div>
                )}
                {s.requiredResource && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Recurso / Sala:</span>
                    <span className="font-medium text-slate-700">{s.requiredResource}</span>
                  </div>
                )}
              </div>

              {s.instructions && (
                <div className="mt-3 p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-[11px] text-slate-500 leading-snug">
                  <strong className="text-slate-700 block mb-0.5">Orientações de preparo:</strong>
                  {s.instructions}
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">ID: {s.id}</span>
              <div className="flex items-center gap-2">
                {onDeleteService && (
                  <button
                    onClick={() => onDeleteService(s.id, s.name)}
                    className="text-xs text-rose-500 hover:text-rose-700 font-semibold px-2 py-1 rounded hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    Excluir
                  </button>
                )}
                <button
                  onClick={() => onToggleActive(s.id, s.isActive)}
                  className="text-xs font-semibold text-slate-600 hover:text-emerald-600 transition-colors cursor-pointer"
                >
                  {s.isActive ? 'Pausar serviço' : 'Reativar serviço'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
