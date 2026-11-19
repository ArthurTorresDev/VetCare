'use client';

import { FormEvent, useMemo, useState } from 'react';
import Link from 'next/link';
import { RecoveryShell } from '../../../../components/auth/RecoveryShell';
import { validatePasswordRequirements } from '@vetcare/shared';

export default function NewPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [notice, setNotice] = useState('');

  const requirements = useMemo(() => validatePasswordRequirements(password), [password]);
  const passwordsMatch = confirmation.length > 0 && password === confirmation;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!requirements.isValid) {
      setNotice('A senha ainda não atende a todos os critérios exibidos.');
      return;
    }
    if (!passwordsMatch) {
      setNotice('A confirmação precisa ser igual à nova senha.');
      return;
    }
    setNotice('A senha não foi alterada: esta etapa ainda não está conectada à API.');
  };

  const criteria = [
    { label: 'Mínimo de 8 caracteres', valid: password.length >= 8 },
    {
      label: 'Uma letra maiúscula e uma minúscula',
      valid: /[A-Z]/.test(password) && /[a-z]/.test(password),
    },
    { label: 'Pelo menos um número', valid: /\d/.test(password) },
    {
      label: 'Pelo menos um caractere especial',
      valid: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/.test(password),
    },
  ];

  return (
    <RecoveryShell step={3}>
      <div className="mb-6">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-teal-100 bg-teal-50 text-teal-700">
          <span className="material-symbols-outlined text-[25px]" aria-hidden="true">
            lock_reset
          </span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Criar nova senha</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          Escolha uma senha e confirme para visualizar esta etapa.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="new-password"
            className="mb-1.5 block text-xs font-semibold text-slate-700"
          >
            Nova senha <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              id="new-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setNotice('');
              }}
              placeholder="Digite a nova senha"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3 pr-12 text-sm text-slate-800 shadow-sm transition-all placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-teal-500/10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-700"
            >
              <span className="material-symbols-outlined text-[19px]" aria-hidden="true">
                {showPassword ? 'visibility_off' : 'visibility'}
              </span>
            </button>
          </div>
        </div>

        <div className="space-y-2 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3.5">
          <div className="flex items-center justify-between border-b border-slate-200/60 pb-1.5">
            <span className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-500">
              Critérios da senha
            </span>
            <span className="text-[11px] font-medium text-slate-500">
              {requirements.isValid ? 'Todos atendidos' : 'Em preenchimento'}
            </span>
          </div>
          <ul className="space-y-2">
            {criteria.map(({ label, valid }) => (
              <li
                key={label}
                className={`flex items-center gap-2.5 text-xs ${
                  valid ? 'text-emerald-700' : 'text-slate-500'
                }`}
              >
                <span
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                    valid ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300'
                  }`}
                >
                  {valid && (
                    <span className="material-symbols-outlined text-[12px]" aria-hidden="true">
                      check
                    </span>
                  )}
                </span>
                {label}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <label
            htmlFor="confirm-password"
            className="mb-1.5 block text-xs font-semibold text-slate-700"
          >
            Confirmar nova senha <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              id="confirm-password"
              type={showConfirmation ? 'text' : 'password'}
              autoComplete="new-password"
              required
              value={confirmation}
              onChange={(event) => {
                setConfirmation(event.target.value);
                setNotice('');
              }}
              placeholder="Digite novamente a nova senha"
              aria-invalid={confirmation.length > 0 && !passwordsMatch}
              className={`w-full rounded-xl border bg-slate-50/60 px-4 py-3 pr-12 text-sm text-slate-800 shadow-sm transition-all placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-4 ${
                confirmation.length === 0
                  ? 'border-slate-200 focus:border-teal-500 focus:ring-teal-500/10'
                  : passwordsMatch
                    ? 'border-emerald-500 focus:border-emerald-500 focus:ring-emerald-500/10'
                    : 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/10'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmation((visible) => !visible)}
              aria-label={showConfirmation ? 'Ocultar confirmação' : 'Mostrar confirmação'}
              className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-700"
            >
              <span className="material-symbols-outlined text-[19px]" aria-hidden="true">
                {showConfirmation ? 'visibility_off' : 'visibility'}
              </span>
            </button>
          </div>
          {confirmation && (
            <p
              className={`mt-1.5 text-xs ${passwordsMatch ? 'text-emerald-700' : 'text-rose-600'}`}
            >
              {passwordsMatch ? 'As senhas coincidem.' : 'As senhas não coincidem.'}
            </p>
          )}
        </div>

        {notice && (
          <p
            role="alert"
            className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900"
          >
            {notice}
          </p>
        )}

        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0a2540] px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-slate-900 active:scale-[0.985] focus:outline-none focus:ring-4 focus:ring-slate-900/15"
        >
          <span>Redefinir senha</span>
          <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
            arrow_forward
          </span>
        </button>

        <div className="pt-1 text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
          >
            <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
              arrow_back
            </span>
            Voltar ao login
          </Link>
        </div>
      </form>
    </RecoveryShell>
  );
}
