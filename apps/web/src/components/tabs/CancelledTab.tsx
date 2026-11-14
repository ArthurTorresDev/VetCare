'use client';

import React from 'react';
import { AppointmentDetailedView, formatDateBR } from '@vetcare/shared';

interface CancelledTabProps {
  appointments: AppointmentDetailedView[];
  onSelectAppointment: (appt: AppointmentDetailedView) => void;
}

export const CancelledTab: React.FC<CancelledTabProps> = ({
  appointments,
  onSelectAppointment,
}) => {
  if (appointments.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 border-dashed p-12 text-center">
        <p className="text-slate-500 text-sm">Nenhum agendamento cancelado registrado.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {appointments.map((appt) => (
        <div
          key={appt.id}
          onClick={() => onSelectAppointment(appt)}
          className="bg-white rounded-xl border border-slate-200 border-l-4 border-l-rose-500 p-5 shadow-sm opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
        >
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full">
              ✕ Cancelado
            </span>
            <span className="text-xs text-slate-400">
              Data: {formatDateBR(appt.startTime)}
            </span>
          </div>
          <h3 className="font-bold text-slate-800 text-base">🐾 {appt.petName}</h3>
          <p className="text-xs text-slate-500">Tutor: {appt.clientName}</p>
          <p className="text-xs text-slate-600 mt-2">{appt.serviceName}</p>
        </div>
      ))}
    </div>
  );
};
