'use client';

import React from 'react';
import { ClientWithPets } from '../../types/index';

interface NewPetModalProps {
  selectedTutor: ClientWithPets | null;
  onClose: () => void;
  name: string;
  setName: (val: string) => void;
  species: 'Cão' | 'Gato' | 'Ave' | 'Outro';
  setSpecies: (val: 'Cão' | 'Gato' | 'Ave' | 'Outro') => void;
  breed: string;
  setBreed: (val: string) => void;
  sex: 'Macho' | 'Fêmea';
  setSex: (val: 'Macho' | 'Fêmea') => void;
  birthDate: string;
  setBirthDate: (val: string) => void;
  weightKg: string;
  setWeightKg: (val: string) => void;
  notes: string;
  setNotes: (val: string) => void;
  submitting: boolean;
  error: string | null;
  onSubmit: (e: React.FormEvent) => void;
}

export const NewPetModal: React.FC<NewPetModalProps> = ({
  selectedTutor,
  onClose,
  name,
  setName,
  species,
  setSpecies,
  breed,
  setBreed,
  sex,
  setSex,
  birthDate,
  setBirthDate,
  weightKg,
  setWeightKg,
  notes,
  setNotes,
  submitting,
  error,
  onSubmit,
}) => {
  if (!selectedTutor) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn"
    >
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Cadastrar Novo Pet</h3>
            <p className="text-xs text-slate-400">
              Tutor responsável: <strong className="text-slate-700">{selectedTutor.name}</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center cursor-pointer transition-colors"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-lg mb-3">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-slate-700">Nome do Animal:</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Rex, Thor, Mel..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700">Espécie:</label>
              <select
                value={species}
                onChange={(e) =>
                  setSpecies(e.target.value as 'Cão' | 'Gato' | 'Ave' | 'Outro')
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 mt-1"
              >
                <option value="Cão">Cão</option>
                <option value="Gato">Gato</option>
                <option value="Ave">Ave</option>
                <option value="Outro">Outro</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Sexo:</label>
              <select
                value={sex}
                onChange={(e) => setSex(e.target.value as 'Macho' | 'Fêmea')}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 mt-1"
              >
                <option value="Macho">Macho</option>
                <option value="Fêmea">Fêmea</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700">Raça:</label>
            <input
              type="text"
              value={breed}
              onChange={(e) => setBreed(e.target.value)}
              placeholder="Ex: Golden Retriever, Siamês, SRD..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700">Nascimento:</label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">Peso (kg):</label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                placeholder="Ex: 12.5"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 mt-1"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700">Observações Clínicas:</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Alergias, temperamento, restrições..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 mt-1"
            ></textarea>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 text-xs font-medium cursor-pointer hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium text-xs px-5 py-2 rounded-lg cursor-pointer disabled:opacity-60 transition-colors"
            >
              {submitting ? 'Salvando...' : 'Salvar Pet do Tutor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
