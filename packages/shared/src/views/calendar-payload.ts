/**
 * View para formatação de payload do Google Calendar API.
 * Apresentação profissional sem caracteres decorativos ou emojis.
 */
export function formatGoogleCalendarEventPayload(params: {
  appointmentId: string;
  clientName: string;
  clientPhone: string;
  petName: string;
  serviceName: string;
  veterinarianName: string;
  startTime: string;
  endTime: string;
  notes?: string;
  clinicAddress?: string;
}) {
  return {
    summary: `[MedPet] ${params.serviceName}: ${params.petName} (Tutor: ${params.clientName})`,
    description: [
      `PACIENTE: ${params.petName}`,
      `TUTOR: ${params.clientName} (Tel: ${params.clientPhone})`,
      `SERVICO: ${params.serviceName}`,
      `VETERINARIO: ${params.veterinarianName}`,
      params.notes ? `OBSERVACOES: ${params.notes}` : null,
      `ID SISTEMA MEDPET: ${params.appointmentId}`,
    ]
      .filter(Boolean)
      .join('\n'),
    location: params.clinicAddress || 'Clínica Veterinária MedPet - Rua dos Pets, 100',
    start: { dateTime: params.startTime, timeZone: 'America/Sao_Paulo' },
    end: { dateTime: params.endTime, timeZone: 'America/Sao_Paulo' },
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'popup', minutes: 30 },
        { method: 'email', minutes: 120 },
      ],
    },
  };
}
