'use client';

import React from 'react';
import {
  AppointmentDetailedView,
  formatDateTimeBR,
  formatCurrencyBRL,
} from '@vetcare/shared';

interface CompletedTabProps {
  appointments: AppointmentDetailedView[];
  onSelectAppointment: (appt: AppointmentDetailedView) => void;
}

export const CompletedTab: React.FC<CompletedTabProps> = ({
  appointments,
  onSelectAppointment,
}) => {
  if (appointments.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 border-dashed p-12 text-center">
        <p className="text-slate-500 text-sm">Nenhuma consulta finalizada encontrada.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {appointments.map((appt) => (
        <div
          key={appt.id}
          onClick={() => onSelectAppointment(appt)}
          className="bg-white rounded-xl border border-slate-200 border-l-4 border-l-emerald-500 p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center gap-1">
              <i className="ph ph-check-circle text-xs"></i>
              Atendimento Concluído
            </span>
            <span className="text-sm font-bold text-slate-700">
              {formatCurrencyBRL(appt.servicePrice)}
            </span>
          </div>
          <h3 className="font-bold text-slate-800 text-lg flex items-center gap-1.5">
            <i className="ph ph-paw-print text-sm text-slate-500"></i>
            {appt.petName}
          </h3>
          <p className="text-xs text-slate-500">Tutor: {appt.clientName}</p>
          <p className="text-xs text-slate-600 mt-2 font-medium">{appt.serviceName}</p>
          <p className="text-[11px] text-slate-400 mt-1">
            Atendido em: {formatDateTimeBR(appt.startTime)} por {appt.veterinarianName}
          </p>
        </div>
      ))}
    </div>
  );
};
