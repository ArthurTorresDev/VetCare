import type { AppointmentDetailedView } from '../models/types';
import { formatDateBR, formatTimeBR } from '../utils/date';

/**
 * View de Exportação XML Estruturado de Agendamentos Clínicos.
 */
export function generateAppointmentsXml(appointments: AppointmentDetailedView[]): string {
  const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>';
  const xmlNodes = appointments
    .map(
      (a) => `  <agendamento id="${escapeXml(a.id)}">
    <status>${escapeXml(a.status)}</status>
    <tutor nome="${escapeXml(a.clientName)}" telefone="${escapeXml(a.clientPhone)}" email="${escapeXml(a.clientEmail)}" />
    <paciente nome="${escapeXml(a.petName)}" especie="${escapeXml(a.petSpecies)}" raca="${escapeXml(a.petBreed)}" />
    <servico nome="${escapeXml(a.serviceName)}" categoria="${escapeXml(a.serviceCategory)}" valor="${a.servicePrice.toFixed(2)}" />
    <veterinario>${escapeXml(a.veterinarianName)}</veterinario>
    <horario inicio="${escapeXml(formatDateBR(a.startTime))} ${escapeXml(formatTimeBR(a.startTime))}" termino="${escapeXml(formatDateBR(a.endTime))} ${escapeXml(formatTimeBR(a.endTime))}" />
    <googleCalendar eventId="${escapeXml(a.googleEventId || '')}" status="${escapeXml(a.googleSyncStatus)}" />
    <observacoes>${escapeXml(a.notes || '')}</observacoes>
  </agendamento>`,
    )
    .join('\n');

  return `${xmlHeader}\n<relatorioAgendamentos clinica="MedPet / VetCare" total="${appointments.length}" geradoEm="${new Date().toISOString()}">\n${xmlNodes}\n</relatorioAgendamentos>`;
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
