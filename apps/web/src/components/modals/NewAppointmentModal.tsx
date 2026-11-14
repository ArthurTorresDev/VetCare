'use client';

import React, { useState } from 'react';
import {
  ClinicService,
  formatDateBR,
  formatCurrencyBRL,
} from '@vetcare/shared';
import { ClientWithPets } from '../../types/index';
import { VETS_LIST } from '../../config/constants';
import DatePicker from "react-datepicker";
import { ptBR } from "date-fns/locale";
import "react-datepicker/dist/react-datepicker.css";

interface NewAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  tutorSearchInput: string;
  setTutorSearchInput: (val: string) => void;
  isTutorDropdownOpen: boolean;
  setIsTutorDropdownOpen: (open: boolean) => void;
  selectedClient: ClientWithPets | null;
  tutorRecommendations: ClientWithPets[];
  onSelectTutor: (client: ClientWithPets) => void;
  onClearTutor: () => void;
  onOpenNewTutorModal: () => void;
  onOpenNewPetModal: (tutor: ClientWithPets) => void;
  petId: string;
  setPetId: (val: string) => void;
  serviceId: string;
  onServiceChange: (val: string) => void;
  services: ClinicService[];
  vetName: string;
  setVetName: (val: string) => void;
  date: string;
  setDate: (val: string) => void;
  time: string;
  setTime: (val: string) => void;
  duration: number;
  setDuration: (val: number) => void;
  notes: string;
  setNotes: (val: string) => void;
  submitting: boolean;
  errorMessage: string | null;
  conflictingAppointment: any | null;
  onSubmit: (e: React.FormEvent) => void;
  tutorInputRef: React.RefObject<HTMLInputElement | null>;
}

