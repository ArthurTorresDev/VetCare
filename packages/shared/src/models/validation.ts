import { Appointment, Client } from './types.js';

/**
 * Retorna tutores cujo nome contém o termo digitado (mínimo 2 caracteres).
 */
export function filterClientsByPrefix(clients: Client[], query: string): Client[] {
  const trimmed = query.trim().toLowerCase();
  if (trimmed.length < 2) return [];
  return clients.filter((c) => c.name.toLowerCase().includes(trimmed));
}

/**
 * Verifica sobreposição de dois intervalos de tempo abertos.
 */
export function isOverlapping(startA: Date, endA: Date, startB: Date, endB: Date): boolean {
  return startA.getTime() < endB.getTime() && endA.getTime() > startB.getTime();
}

/**
 * Verifica conflito com agendamentos existentes (ignora compromissos cancelados).
 */
export function hasScheduleConflict(
  existingAppointments: Appointment[],
  newStartIso: string,
  newEndIso: string,
  ignoreAppointmentId?: string,
): { hasConflict: boolean; conflictingWith?: Appointment } {
  const newStart = new Date(newStartIso);
  const newEnd = new Date(newEndIso);
  for (const appt of existingAppointments) {
    if (appt.id === ignoreAppointmentId || appt.status === 'CANCELADO') continue;
    if (isOverlapping(newStart, newEnd, new Date(appt.startTime), new Date(appt.endTime))) {
      return { hasConflict: true, conflictingWith: appt };
    }
  }
  return { hasConflict: false };
}
