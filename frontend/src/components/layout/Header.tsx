
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PeriodFilter } from '@vetcare/shared';
import {
  TabType,
  DisplayMode,
} from '../../types/index';
import { getExportXmlUrl } from '../../services/appointment.service';
import {
  ProfileModal,
  ProfileDetails,
} from '../modals/ProfileModal';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { useAuth } from '../../context/index';
import { updateCurrentUser } from '../../services/auth.service';
import { UserPreferencesRepository } from '../../repositories/index';

interface HeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  periodFilter: PeriodFilter;
  onPeriodChange: (period: PeriodFilter) => void;
  displayMode: DisplayMode;
  setDisplayMode: (mode: DisplayMode) => void;
  onOpenNewAppointmentModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  periodFilter,
  onPeriodChange,
  displayMode,
  setDisplayMode,
  onOpenNewAppointmentModal,
}) => {
  const router = useRouter();
  const { user, logout, refreshUser } = useAuth();

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'ADMIN':
        return 'Administrador';
      case 'VET':
        return 'Médico Veterinário';
      case 'RECEPTIONIST':
        return 'Atendente';
      case 'CLIENT':
        return 'Cliente';
      default:
        return 'Atendente';
    }
  };

  const [profile, setProfile] = useState<ProfileDetails>({
    name: user?.name || '',
    role: getRoleLabel(user?.role),
    email: user?.email || '',
    phone: user?.phone || '',
  });

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name,
        role: getRoleLabel(user.role),
        email: user.email,
        phone: user.phone || '',
      });
    }
  }, [user]);

  useEffect(() => {
    const currentTheme = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
    setTheme(currentTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    document.documentElement.classList.add('theme-changing');
    document.documentElement.dataset.theme = nextTheme;
    UserPreferencesRepository.setTheme(nextTheme);
    setTheme(nextTheme);
    window.setTimeout(() => {
      document.documentElement.classList.remove('theme-changing');
    }, 250);
  };

  return (
    <>
      <header className="bg-white border-b border-slate-200 px-8 py-5 sticky top-0 z-40 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4 flex-1">
          {/* Campo de Busca Global */}
          <div className="relative w-full max-w-md">
            <i className="ph ph-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg"></i>

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por tutor, animal, procedimento ou veterinário..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-sm"
            />
          </div>

          {/* Filtro de Período da Agenda */}
          {activeTab === 'DASHBOARD' && (
            <select
              value={periodFilter}
              onChange={(e) =>
                onPeriodChange(e.target.value as PeriodFilter)
              }
              className="bg-white border border-slate-200 text-slate-600 text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer font-medium"
            >
              <option value="HOJE">Hoje</option>
              <option value="SEMANA">Esta Semana</option>
              <option value="MES">Este Mês</option>
            </select>
          )}

          {/* Alternância Cards vs Grade */}
          {activeTab === 'DASHBOARD' && (
            <div className="flex bg-slate-100 p-1 rounded-lg gap-1 border border-slate-200">
              <button
                onClick={() => setDisplayMode('CARDS')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${displayMode === 'CARDS'
                  ? 'bg-white text-emerald-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
                  }`}
              >
                <i className="ph ph-squares-four text-base"></i>
                Cards
              </button>

              <button
                onClick={() => setDisplayMode('Calendario_WEEK')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${displayMode === 'Calendario_WEEK'
                  ? 'bg-white text-emerald-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
                  }`}
              >
                <i className="ph ph-Calendario text-base"></i>
                Grade
              </button>
            </div>
          )}

          {/* Novo Agendamento */}
          <button
            onClick={onOpenNewAppointmentModal}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-sm shadow-emerald-500/20 cursor-pointer"
          >
            <i className="ph ph-plus-circle text-lg"></i>
            Novo Agendamento
          </button>
        </div>

        {/* Perfil & Menu Rápido */}
        <div className="ml-8 flex items-center gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === 'light' ? 'Ativar modo escuro' : 'Ativar modo claro'}
            aria-pressed={theme === 'dark'}
            title={theme === 'light' ? 'Ativar modo escuro' : 'Ativar modo claro'}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-transparent text-slate-500 transition-all hover:border-slate-200 hover:bg-slate-50 hover:text-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 cursor-pointer"
          >
            <i className={`ph ${theme === 'light' ? 'ph-sun' : 'ph-moon'} text-xl`} aria-hidden="true"></i>
          </button>

          <div className="relative">
            <button
              onClick={() => setIsProfileMenuOpen((v) => !v)}
              aria-label="Abrir menu do perfil"
              aria-haspopup="true"
              aria-expanded={isProfileMenuOpen}
              aria-controls="profile-menu"
              className="flex items-center gap-3 hover:bg-slate-50 p-1.5 rounded-full pr-4 border border-transparent hover:border-slate-200 transition-all cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center border-2 border-emerald-500 uppercase text-sm">
                {profile.name ? profile.name.slice(0, 2) : <i className="ph ph-user text-base"></i>}
              </div>

              <div className="text-left hidden md:block">
                <p className="text-sm font-semibold text-slate-700 leading-tight">
                  {profile.name || 'Carregando...'}
                </p>
                <p className="text-xs text-slate-500">
                  {profile.role}
                </p>
              </div>

              <i className="ph ph-caret-down text-slate-400"></i>
            </button>

            {isProfileMenuOpen && (
              <div
                id="profile-menu"
                className="absolute right-0 mt-2 w-64 bg-white border border-slate-100 rounded-xl shadow-xl py-2 z-50"
              >
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-sm font-semibold text-slate-800 leading-tight">
                    {profile.name}
                  </p>
                  <p className="text-xs text-slate-500 truncate mt-0.5">
                    {profile.email}
                  </p>
                  <span className="inline-block mt-1.5 px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[11px] font-medium border border-emerald-200">
                    {profile.role}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    setIsProfileModalOpen(true);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-emerald-600"
                >
                  Visualizar/editar perfil
                </button>

                <button
                  onClick={() => {
                    setActiveTab('HISTORICO');
                    setIsProfileMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-emerald-600"
                >
                  Auditoria de Atividades
                </button>

                <button
                  onClick={() => {
                    window.open(getExportXmlUrl(), '_blank');
                    setIsProfileMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-emerald-600"
                >
                  Exportar Relatório XML
                </button>

                <div className="mt-1 border-t border-slate-100 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      setIsLogoutDialogOpen(true);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50"
                  >
                    <i className="ph ph-sign-out mr-2"></i>
                    Sair
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Modal de Perfil */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        profile={profile}
        onClose={() => setIsProfileModalOpen(false)}
        onSave={async (updatedProfile) => {
          try {
            await updateCurrentUser({
              name: updatedProfile.name,
              email: updatedProfile.email,
              phone: updatedProfile.phone,
            });
            await refreshUser();
          } catch (err) {
            console.warn('[Header Profile Update]', err);
          }
          setProfile(updatedProfile);
          setIsProfileModalOpen(false);
        }}
      />

      {/* Confirmação de Logout */}
      <ConfirmDialog
        isOpen={isLogoutDialogOpen}
        title="Sair do sistema?"
        message="Tem certeza de que deseja sair e voltar para a página de login?"
        confirmLabel="Sair"
        cancelLabel="Continuar no sistema"
        isDestructive
        onCancel={() => setIsLogoutDialogOpen(false)}
        onConfirm={async () => {
          setIsLogoutDialogOpen(false);
          await logout();
          router.push('/login');
        }}
      />
    </>
  );
};
