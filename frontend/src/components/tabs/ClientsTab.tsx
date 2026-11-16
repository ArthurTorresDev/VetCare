'use client';

import React from 'react';
import { ClientWithPets } from '../../types/index';
import { ClientCard } from '../clients/ClientCard';

interface ClientsTabProps {
  clients: ClientWithPets[];
  onOpenNewTutorModal: () => void;
  onOpenNewPetModal: (client: ClientWithPets) => void;
  onScheduleForClient: (client: ClientWithPets) => void;
  onEditClient?: (client: ClientWithPets) => void;
  onDeleteClient?: (id: string, name: string) => void;
}

export const ClientsTab: React.FC<ClientsTabProps> = ({
  clients,
  onOpenNewTutorModal,
  onOpenNewPetModal,
  onScheduleForClient,
  onEditClient,
  onDeleteClient,
}) => {
  return (
    <div>
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 mb-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <i className="ph ph-users text-emerald-600 text-lg"></i>
            Tutores e Pacientes Cadastrados
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Gerencie o cadastro de clientes, dados de contato e vincule animais individualmente a cada um.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <span className="text-xs font-bold text-slate-700 block">
              {clients.length} tutores
            </span>
            <span className="text-[11px] text-slate-400">
              {clients.reduce((acc, c) => acc + c.pets.length, 0)} pets vinculados
            </span>
          </div>

          <button
            onClick={onOpenNewTutorModal}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm shadow-emerald-500/20 shrink-0"
          >
            <i className="ph ph-user-plus text-base"></i> + Novo Tutor
          </button>
        </div>
      </div>

      {clients.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 border-dashed p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <i className="ph ph-user text-2xl"></i>
          </div>
          <p className="text-slate-600 font-bold text-sm">Nenhum tutor encontrado.</p>
          <p className="text-slate-400 text-xs mt-1">
            Cadastre os clientes para poder vincular seus respectivos pets e criar agendamentos.
          </p>
          <button
            onClick={onOpenNewTutorModal}
            className="mt-4 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold px-4 py-2 rounded-lg inline-flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <i className="ph ph-user-plus"></i> + Cadastrar Primeiro Tutor
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clients.map((c) => (
            <ClientCard
              key={c.id}
              client={c}
              onAddPet={onOpenNewPetModal}
              onScheduleForClient={onScheduleForClient}
              onEditClient={onEditClient}
              onDeleteClient={onDeleteClient}
            />
          ))}
        </div>
      )}
    </div>
  );
};
