/**
 * @vetcare/ui - Design Tokens, Helpers e Componentes Visuais do Sistema VetCare / MedPet
 */

import {
  AppointmentStatus,
  GoogleCalendarSyncStatus,
  ServiceCategory,
  formatDateBR,
  formatTimeBR,
  formatDateTimeBR,
} from '@vetcare/shared';

export { formatDateBR, formatTimeBR, formatDateTimeBR };

// Mapeamento de cores e rótulos para as categorias de serviços (Estilo VetPal / Google Calendar)
export const SERVICE_CATEGORY_CONFIG: Record<
  ServiceCategory,
  { label: string; color: string; bgLight: string; textDark: string; border: string }
> = {
  CONSULTA: {
    label: 'Consulta',
    color: '#0284c7', // Azul
    bgLight: '#e0f2fe',
    textDark: '#0369a1',
    border: '#7dd3fc',
  },
  VACINA: {
    label: 'Vacinação',
    color: '#10b981', // Verde
    bgLight: '#d1fae5',
    textDark: '#047857',
    border: '#6ee7b7',
  },
  CIRURGIA: {
    label: 'Cirurgia',
    color: '#ef4444', // Vermelho
    bgLight: '#fee2e2',
    textDark: '#b91c1c',
    border: '#fca5a5',
  },
  CHECKUP: {
    label: 'Checkup',
    color: '#f59e0b', // Laranja
    bgLight: '#fef3c7',
    textDark: '#b45309',
    border: '#fcd34d',
  },
  RETORNO: {
    label: 'Retorno',
    color: '#ec4899', // Rosa
    bgLight: '#fce7f3',
    textDark: '#be185d',
    border: '#f9a8d4',
  },
  EMERGENCIA: {
    label: 'Emergência',
    color: '#8b5cf6', // Roxo
    bgLight: '#ede9fe',
    textDark: '#6d28d9',
    border: '#c4b5fd',
  },
};

// Mapeamento de cores e rótulos para as situações de agendamento
export const APPOINTMENT_STATUS_CONFIG: Record<
  AppointmentStatus,
  { label: string; bg: string; text: string; border: string; description: string }
> = {
  AGENDADO: {
    label: 'Agendado',
    bg: '#eff6ff',
    text: '#1d4ed8',
    border: '#bfdbfe',
    description: 'Consulta marcada, aguardando confirmação do tutor',
  },
  CONFIRMADO: {
    label: 'Confirmado',
    bg: '#ecfdf5',
    text: '#047857',
    border: '#a7f3d0',
    description: 'Tutor confirmou presença',
  },
  EM_ATENDIMENTO: {
    label: 'Em Atendimento',
    bg: '#fffbeb',
    text: '#b45309',
    border: '#fde68a',
    description: 'Paciente no consultório com o veterinário',
  },
  CONCLUIDO: {
    label: 'Concluído',
    bg: '#f3f4f6',
    text: '#374151',
    border: '#e5e7eb',
    description: 'Atendimento finalizado com sucesso',
  },
  CANCELADO: {
    label: 'Cancelado',
    bg: '#fef2f2',
    text: '#b91c1c',
    border: '#fecaca',
    description: 'Agendamento cancelado pelo tutor ou clínica',
  },
  NAO_COMPARECEU: {
    label: 'Não Compareceu',
    bg: '#faf5ff',
    text: '#7e22ce',
    border: '#e9d5ff',
    description: 'Tutor não compareceu no horário marcado',
  },
};

// Mapeamento de status da integração com a API do Google Agenda
export const GOOGLE_SYNC_STATUS_CONFIG: Record<
  GoogleCalendarSyncStatus,
  { label: string; badgeColor: string; icon: string }
> = {
  SYNCED: {
    label: 'Sincronizado no Google Agenda',
    badgeColor: '#10b981',
    icon: '✓',
  },
  MOCKED: {
    label: 'Google Agenda (Modo Simulado)',
    badgeColor: '#3b82f6',
    icon: '⚡',
  },
  PENDING: {
    label: 'Sincronização Pendente',
    badgeColor: '#f59e0b',
    icon: '⏳',
  },
  FAILED: {
    label: 'Falha na Sincronização Google',
    badgeColor: '#ef4444',
    icon: '✕',
  },
};

/**
 * Utilitário de formatação de horários em pt-BR
 */
export function formatAppointmentTimeRange(startIso: string, endIso: string): string {
  const start = new Date(startIso);
  const end = new Date(endIso);

  const startFormatted = start.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Sao_Paulo',
  });

  const endFormatted = end.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Sao_Paulo',
  });

  return `${startFormatted} às ${endFormatted}`;
}

/**
 * Utilitário de formatação de moeda em BRL
 */
export function formatCurrencyBRL(amount: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount);
}

/**
 * Lista de horas úteis da clínica (07:00 às 19:00)
 */
export const CLINIC_HOURS = [
  '07:00',
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
  '19:00',
];
