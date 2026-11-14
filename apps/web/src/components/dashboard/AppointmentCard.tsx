'use client';

import React from 'react';
import {
  AppointmentDetailedView,
  formatDateBR,
  formatTimeBR,
  formatCurrencyBRL,
  getPetIcon,
  getServiceStyleClass,
} from '@vetcare/shared';

interface AppointmentCardProps {
  appointment: AppointmentDetailedView;
  onClick: (appt: AppointmentDetailedView) => void;
}

export const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  onClick,
}) => {
  const style = getServiceStyleClass(appointment.serviceCategory);
  const petIcon = getPetIcon(appointment.petSpecies);

  const categoryLabel =
    appointment.serviceCategory === 'CIRURGIA'
      ? 'Cirurgia'
      : appointment.serviceCategory === 'VACINA'
      ? 'Vacinação'
      : appointment.serviceCategory === 'CHECKUP'
      ? 'Checkup'
      : appointment.serviceCategory === 'RETORNO'
      ? 'Retorno'
      : appointment.serviceCategory === 'EMERGENCIA'
      ? 'Emergência'
      : 'Consulta';

  return (
    <div
      onClick={() => onClick(appointment)}
      className={`bg-white rounded-xl border border-slate-100 border-l-4 ${style.borderLeft} p-5 flex flex-col justify-between shadow-sm hover:shadow-lg hover:shadow-slate-200/60 hover:-translate-y-1 transition-all duration-300 cursor-pointer`}
    >
      <div>
        <div className="flex justify-between items-start mb-4">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${style.badgeBg} ${style.badgeText} text-xs font-medium`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`}></span>
            {categoryLabel}
          </span>
          <div className="text-right">
            <p className="text-sm font-bold text-slate-700">
              {formatTimeBR(appointment.startTime)}
            </p>
            <p className="text-[11px] text-slate-400 font-medium">
              {formatDateBR(appointment.startTime)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-4">
          <div
            className={`w-10 h-10 rounded-full ${style.iconBg} flex items-center justify-center ${style.iconText}`}
          >
            <i className={`ph-fill ${petIcon} text-xl`}></i>
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-base leading-tight">
              {appointment.petName}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {appointment.petSpecies} &bull; {appointment.petBreed}
            </p>
          </div>
        </div>

        {appointment.serviceCategory === 'CIRURGIA' ? (
          <div
            className={`${style.bannerBg} text-xs px-3 py-2 rounded-lg flex items-center gap-2 mb-4 font-medium`}
          >
            <i className="ph ph-scissors text-sm"></i> {appointment.serviceName}
          </div>
        ) : (
          <p className="text-xs text-slate-500 italic mb-4">{appointment.serviceName}</p>
        )}

        {appointment.googleEventId && (
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-medium mb-3">
            <i className="ph ph-calendar-check text-xs"></i>
            <span>Google Agenda Sincronizado</span>
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium truncate max-w-[170px]">
          <i className="ph ph-user-circle text-base shrink-0"></i> {appointment.clientName}
        </div>
        <span className="text-sm font-bold text-slate-700">
          {formatCurrencyBRL(appointment.servicePrice)}
        </span>
      </div>
    </div>
  );
};