export const NewAppointmentModal: React.FC<NewAppointmentModalProps> = ({
  isOpen,
  onClose,
  tutorSearchInput,
  setTutorSearchInput,
  isTutorDropdownOpen,
  setIsTutorDropdownOpen,
  selectedClient,
  tutorRecommendations,
  onSelectTutor,
  onClearTutor,
  onOpenNewTutorModal,
  onOpenNewPetModal,
  petId,
  setPetId,
  serviceId,
  onServiceChange,
  services,
  vetName,
  setVetName,
  date,
  setDate,
  time,
  setTime,
  duration,
  setDuration,
  notes,
  setNotes,
  submitting,
  errorMessage,
  conflictingAppointment,
  onSubmit,
  tutorInputRef,
}) => {
  if (!isOpen) return null;

  const selectedService = services.find((s) => s.id === serviceId);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="new-appointment-title"
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn"
    >
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
        {/* Cabeçalho Didático */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                Novo Agendamento Clínico
              </span>
            </div>
            <h3 id="new-appointment-title" className="text-xl font-bold text-slate-800 mt-1">
              Marcar Consulta ou Procedimento
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Siga os passos abaixo. O sistema verificará conflitos e sincronizará no Google Agenda.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center cursor-pointer transition-colors"
            aria-label="Fechar modal"
          >
            ✕
          </button>
        </div>

        {/* Guia Didático por Etapas */}
        <div className="grid grid-cols-3 gap-2 mb-5 text-center text-[11px] font-semibold">
          <div
            className={`py-1.5 px-2 rounded-lg border flex items-center justify-center gap-1.5 ${selectedClient && petId
              ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
              : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}
          >
            <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 text-[10px] flex items-center justify-center font-bold">
              1
            </span>
            <span>Paciente</span>
          </div>
          <div
            className={`py-1.5 px-2 rounded-lg border flex items-center justify-center gap-1.5 ${serviceId
              ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
              : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}
          >
            <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 text-[10px] flex items-center justify-center font-bold">
              2
            </span>
            <span>Serviço</span>
          </div>
          <div
            className={`py-1.5 px-2 rounded-lg border flex items-center justify-center gap-1.5 ${date && time
              ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
              : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}
          >
            <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 text-[10px] flex items-center justify-center font-bold">
              3
            </span>
            <span>Horário</span>
          </div>
        </div>

        {/* Alerta de Conflito com Explicação Didática */}
        {errorMessage && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-4 rounded-xl mb-5 shadow-sm">
            <div className="font-bold flex items-center gap-2 mb-1">
              <i className="ph ph-warning-circle text-lg text-rose-600"></i>
              <span>{errorMessage}</span>
            </div>
            {conflictingAppointment && (
              <div className="mt-2 text-[11px] bg-white/80 p-2.5 rounded-lg border border-rose-200 text-slate-700">
                <p>
                  <strong>Atendimento Conflitante:</strong>{' '}
                  {new Date(conflictingAppointment.startTime).toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}{' '}
                  às{' '}
                  {new Date(conflictingAppointment.endTime).toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
                <p className="text-slate-500 mt-1">
                  💡 <strong>Sugestão:</strong> Ajuste o horário para após as{' '}
                  {new Date(conflictingAppointment.endTime).toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}{' '}
                  ou escolha outro dia.
                </p>
              </div>
            )}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          {/* SEÇÃO 1: TUTOR & PET */}
          <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 space-y-3">
            <div className="relative">
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <i className="ph ph-user text-emerald-600"></i>
                  1. Tutor (Cliente Responsável):
                </label>
                {!selectedClient && (
                  <button
                    type="button"
                    onClick={onOpenNewTutorModal}
                    className="text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <i className="ph ph-user-plus"></i> + Novo Tutor
                  </button>
                )}
              </div>

              {selectedClient ? (
                <div className="flex items-center justify-between p-3 bg-white border border-emerald-300 rounded-lg text-sm shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs">
                      {selectedClient.name[0]}
                    </div>
                    <div>
                      <span className="font-bold text-slate-800 block leading-tight">
                        {selectedClient.name}
                      </span>
                      <span className="text-xs text-slate-500">
                        Tel: {selectedClient.phone} &bull; {selectedClient.email}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={onClearTutor}
                    className="text-xs text-slate-400 hover:text-rose-600 font-bold px-2 py-1 rounded hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Trocar de tutor"
                  >
                    ✕ Trocar
                  </button>
                </div>
              ) : (
                <div>
                  <div className="relative">
                    <input
                      ref={tutorInputRef}
                      type="text"
                      value={tutorSearchInput}
                      onChange={(e) => {
                        setTutorSearchInput(e.target.value);
                        setIsTutorDropdownOpen(e.target.value.trim().length >= 2);
                      }}
                      onFocus={() => {
                        if (tutorSearchInput.trim().length >= 2) setIsTutorDropdownOpen(true);
                      }}
                      placeholder="Digite o nome, telefone ou e-mail do tutor..."
                      className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 pr-8"
                    />
                    <i className="ph ph-magnifying-glass absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
                  </div>

                  {tutorSearchInput.trim().length === 1 && (
                    <p className="text-[11px] text-slate-400 mt-1">
                      Digite mais 1 caractere para buscar...
                    </p>
                  )}

                  {isTutorDropdownOpen && tutorSearchInput.trim().length >= 2 && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-48 overflow-y-auto z-50 divide-y divide-slate-100">
                      {tutorRecommendations.length === 0 ? (
                        <div className="p-3 text-xs text-slate-400 text-center">
                          Nenhum tutor encontrado com &quot;{tutorSearchInput}&quot;.
                          <button
                            type="button"
                            onClick={onOpenNewTutorModal}
                            className="block mx-auto mt-2 text-xs font-bold text-emerald-600 hover:underline"
                          >
                            + Cadastrar este tutor agora
                          </button>
                        </div>
                      ) : (
                        tutorRecommendations.map((c) => (
                          <div
                            key={c.id}
                            onClick={() => onSelectTutor(c)}
                            className="p-2.5 hover:bg-emerald-50/70 cursor-pointer flex items-center justify-between text-sm transition-colors"
                          >
                            <div>
                              <span className="font-bold text-slate-800">{c.name}</span>
                              <span className="text-xs text-slate-500 ml-2">
                                ({c.phone}) &bull; {c.pets.length} pets
                              </span>
                            </div>
                            <span className="text-xs text-emerald-600 font-semibold">
                              Selecionar &rarr;
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Pet do Tutor */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <i className="ph ph-paw-print text-emerald-600"></i>
                  Animal Paciente:
                </label>
                {selectedClient && (
                  <button
                    type="button"
                    onClick={() => onOpenNewPetModal(selectedClient)}
                    className="text-xs font-bold text-emerald-600 hover:underline cursor-pointer"
                  >
                    + Cadastrar Pet para {selectedClient.name.split(' ')[0]}
                  </button>
                )}
              </div>

              {!selectedClient ? (
                <div className="w-full bg-slate-100/80 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-400 italic">
                  💡 Primeiro selecione um tutor acima para carregar seus animais vinculados.
                </div>
              ) : selectedClient.pets.length === 0 ? (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between text-xs text-amber-800">
                  <span>Este tutor ainda não possui pets cadastrados.</span>
                  <button
                    type="button"
                    onClick={() => onOpenNewPetModal(selectedClient)}
                    className="font-bold text-emerald-600 hover:underline cursor-pointer"
                  >
                    + Cadastrar Pet Agora
                  </button>
                </div>
              ) : (
                <select
                  value={petId}
                  onChange={(e) => setPetId(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  required
                >
                  <option value="">Selecione o pet deste tutor...</option>
                  {selectedClient.pets.map((p) => (
                    <option key={p.id} value={p.id}>
                      🐾 {p.name} ({p.species} &bull; {p.breed} &bull; {p.sex || 'Sexo ñ inf.'})
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* SEÇÃO 2: SERVIÇO & DURAÇÃO */}
          <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <i className="ph ph-stethoscope text-emerald-600"></i>
                2. Procedimento / Serviço Clínico:
              </label>
              <select
                value={serviceId}
                onChange={(e) => onServiceChange(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                required
              >
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.durationMinutes} min) — {formatCurrencyBRL(s.price)}
                  </option>
                ))}
              </select>
            </div>

            {selectedService && (
              <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
                <span>
                  <strong>Categoria:</strong> {selectedService.category}
                </span>
                <span>
                  <strong>Recurso:</strong> {selectedService.requiredResource || 'Consultório'}
                </span>
                <span className="font-bold text-emerald-700">
                  {formatCurrencyBRL(selectedService.price)}
                </span>
              </div>
            )}
          </div>

          {/* SEÇÃO 3: DATA, HORÁRIO & VETERINÁRIO */}
          <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 space-y-3">
            <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <i className="ph ph-clock text-emerald-600"></i>
              3. Data, Horário e Profissional:
            </label>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Data:
                </label>

                <DatePicker
                  selected={date ? new Date(`${date}T12:00:00`) : null}
                  onChange={(selectedDate: Date | null) => {
                    setDate(
                      selectedDate
                        ? [
                          selectedDate.getFullYear(),
                          String(selectedDate.getMonth() + 1).padStart(2, '0'),
                          String(selectedDate.getDate()).padStart(2, '0'),
                        ].join('-')
                        : ''
                    );
                  }}
                  dateFormat="dd/MM/yyyy"
                  locale={ptBR}
                  placeholderText="dd/mm/aaaa"
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Horário de Início:
                </label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Duração (minutos):
                </label>
                <input
                  type="number"
                  step={5}
                  min={10}
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Veterinário Responsável:
              </label>
              <select
                value={vetName}
                onChange={(e) => setVetName(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              >
                {VETS_LIST.map((vet) => (
                  <option key={vet} value={vet}>
                    {vet}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Observações Clínicas / Instruções de Jejum:
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ex: Animal em jejum de 8h, trazer exames de sangue anteriores..."
                className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              ></textarea>
            </div>
          </div>

          {/* BOTÕES DE AÇÃO COM FEEDBACK */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-slate-200 rounded-lg text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm px-6 py-2.5 rounded-lg transition-colors cursor-pointer disabled:opacity-60 flex items-center gap-2 shadow-sm shadow-emerald-600/30"
            >
              {submitting ? (
                <>
                  <i className="ph ph-spinner animate-spin text-base"></i>
                  <span>Validando e Sincronizando...</span>
                </>
              ) : (
                <>
                  <i className="ph ph-check text-base"></i>
                  <span>Confirmar e Salvar</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
