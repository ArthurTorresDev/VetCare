'use client';

import React from 'react';
import {
  AppointmentDetailedView,
  AppointmentStatus,
  formatDateBR,
  formatTimeBR,
  formatCurrencyBRL,
  getPetIcon,
} from '@vetcare/shared';

interface AppointmentDetailModalProps {
  appointment: AppointmentDetailedView | null;
  onClose: () => void;
  onUpdateStatus: (id: string, newStatus: AppointmentStatus) => Promise<any>;
  onCancel: (id: string) => void;
}

export const AppointmentDetailModal: React.FC<AppointmentDetailModalProps> = ({
  appointment,
  onClose,
  onUpdateStatus,
  onCancel,
}) => {
  if (!appointment) return null;

  const petIcon = getPetIcon(appointment.petSpecies);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="appointment-detail-title"
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn"
    >
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl shrink-0 border border-emerald-100">
              <i className={`ph-fill ${petIcon}`}></i>
            </div>
            <div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                {appointment.serviceCategory} &bull; {appointment.status}
              </span>
              <h3 id="appointment-detail-title" className="text-xl font-bold text-slate-800 mt-1">
                {appointment.petName}
              </h3>
              <p className="text-xs text-slate-500">
                {appointment.petSpecies} &bull; {appointment.petBreed}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center cursor-pointer transition-colors"
            aria-label="Fechar modal"
          >
            ✕
          </button>
        </div>

        {/* Detalhes Clínicos */}
        <div className="space-y-2.5 text-xs sm:text-sm border-t border-b border-slate-100 py-4 my-2">
          {[
            ['Tutor Responsável', `${appointment.clientName}`],
            ['Telefone / WhatsApp', `${appointment.clientPhone}`],
            ['E-mail do Tutor', appointment.clientEmail],
            ['Procedimento', appointment.serviceName],
            [
              'Data & Horário',
              `${formatDateBR(appointment.startTime)} às ${formatTimeBR(
                appointment.startTime,
              )}`,
            ],
            ['Veterinário(a)', appointment.veterinarianName],
            ['Valor Previsto', formatCurrencyBRL(appointment.servicePrice)],
            ['Criado por', appointment.createdByUser || 'Recepção (MedPet)'],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between items-center py-0.5">
              <span className="text-slate-500">{label}:</span>
              <span className="font-semibold text-slate-800 text-right">{value}</span>
            </div>
          ))}

          {appointment.notes && (
            <div className="pt-2 border-t border-slate-100">
              <span className="text-slate-500 block text-xs font-semibold mb-1">
                Observações Clínicas:
              </span>
              <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200 leading-relaxed">
                {appointment.notes}
              </p>
            </div>
          )}

          {appointment.googleEventId && (
            <div className="pt-2">
              <a
                href={appointment.googleCalendarHtmlLink}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1.5 p-2 bg-emerald-50 rounded-lg border border-emerald-100 transition-colors"
              >
                <i className="ph ph-calendar-check text-base"></i>
                <span>Sincronizado no Google Calendar &rarr; Abrir Evento</span>
              </a>
            </div>
          )}
        </div>

        {/* Guia Didático de Fluxo de Estados */}
        <div className="mb-4 text-[11px] text-slate-400">
          <strong>Fluxo Recomendado:</strong> Agendado &rarr; Confirmado &rarr; Em Atendimento &rarr; Concluído.
        </div>

        {/* Ações de Transição de Estado */}
        <div className="flex flex-wrap gap-2 justify-end">
          {appointment.status === 'AGENDADO' && (
            <button
              onClick={() => onUpdateStatus(appointment.id, 'CONFIRMADO')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-4 py-2 rounded-lg cursor-pointer transition-colors shadow-sm shadow-emerald-600/20"
            >
              ✓ Confirmar Presença
            </button>
          )}

          {appointment.status === 'CONFIRMADO' && (
            <>
              <button
                onClick={() => onUpdateStatus(appointment.id, 'EM_ATENDIMENTO')}
                className="bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs px-4 py-2 rounded-lg cursor-pointer transition-colors shadow-sm shadow-amber-500/20"
              >
                🩺 Iniciar Atendimento
              </button>
              <button
                onClick={() => onUpdateStatus(appointment.id, 'NAO_COMPARECEU')}
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs px-3 py-2 rounded-lg cursor-pointer transition-colors"
              >
                Não Compareceu
              </button>
            </>
          )}

          {appointment.status === 'EM_ATENDIMENTO' && (
            <button
              onClick={() => onUpdateStatus(appointment.id, 'CONCLUIDO')}
              className="bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs px-5 py-2 rounded-lg cursor-pointer transition-colors shadow-sm"
            >
              ✓ Finalizar Atendimento
            </button>
          )}

          {appointment.status !== 'CANCELADO' && appointment.status !== 'CONCLUIDO' && (
            <button
              onClick={() => onCancel(appointment.id)}
              className="border border-rose-200 text-rose-600 hover:bg-rose-50 font-semibold text-xs px-3.5 py-2 rounded-lg cursor-pointer transition-colors"
            >
              Cancelar Consulta
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
