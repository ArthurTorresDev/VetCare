import { TabType } from '../types/index';

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export const TAB_LABELS: Record<TabType, string> = {
  DASHBOARD: 'Agenda de Atendimentos',
  CLIENTES: 'Clientes (Tutores) & Animais',
  SERVICOS: 'Catálogo de Serviços Clínicos',
  CONSULTAS_REALIZADAS: 'Consultas Realizadas & Finalizadas',
  CANCELADAS: 'Agendamentos Cancelados',
  RELATORIOS: 'Exportação de Registros (XML)',
  HISTORICO: 'Histórico & Auditoria de Operações',
};

export const TAB_SUBTITLES: Record<TabType, string> = {
  DASHBOARD: 'Visão geral da agenda com sincronização em tempo real com o Google Calendar.',
  CLIENTES: 'Gestão cadastral completa de tutores e vínculo exclusivo de seus respectivos pets.',
  SERVICOS: 'Administração dos serviços clínicos, durações padrão, valores e instruções.',
  CONSULTAS_REALIZADAS: 'Histórico completo de atendimentos veterinários concluídos com sucesso.',
  CANCELADAS: 'Registro e auditoria de cancelamentos e desistências de consultas.',
  RELATORIOS: 'Exportação de prontuários e agendamentos em formato XML estruturado.',
  HISTORICO: 'Rastreabilidade de todas as ações e alterações efetuadas no sistema.',
};

export const VETS_LIST = [
  'Dr. Carlos - Veterinário Chefe',
  'Dra. Camila Rocha (Clínica Geral)',
  'Dr. Lucas Mendes (Cirurgião Veterinário)',
  'Dra. Beatriz Fernandes (Anestesista / Felinos)',
];
