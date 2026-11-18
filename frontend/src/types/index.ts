import { Client, Pet } from '@vetcare/shared';

export interface ClientWithPets extends Client {
  pets: Pet[];
}

export type TabType =
  | 'DASHBOARD'
  | 'CLIENTES'
  | 'SERVICOS'
  | 'CONSULTAS_REALIZADAS'
  | 'CANCELADAS'
  | 'RELATORIOS'
  | 'HISTORICO';

export type DisplayMode = 'CARDS' | 'Calendario_WEEK';
