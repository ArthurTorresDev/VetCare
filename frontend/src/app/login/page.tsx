'use client';

import { FormEvent, useState } from 'react';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [notice, setNotice] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNotice('A autenticação ainda não está conectada ao servidor.');
  };

  return (
    <main
      className="relative z-10 flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#f4f6f9] p-4 font-sans text-[#121b2f] antialiased sm:p-6 lg:p-10"
      style={{
        fontFamily:
          "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -left-[10%] -top-[25%] h-[60vw] w-[60vw] rounded-full bg-gradient-to-br from-[#0a5f7a]/15 via-emerald-100/30 to-transparent blur-3xl" />
        <div className="absolute -right-[15%] top-[10%] h-[55vw] w-[55vw] rounded-full bg-gradient-to-bl from-[#0a5f7a]/10 via-[#121b2f]/5 to-transparent blur-3xl" />
        <div className="absolute -bottom-[20%] left-[20%] h-[50vw] w-[50vw] rounded-full bg-gradient-to-tr from-emerald-50/40 via-teal-50/20 to-transparent blur-3xl" />
      </div>

      <div
        className="relative flex w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-white/80 bg-white/85 shadow-2xl backdrop-blur-2xl transition-all duration-300 lg:flex-row"
        style={{
          boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.05), 0 0 1px 1px rgba(0, 0, 0, 0.04)',
        }}
      >
        <section className="relative flex w-full flex-col justify-between border-b border-slate-200/60 bg-white/80 p-8 backdrop-blur-md sm:p-12 lg:w-1/2 lg:border-b-0 lg:border-r lg:p-12">
          <div>
            <div className="flex items-center justify-between pb-8">
              <div className="flex items-center gap-2" aria-label="Controles da janela">
                <span className="h-3 w-3 rounded-full border border-[#e0443e]/40 bg-[#ff5f57] shadow-sm" />
                <span className="h-3 w-3 rounded-full border border-[#d89e24]/40 bg-[#febc2e] shadow-sm" />
                <span className="h-3 w-3 rounded-full border border-[#1aab29]/40 bg-[#28c840] shadow-sm" />
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/60 bg-slate-100/80 px-2.5 py-1">
                <span className="h-2 w-2 animate-pulse rounded-full bg-[#00ba7c]" />
                <span className="text-xs font-semibold tracking-tight text-slate-700">
                  Sistema Online
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0a5f7a] to-[#00ba7c] text-white shadow-lg">
                <span className="material-symbols-outlined text-[26px]" aria-hidden="true">
                  pets
                </span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-2xl font-bold tracking-tight text-slate-900">
                    Med<span className="text-[#00ba7c]">Pet</span>
                  </span>
                  <span
                    className="material-symbols-outlined text-sm font-bold text-[#0a5f7a]"
                    aria-hidden="true"
                  >
                    add
                  </span>
                </div>
                <p className="-mt-0.5 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                  Gestão Veterinária
                </p>
              </div>
            </div>
          </div>

          <div className="my-auto py-6">
            <header className="mb-6">
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 lg:text-3xl">
                Acesso ao Sistema
              </h1>
              <p className="mt-1.5 text-sm font-normal text-slate-500">
                Acesse o prontuário eletrônico e a rotina clínica
              </p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="login-email"
                  className="mb-1.5 ml-1 block text-xs font-semibold text-slate-600"
                >
                  E-mail profissional <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div
                    className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400"
                    aria-hidden="true"
                  >
                    <span className="material-symbols-outlined text-[19px] leading-none">mail</span>
                  </div>
                  <input
                    id="login-email"
                    name="email"
                    type="email"
                    autoComplete="username"
                    required
                    placeholder="exemplo@medpet.com.br"
                    className="w-full rounded-xl border border-slate-200/80 bg-slate-50/80 py-3 pl-10 pr-4 text-sm text-slate-800 shadow-sm transition-all placeholder:text-slate-400 hover:bg-slate-50 focus:border-[#0a5f7a] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0a5f7a]/15"
                  />
                </div>
              </div>

              <div>
                <div className="mb-1.5 ml-1 flex items-center justify-between">
                  <label
                    htmlFor="login-password"
                    className="block text-xs font-semibold text-slate-600"
                  >
                    Senha de acesso <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setNotice('A recuperação de senha ainda não está disponível.')}
                    className="text-xs font-semibold text-[#0a5f7a] transition-colors hover:text-[#00ba7c]"
                  >
                    Esqueceu sua senha?
                  </button>
                </div>
                <div className="relative">
                  <div
                    className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400"
                    aria-hidden="true"
                  >
                    <span className="material-symbols-outlined text-[19px] leading-none">lock</span>
                  </div>
                  <input
                    id="login-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    placeholder="••••••••••••"
                    className="w-full rounded-xl border border-slate-200/80 bg-slate-50/80 py-3 pl-10 pr-11 text-sm tracking-wider text-slate-800 shadow-sm transition-all placeholder:text-slate-400 hover:bg-slate-50 focus:border-[#0a5f7a] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0a5f7a]/15"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 transition-colors hover:text-slate-600 focus:outline-none"
                  >
                    <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between px-1 pt-1">
                <label className="flex cursor-pointer select-none items-center gap-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 bg-white text-[#0a5f7a] transition-colors focus:ring-[#0a5f7a]/30 focus:ring-offset-0"
                  />
                  <span className="text-xs text-slate-600">Lembrar credencial</span>
                </label>
                <span className="rounded-full border border-slate-200/60 bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-400">
                  Ambiente Seguro
                </span>
              </div>

              {notice && (
                <p
                  role="status"
                  aria-live="polite"
                  className="rounded-lg border border-sky-200 bg-sky-50 p-3 text-xs text-sky-800"
                >
                  {notice}
                </p>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0a5f7a] to-[#00ba7c] px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition-all hover:opacity-95 active:scale-[0.985] focus:outline-none focus:ring-4 focus:ring-[#0a5f7a]/25"
                >
                  <span>Entrar no Sistema</span>
                  <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                    arrow_forward
                  </span>
                </button>
              </div>
            </form>
          </div>

          <footer className="flex items-center justify-between border-t border-slate-200/60 pt-4 text-xs text-slate-400">
            <span>© 2026 MedPet</span>
          </footer>
        </section>

        <section className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-[#0a5f7a] to-[#0c3e51] p-10 text-white xl:p-12 lg:flex">
          <div className="relative z-10 flex items-center justify-between">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 backdrop-blur-md">
              <span
                className="material-symbols-outlined text-[16px] text-[#6bfcb8]"
                aria-hidden="true"
              >
                health_and_safety
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-wide text-white/90">
                Plataforma Integrada
              </span>
            </div>
            <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white/80">
              Gestão Clínica
            </span>
          </div>

          <div className="relative z-10 my-auto max-w-md py-8">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-[#6bfcb8] shadow-inner backdrop-blur-md">
              <span className="material-symbols-outlined text-[24px]" aria-hidden="true">
                verified
              </span>
            </div>
            <h2 className="text-2xl font-bold leading-snug tracking-tight text-white xl:text-3xl">
              Gestão clínica simples, veloz e sem atritos.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-white/80">
              Organize o atendimento veterinário em uma experiência limpa e prática.
            </p>
            <div className="mt-8 space-y-3">
              {[
                'Agenda e histórico do paciente em um só lugar',
                'Rotina integrada para recepção e veterinários',
                'Acompanhamento dos atendimentos da clínica',
              ].map((feature) => (
                <div
                  key={feature}
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-sm"
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#6bfcb8]/20 text-[#6bfcb8]">
                    <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
                      check
                    </span>
                  </div>
                  <span className="text-xs font-medium text-white/90">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 flex items-center justify-between border-t border-white/15 pt-4 text-xs text-white/70">
            <span>MedPet • Gestão Veterinária</span>
            <span className="font-mono text-[11px] tracking-wider">VetCare</span>
          </div>
        </section>
      </div>
    </main>
  );
}
