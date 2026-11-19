'use client';

import React, { useEffect, useState } from 'react';

export interface ProfileDetails {
  name: string;
  role: string;
  email: string;
  phone: string;
}

interface ProfileModalProps {
  isOpen: boolean;
  profile: ProfileDetails;
  onClose: () => void;
  onSave: (profile: ProfileDetails) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, profile, onClose, onSave }) => {
  const [form, setForm] = useState(profile);

  useEffect(() => {
    if (isOpen) setForm(profile);
  }, [isOpen, profile]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-modal-title"
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
    >
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
        <div className="flex justify-between items-center mb-4">
          <h2 id="profile-modal-title" className="text-lg font-bold text-slate-800">
            Meu perfil
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar perfil"
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center cursor-pointer transition-colors"
          >
            <i className="ph ph-x text-base"></i>
          </button>
        </div>

        <p className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg p-3 mb-4">
          Suas alterações são salvas diretamente no perfil do usuário no servidor.
        </p>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            onSave(form);
          }}
          className="space-y-3"
        >
          <div>
            <label htmlFor="profile-name" className="text-xs font-semibold text-slate-700">
              Nome
            </label>
            <input
              id="profile-name"
              type="text"
              required
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 mt-1"
            />
          </div>

          <div>
            <label htmlFor="profile-email" className="text-xs font-semibold text-slate-700">
              E-mail
            </label>
            <input
              id="profile-email"
              type="email"
              required
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 mt-1"
            />
          </div>

          <div>
            <label htmlFor="profile-phone" className="text-xs font-semibold text-slate-700">
              Telefone
            </label>
            <input
              id="profile-phone"
              type="tel"
              value={form.phone}
              onChange={(event) => setForm({ ...form, phone: event.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 mt-1"
            />
          </div>

          <div>
            <label htmlFor="profile-role" className="text-xs font-semibold text-slate-700">
              Cargo
            </label>
            <input
              id="profile-role"
              type="text"
              readOnly
              value={form.role}
              className="w-full bg-slate-100 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-500 mt-1 cursor-not-allowed"
            />
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
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium text-xs px-5 py-2 rounded-lg cursor-pointer transition-colors"
            >
              Salvar nesta página
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
