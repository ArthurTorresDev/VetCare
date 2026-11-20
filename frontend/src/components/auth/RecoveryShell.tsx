import type { ReactNode } from 'react';

interface RecoveryShellProps {
  step: 1 | 2 | 3;
  children: ReactNode;
}

export function RecoveryShell({ step, children }: RecoveryShellProps) {
  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-[#f8fafc] font-sans text-[#121b2f] antialiased">
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-emerald-100/50 blur-3xl" />
        <div className="absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-sky-100/50 blur-3xl" />
      </div>

      <header className="relative z-10 flex items-center border-b border-slate-200/70 bg-white/70 px-6 py-3.5 backdrop-blur-xl sm:px-10">
        <a
          href="/login"
          className="flex items-center gap-2.5"
          aria-label="VetCare - voltar ao login"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#0a5f7a] to-[#00ba7c] text-white shadow-sm">
            <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
              pets
            </span>
          </span>
          <span className="text-[17px] font-bold tracking-tight text-slate-900">
            Med<span className="text-[#00ba7c]">Pet</span>
          </span>
        </a>
      </header>

      <div className="relative z-10 flex flex-1 items-center justify-center p-4 sm:p-8">
        <section className="w-full max-w-[460px] rounded-3xl border border-slate-200/80 bg-white/95 p-7 shadow-[0_20px_50px_rgba(18,27,47,0.06),0_1px_3px_rgba(0,0,0,0.03)] backdrop-blur-xl sm:p-10">
          <div className="mb-6 flex items-center gap-2" aria-label={`Etapa ${step} de 3`}>
            {[1, 2, 3].map((item) => (
              <span
                key={item}
                className={`h-1.5 flex-1 rounded-full ${
                  item <= step ? 'bg-[#00ba7c]' : 'bg-slate-200'
                }`}
              />
            ))}
            <span className="ml-1 shrink-0 text-[11px] font-semibold text-slate-500">
              {step} de 3
            </span>
          </div>

          <div className="mb-5 rounded-xl border border-sky-200 bg-sky-50 px-3.5 py-3 text-xs leading-relaxed text-sky-900">
            Protótipo visual: esta sequência não envia e-mail, não valida códigos e não altera
            senhas.
          </div>

          {children}
        </section>
      </div>

      <footer className="relative z-10 border-t border-slate-200/70 bg-white/60 px-6 py-4 text-center text-xs text-slate-500 backdrop-blur-md">
        VetCare · Gestão Veterinária
      </footer>
    </main>
  );
}
