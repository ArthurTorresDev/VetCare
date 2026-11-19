'use client';

import { ClipboardEvent, FormEvent, KeyboardEvent, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { RecoveryShell } from '../../../../components/auth/RecoveryShell';

const RECOVERY_EMAIL_KEY = 'vetcare.recovery.email';

function maskEmail(email: string): string {
  const [name, domain] = email.split('@');
  if (!name || !domain) return email;
  return `${name.slice(0, 2)}${'•'.repeat(Math.max(3, name.length - 2))}@${domain}`;
}

export default function VerifyRecoveryCodePage() {
  const router = useRouter();
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const [email, setEmail] = useState('');
  const [digits, setDigits] = useState<string[]>(Array(6).fill(''));
  const [notice, setNotice] = useState('');

  useEffect(() => {
    const storedEmail = sessionStorage.getItem(RECOVERY_EMAIL_KEY);
    if (!storedEmail) {
      router.replace('/login/recuperar');
      return;
    }
    setEmail(storedEmail);
  }, [router]);

  const setDigit = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    setDigits((current) => current.map((item, i) => (i === index ? digit : item)));
    if (digit && index < inputRefs.current.length - 1) inputRefs.current[index + 1]?.focus();
    setNotice('');
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pastedDigits = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pastedDigits) return;
    const next = Array(6).fill('');
    [...pastedDigits].forEach((digit, index) => {
      next[index] = digit;
    });
    setDigits(next);
    inputRefs.current[Math.min(pastedDigits.length, 5)]?.focus();
    setNotice('');
  };

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (event.key === 'ArrowLeft' && index > 0) inputRefs.current[index - 1]?.focus();
    if (event.key === 'ArrowRight' && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (digits.some((digit) => !digit)) {
      setNotice('Preencha os seis campos do código para visualizar a próxima etapa.');
      return;
    }
    router.push('/login/recuperar/nova-senha');
  };

  return (
    <RecoveryShell step={2}>
      <div className="mb-6 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-[#00875a]">
          <span className="material-symbols-outlined text-[27px]" aria-hidden="true">
            pin
          </span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Código de verificação</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          Digite o código de seis dígitos para visualizar a próxima etapa.
        </p>
        {email && (
          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3.5 py-1.5 text-sm font-semibold text-slate-700">
            <span
              className="material-symbols-outlined text-[17px] text-[#00875a]"
              aria-hidden="true"
            >
              mail
            </span>
            <span>{maskEmail(email)}</span>
            <Link
              href="/login/recuperar"
              className="text-[#00875a] hover:text-emerald-700"
              aria-label="Alterar e-mail"
              title="Alterar e-mail"
            >
              <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
                edit
              </span>
            </Link>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <fieldset>
          <legend className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Código temporário
          </legend>
          <div className="grid grid-cols-6 gap-2 sm:gap-2.5">
            {digits.map((digit, index) => (
              <input
                key={index}
                ref={(element) => {
                  inputRefs.current[index] = element;
                }}
                aria-label={`Dígito ${index + 1} do código`}
                autoComplete={index === 0 ? 'one-time-code' : 'off'}
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                onChange={(event) => setDigit(index, event.target.value)}
                onKeyDown={(event) => handleKeyDown(index, event)}
                onPaste={handlePaste}
                className="h-14 min-w-0 rounded-2xl border border-slate-200 bg-slate-50 text-center text-xl font-bold text-slate-900 shadow-sm outline-none transition-all focus:border-[#00ba7c] focus:bg-white focus:ring-2 focus:ring-[#00ba7c]/40 sm:h-16 sm:text-2xl"
              />
            ))}
          </div>
        </fieldset>

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
          <span>Continuar para a próxima etapa</span>
          <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
            arrow_forward
          </span>
        </button>
      </form>

      <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-center">
        <p className="mb-2 text-xs text-slate-500">Não recebeu o código?</p>
        <button
          type="button"
          onClick={() => setNotice('O envio e o reenvio de códigos ainda não estão conectados.')}
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-slate-500 hover:bg-white hover:text-slate-700"
        >
          <span className="material-symbols-outlined text-[15px]" aria-hidden="true">
            refresh
          </span>
          Reenviar código
        </button>
      </div>

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
