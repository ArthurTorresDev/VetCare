'use client';

import React, { useState } from 'react';
import { ClinicService, ServiceCategory } from '@vetcare/shared';

interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (serviceData: Partial<ClinicService>) => Promise<any>;
}

export const ServiceModal: React.FC<ServiceModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ServiceCategory>('CONSULTA');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [price, setPrice] = useState(150);
  const [description, setDescription] = useState('');
  const [requiredProfessional, setRequiredProfessional] = useState('');
  const [requiredResource, setRequiredResource] = useState('');
  const [instructions, setInstructions] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await onSave({
        name,
        category,
        durationMinutes: Number(durationMinutes),
        price: Number(price),
        description,
        requiredProfessional,
        requiredResource,
        instructions,
        isActive: true,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erro ao cadastrar serviço');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn"
    >
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Novo Serviço Clínico</h3>
            <p className="text-xs text-slate-400">
              Gerencie catálogo, duração padrão e recursos da VetCare
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center cursor-pointer transition-colors"
          >
            <i className="ph ph-x text-base"></i>
          </button>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-lg mb-3 flex items-center gap-1.5">
            <i className="ph ph-warning-circle text-base text-rose-500 shrink-0"></i>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-slate-700">Nome do Serviço:</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Consulta Oftalmológica, Limpeza de Tártaro..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 mt-1"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700">Categoria:</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ServiceCategory)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 mt-1"
              >
                <option value="CONSULTA">Consulta</option>
                <option value="VACINA">Vacinação</option>
                <option value="CIRURGIA">Cirurgia</option>
                <option value="CHECKUP">Checkup</option>
                <option value="RETORNO">Retorno</option>
                <option value="EMERGENCIA">Emergência</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Duração (min):</label>
              <input
                type="number"
                step="5"
                min="5"
                required
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 mt-1"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Valor (R$):</label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 mt-1"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700">
              Profissional Necessário:
            </label>
            <input
              type="text"
              value={requiredProfessional}
              onChange={(e) => setRequiredProfessional(e.target.value)}
              placeholder="Ex: Clínico Geral, Cirurgião, Anestesista..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 mt-1"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700">
              Recurso / Sala Necessária:
            </label>
            <input
              type="text"
              value={requiredResource}
              onChange={(e) => setRequiredResource(e.target.value)}
              placeholder="Ex: Consultório 1, Centro Cirúrgico, Sala de Exames..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 mt-1"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700">Descrição:</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explicação do atendimento..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 mt-1"
            ></textarea>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700">
              Instruções para o Tutor / Atendimento:
            </label>
            <textarea
              rows={2}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Orientações prévias, jejum necessário, documentos..."
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
              {submitting ? 'Salvando...' : 'Adicionar ao Catálogo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
