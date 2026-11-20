'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { RecoveryShell } from '../../../components/auth/RecoveryShell';

const RECOVERY_EMAIL_KEY = 'vetcare.recovery.email';

export default function RecoverPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');

  useEffect(() => {
    setEmail(sessionStorage.getItem(RECOVERY_EMAIL_KEY) || '');
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    sessionStorage.setItem(RECOVERY_EMAIL_KEY, email.trim());
    router.push('/login/recuperar/codigo');
  };

  return (
    <RecoveryShell step={1}>
      <div className="mb-6 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-100 bg-emerald-50 text-[#00875a]">
          <span className="material-symbols-outlined text-[27px]" aria-hidden="true">
            lock_reset
          </span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Recuperar acesso</h1>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-slate-500">
          Informe o e-mail associado à sua conta para continuar.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="recovery-email"
            className="mb-1.5 block text-xs font-semibold text-slate-700"
          >
            E-mail cadastrado <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <span
              className="material-symbols-outlined pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[19px] leading-none text-slate-400"
              aria-hidden="true"
            >
              mail
            </span>
            <input
              id="recovery-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="exemplo@vetcare.com.br"
              className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-10 pr-4 text-sm text-slate-800 shadow-sm transition-all placeholder:text-slate-400 focus:border-[#00ba7c] focus:outline-none focus:ring-4 focus:ring-[#00ba7c]/15"
            />
          </div>
        </div>

        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0a2540] px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-slate-900 active:scale-[0.985] focus:outline-none focus:ring-4 focus:ring-slate-900/15"
        >
          <span>Continuar</span>
          <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
            arrow_forward
          </span>
        </button>
      </form>

      <div className="mt-5 text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
        >
          <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
            arrow_back
          </span>
          Voltar ao login
        </Link>
      </div>
    </RecoveryShell>
  );
}
