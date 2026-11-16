'use client';

import React from 'react';
import {
  AppointmentDetailedView,
  PeriodFilter,
  formatDateBR,
  formatTimeBR,
  getServiceStyleClass,
} from '@vetcare/shared';
import { CLINIC_HOURS } from '@vetcare/ui';

interface CalendarGridProps {
  gridDays: Date[];
  periodFilter: PeriodFilter;
  appointmentsByDateHour: Map<string, AppointmentDetailedView[]>;
  onSelectAppointment: (appt: AppointmentDetailedView) => void;
  onSelectSlot: (dateIso: string, hourString: string) => void;
}

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  gridDays,
  periodFilter,
  appointmentsByDateHour,
  onSelectAppointment,
  onSelectSlot,
}) => {
  const colCount = gridDays.length + 1;
  const gridCols = `repeat(${colCount}, minmax(0, 1fr))`;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      {/* Cabeçalho de dias */}
      <div
        className="grid border-b border-slate-200 bg-slate-50/70 text-center sticky top-0 z-10"
        style={{ gridTemplateColumns: gridCols }}
      >
        <div className="py-3 text-xs font-bold text-slate-400 border-r border-slate-200">
          HORA
        </div>
        {gridDays.map((d, i) => {
          const isToday = d.toDateString() === new Date().toDateString();
          return (
            <div
              key={i}
              className={`py-3 border-r border-slate-200 last:border-r-0 ${
                isToday ? 'bg-emerald-500/10' : ''
              }`}
            >
              <span className="block text-[11px] font-bold text-slate-500 uppercase">
                {periodFilter === 'ANO'
                  ? d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')
                  : d.toLocaleDateString('pt-BR', { weekday: 'short' })}
              </span>
              <span className="block text-[10px] text-slate-400 font-medium">
                {periodFilter === 'ANO' ? d.getFullYear() : formatDateBR(d)}
              </span>
              {periodFilter !== 'ANO' && (
                <span
                  className={`inline-block mt-0.5 text-sm font-bold ${
                    isToday
                      ? 'bg-emerald-500 text-white w-7 h-7 leading-7 rounded-full'
                      : 'text-slate-800'
                  }`}
                >
                  {d.getDate()}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Grade de horários com slots interativos */}
      <div className="overflow-y-auto max-h-[640px]">
        {CLINIC_HOURS.map((hour) => {
          const hourNum = parseInt(hour.split(':')[0], 10);
          return (
            <div
              key={hour}
              className="grid border-b border-slate-100 min-h-[72px]"
              style={{ gridTemplateColumns: gridCols }}
            >
              <div className="p-2 border-r border-slate-200 text-right text-xs font-semibold text-slate-400 bg-slate-50/30">
                {hour}
              </div>
              {gridDays.map((d, colIdx) => {
                const dateIso = d.toISOString().split('T')[0];
                const cellAppts = appointmentsByDateHour.get(`${dateIso}_${hourNum}`) ?? [];

                return (
                  <div
                    key={colIdx}
                    onClick={() => onSelectSlot(dateIso, hour)}
                    className="border-r border-slate-100 last:border-r-0 p-1.5 hover:bg-emerald-50/40 transition-colors cursor-pointer relative group"
                    title={`Clique para agendar em ${formatDateBR(d)} às ${hour}`}
                  >
                    {cellAppts.map((a) => {
                      const style = getServiceStyleClass(a.serviceCategory);
                      return (
                        <div
                          key={a.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectAppointment(a);
                          }}
                          className={`rounded-lg p-2 text-xs border ${style.bannerBg} hover:shadow-md transition-shadow cursor-pointer mb-1`}
                        >
                          <div className="font-bold flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                              <i className="ph ph-paw-print text-[11px]"></i>
                              {a.petName}
                            </span>
                            <span className="text-[10px] font-medium opacity-80">
                              {formatTimeBR(a.startTime)}
                            </span>
                          </div>
                          <div className="text-[11px] truncate opacity-90">{a.serviceName}</div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};
