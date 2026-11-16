'use client';

import React from 'react';
import { getPetIcon, calculateAgeDescription } from '@vetcare/shared';
import { ClientWithPets } from '../../types/index';

interface ClientCardProps {
  client: ClientWithPets;
  onAddPet: (client: ClientWithPets) => void;
  onScheduleForClient: (client: ClientWithPets) => void;
  onEditClient?: (client: ClientWithPets) => void;
  onDeleteClient?: (id: string, name: string) => void;
}

export const ClientCard: React.FC<ClientCardProps> = ({
  client,
  onAddPet,
  onScheduleForClient,
  onEditClient,
  onDeleteClient,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm flex flex-col justify-between hover:border-slate-300 hover:shadow-md transition-all group">
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-base border border-emerald-100">
              {client.name[0]}
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-sm leading-tight group-hover:text-emerald-700 transition-colors">
                {client.name}
              </h4>
              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                <i className="ph ph-phone text-slate-400"></i> {client.phone}
              </p>
              <p className="text-[11px] text-slate-400 truncate max-w-[190px]">
                {client.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
            {onEditClient && (
              <button
                onClick={() => onEditClient(client)}
                className="w-7 h-7 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 flex items-center justify-center transition-colors cursor-pointer"
                title="Editar dados do tutor"
                aria-label={`Editar tutor ${client.name}`}
              >
                <i className="ph ph-pencil-simple text-sm"></i>
              </button>
            )}
            {onDeleteClient && (
              <button
                onClick={() => onDeleteClient(client.id, client.name)}
                className="w-7 h-7 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors cursor-pointer"
                title="Excluir tutor"
                aria-label={`Excluir tutor ${client.name}`}
              >
                <i className="ph ph-trash text-sm"></i>
              </button>
            )}
          </div>
        </div>

        {client.cpf && (
          <p className="text-[11px] text-slate-400 mb-3 bg-slate-50 px-2 py-0.5 rounded w-fit border border-slate-100">
            CPF: {client.cpf}
          </p>
        )}

        <div className="pt-3 border-t border-slate-100">
          <div className="flex justify-between items-center mb-2.5">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <i className="ph ph-paw-print text-emerald-500"></i>
              Animais ({client.pets.length})
            </span>
            <button
              onClick={() => onAddPet(client)}
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer hover:underline"
            >
              <i className="ph ph-plus-circle"></i> + Adicionar Pet
            </button>
          </div>

          {client.pets.length === 0 ? (
            <div className="p-3 bg-slate-50 border border-slate-100 border-dashed rounded-lg text-center">
              <p className="text-xs text-slate-400 italic">Nenhum animal vinculado.</p>
              <button
                onClick={() => onAddPet(client)}
                className="text-xs text-emerald-600 font-semibold mt-1 hover:underline cursor-pointer"
              >
                Cadastrar primeiro pet
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              {client.pets.map((p) => (
                <div
                  key={p.id}
                  className="bg-slate-50/80 border border-slate-200/60 rounded-lg p-2 flex items-center justify-between text-xs hover:bg-slate-100/60 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-white text-emerald-600 flex items-center justify-center border border-slate-200 shrink-0">
                      <i className={`ph-fill ${getPetIcon(p.species)} text-xs`}></i>
                    </div>
                    <div>
                      <span className="font-bold text-slate-800">{p.name}</span>
                      <span className="text-[10px] text-slate-400 ml-1.5">
                        {p.species} &bull; {p.breed}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-[10px] text-slate-400">
                    {p.sex && (
                      <span className="px-1.5 py-0.5 rounded bg-white border border-slate-200 font-medium flex items-center gap-1">
                        <i className={`ph ${p.sex === 'Macho' ? 'ph-gender-male' : 'ph-gender-female'} text-xs`}></i>
                        {p.sex === 'Macho' ? 'M' : 'F'}
                      </span>
                    )}
                    {p.weightKg && (
                      <span className="px-1.5 py-0.5 rounded bg-white border border-slate-200 font-medium">
                        {p.weightKg} kg
                      </span>
                    )}
                    {p.birthDate && (
                      <span className="px-1.5 py-0.5 rounded bg-white border border-slate-200 font-medium">
                        {calculateAgeDescription(p.birthDate)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
        <span className="text-[11px] text-slate-400">
          Cadastrado em {new Date(client.createdAt).toLocaleDateString('pt-BR')}
        </span>
        <button
          onClick={() => onScheduleForClient(client)}
          className="text-xs font-bold text-slate-700 hover:text-emerald-600 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-emerald-50 transition-colors cursor-pointer"
        >
          <i className="ph ph-calendar-plus text-sm text-emerald-600"></i> Agendar Atendimento
        </button>
      </div>
    </div>
  );
};
