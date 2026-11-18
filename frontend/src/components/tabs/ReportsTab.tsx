'use client';

import React from 'react';
import { getExportXmlUrl } from '../../services/appointment.service';

export const ReportsTab: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-8 max-w-2xl shadow-sm">
      <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mb-4">
        <i className="ph ph-file-xml text-2xl"></i>
      </div>
      <h2 className="text-xl font-bold text-slate-800">Exportação em XML Estruturado</h2>
      <p className="text-slate-500 text-sm mt-1 mb-6">
        Faça o download do arquivo XML contendo todos os registros de agendamentos, dados de
        tutores, histórico de pacientes conforme os padrões
        da clínica MedPet.
      </p>
      <button
        onClick={() => window.open(getExportXmlUrl(), '_blank')}
        className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm px-6 py-3 rounded-xl flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
      >
        <i className="ph ph-download-simple text-lg"></i>
        Baixar Relatório XML Completo
      </button>
    </div>
  );
};
