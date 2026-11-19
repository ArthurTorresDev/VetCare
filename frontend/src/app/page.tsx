
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/index';
import VetCareDashboard from '../components/VetCareDashboard';
import { VetCareLogo } from '../components/ui/VetCareLogo';

export default function Page() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !user)) {
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading, user, router]);

  const redirecting = !isLoading && (!isAuthenticated || !user);

  if (isLoading || redirecting) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-[#F7FAF8] flex items-center justify-center px-5 py-10">

        {/* Background decorativo */}
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-emerald-100/40 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-[450px] h-[450px] rounded-full bg-green-100/40 blur-3xl pointer-events-none" />

        {/* Conteúdo */}
        <div className="relative z-10 w-full max-w-[430px]">

          {/* Marca */}
          <div className="mb-12 flex justify-center">
            <VetCareLogo size="medium" subtitle="Gestão Veterinária" />
          </div>

          {/* Card principal */}
          <div className="bg-white rounded-[28px] border border-[#E9F0EB] shadow-[0_20px_60px_-25px_rgba(21,150,91,0.15)] px-7 py-10 sm:px-10">

            {/* Loading visual */}
            <div className="flex justify-center mb-8">

              <div className="relative w-[104px] h-[104px]">

                {/* Anel externo */}
                <div className="absolute inset-0 rounded-full border-[3px] border-[#E7F3EB]" />

                {/* Anel animado */}
                <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-[#15965B] border-r-[#15965B] animate-spin" />

                {/* Ícone central */}
                <div className="absolute inset-[10px] rounded-full bg-[#EFF8F2] flex items-center justify-center">

                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#15965B"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-10 h-10"
                  >
                    <path d="M12 20.5c-3.7-2.2-7-5.1-7-9.1a4.3 4.3 0 0 1 7-3.3 4.3 4.3 0 0 1 7 3.3c0 4-3.3 6.9-7 9.1Z" />
                    <path d="M9 12h6M12 9v6" />
                  </svg>

                </div>

                {/* Indicador */}
                <span className="absolute top-1 right-1 w-3 h-3 bg-[#15965B] rounded-full border-[3px] border-white" />

              </div>
            </div>

            {/* Textos */}
            <div className="text-center mb-9">

              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#EFF8F2] rounded-full mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-[#15965B] animate-pulse" />
                <span className="text-[10px] font-bold tracking-[1.5px] text-[#15804F]">
                  {redirecting ? 'REDIRECIONANDO' : 'PREPARANDO AMBIENTE'}
                </span>
              </div>

              <p className="text-[13px] sm:text-sm leading-6 text-[#84938A] max-w-[290px] mx-auto">
                {redirecting
                  ? 'Estamos levando você para a página de acesso. Aguarde só um instante.'
                  : 'Estamos preparando seu ambiente de trabalho para oferecer uma experiência completa.'}
              </p>

            </div>

            {/* Status */}
            <div className="bg-[#F8FBF9] border border-[#EDF3EF] rounded-2xl p-4">

              <div className="flex items-center gap-3">

                <div className="w-10 h-10 rounded-xl bg-[#E6F5EB] flex items-center justify-center shrink-0">
                  <svg
                    className="w-5 h-5 text-[#15965B]"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold text-[#355D46]">
                    {redirecting
                      ? 'Encaminhando para login'
                      : 'Verificando sua autenticação'}
                  </p>
                  <p className="text-[11px] text-[#9AA99F] mt-1">
                    {redirecting
                      ? 'Aguarde o redirecionamento'
                      : 'Validando suas credenciais de acesso'}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="w-1.5 h-1.5 bg-[#15965B] rounded-full animate-pulse" />
                  <span className="text-[10px] font-semibold text-[#15965B]">
                    {redirecting ? 'Aguarde' : 'Ativo'}
                  </span>
                </div>

              </div>

              {/* Barra de progresso */}
              {!redirecting && (
                <div className="mt-5">
                  <div className="h-[4px] rounded-full bg-[#E6F0E9] overflow-hidden">
                    <div className="h-full w-[40%] bg-[#15965B] rounded-full animate-loading-bar" />
                  </div>
                </div>
              )}

            </div>

            {/* Rodapé do card */}
            <div className="flex items-center justify-center gap-2 mt-7">
              <svg
                className="w-3.5 h-3.5 text-[#A2B3A8]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" />
              </svg>
              <span className="text-[10px] text-[#A2B3A8] font-medium">
                Acesso seguro · Ambiente protegido
              </span>
            </div>

          </div>

          {/* Rodapé externo */}
          <p className="text-center text-[11px] text-[#A2B3A8] mt-8">
            © {new Date().getFullYear()} VetCare. Todos os direitos reservados.
          </p>

        </div>
      </main>
    );
  }

  return <VetCareDashboard />;
}
