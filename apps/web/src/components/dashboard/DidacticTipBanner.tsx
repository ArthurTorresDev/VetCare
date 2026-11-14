'use client';

import React, { useState } from 'react';

export const DidacticTipBanner: React.FC = () => {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  return (
    <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-sky-50 border border-emerald-200/70 rounded-xl p-4 mb-6 shadow-sm flex items-start justify-between gap-4">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm shadow-emerald-500/30">
          <i className="ph-fill ph-lightbulb text-lg"></i>
        </div>
        <div>
          <h4 className="text-sm font-bold text-slate-800">
            Dica rápida para a Recepção & Atendimento
          </h4>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            • <strong>Agendamento Rápido:</strong> Clique em qualquer horário vazio na visualização{' '}
            <span className="font-semibold text-emerald-700">Grade</span> para abrir o formulário
            com o dia e hora já preenchidos.
            <br />• <strong>Sincronização:</strong> Todos os compromissos criados são espelhados
            automaticamente no <strong>Google Calendar</strong>.
            <br />• <strong>Proteção de Conflito:</strong> O sistema detecta sobreposição de horários
            e avisa antes de salvar para evitar atendimentos duplicados.
          </p>
        </div>
      </div>

      <button
        onClick={() => setIsDismissed(true)}
        className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-white/60 transition-colors text-xs font-semibold cursor-pointer shrink-0"
        title="Dispensar dica"
        aria-label="Dispensar dica"
      >
        ✕ Entendido
      </button>
    </div>
  );
};
