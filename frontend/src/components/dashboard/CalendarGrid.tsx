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
import { HolidayItem } from '../../services/holiday.service';

export interface CalendarGridProps {
  gridDays: Date[];
  periodFilter: PeriodFilter;
  appointmentsByDateHour: Map<string, AppointmentDetailedView[]>;
  holidays?: HolidayItem[];
  onSelectAppointment: (appt: AppointmentDetailedView) => void;
  onSelectSlot: (dateIso: string, hourString: string) => void;
}

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  gridDays,
  periodFilter,
  appointmentsByDateHour,
  holidays = [],
  onSelectAppointment,
  onSelectSlot,
}) => {
  const colCount = gridDays.length + 1;
  const gridCols = `repeat(${colCount}, minmax(0, 1fr))`;

  // Mapeamento rápido de feriados por data ISO e data BR
  const holidayMap = React.useMemo(() => {
    const map = new Map<string, HolidayItem>();
    holidays.forEach((h) => {
      map.set(h.date, h);
      map.set(h.dateBR, h);
    });
    return map;
  }, [holidays]);

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
          const dateIso = d.toISOString().split('T')[0];
          const holiday = holidayMap.get(dateIso);

          return (
            <div
              key={i}
              className={`py-3 border-r border-slate-200 last:border-r-0 relative transition-colors ${holiday
                ? 'bg-amber-100/40 hover:bg-amber-100/60'
                : isToday
                  ? 'bg-emerald-500/10'
                  : ''
                }`}
              title={holiday ? `Feriado Nacional: ${holiday.name}` : undefined}
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
                  className={`inline-block mt-0.5 text-sm font-bold ${isToday
                    ? 'bg-emerald-500 text-white w-7 h-7 leading-7 rounded-full'
                    : 'text-slate-800'
                    }`}
                >
                  {d.getDate()}
                </span>
              )}
              {holiday && (
                <div className="mt-1 px-1">
                  <span
                    className="inline-flex items-center gap-1 text-[9px] font-bold text-amber-800 bg-amber-200/70 px-1.5 py-0.5 rounded truncate max-w-full"
                    title={holiday.name}
                  >
                    <i className="ph-fill ph-flag-banner text-[10px] text-amber-600"></i>
                    <span className="truncate">{holiday.name}</span>
                  </span>
                </div>
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
                const holiday = holidayMap.get(dateIso);
                const cellAppts = appointmentsByDateHour.get(`${dateIso}_${hourNum}`) ?? [];

                return (
                  <div
                    key={colIdx}
                    onClick={() => onSelectSlot(dateIso, hour)}
                    className={`border-r border-slate-100 last:border-r-0 p-1.5 transition-colors cursor-pointer relative group ${holiday
                      ? 'bg-amber-50/30 hover:bg-amber-100/50'
                      : 'hover:bg-emerald-50/40'
                      }`}
                    title={
                      holiday
                        ? `Feriado Nacional: ${holiday.name} - Clique para agendar`
                        : `Clique para agendar em ${formatDateBR(d)} às ${hour}`
                    }
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
