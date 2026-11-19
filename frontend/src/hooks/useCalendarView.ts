import { useState, useMemo, useCallback } from 'react';
import { PeriodFilter, getDateRange, AppointmentDetailedView } from '@vetcare/shared';
import { DisplayMode } from '../types/index';

export function useCalendarView(appointments: AppointmentDetailedView[]) {
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('SEMANA');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [displayMode, setDisplayMode] = useState<DisplayMode>('CARDS');

  const handlePeriodChange = useCallback((newPeriod: PeriodFilter) => {
    const now = new Date();
    setPeriodFilter(newPeriod);
    switch (newPeriod) {
      case 'HOJE':
      case 'SEMANA':
        setCurrentDate(now);
        break;
      case 'MES':
        setCurrentDate(new Date(now.getFullYear(), now.getMonth(), 1));
        break;
      case 'ANO':
        setCurrentDate(new Date(now.getFullYear(), 0, 1));
        break;
    }
  }, []);

  const gridDays = useMemo(
    () => getDateRange(periodFilter, currentDate),
    [periodFilter, currentDate],
  );

  const appointmentsByDateHour = useMemo(() => {
    const map = new Map<string, AppointmentDetailedView[]>();
    for (const a of appointments) {
      const d = new Date(a.startTime);
      const key = `${d.toISOString().split('T')[0]}_${d.getHours()}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(a);
    }
    return map;
  }, [appointments]);

  return {
    periodFilter,
    currentDate,
    setCurrentDate,
    displayMode,
    setDisplayMode,
    handlePeriodChange,
    gridDays,
    appointmentsByDateHour,
  };
}
