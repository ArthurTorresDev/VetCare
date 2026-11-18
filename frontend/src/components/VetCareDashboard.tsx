'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  AuditLogEntry,
  EmailNotification,
} from '@vetcare/shared';
import { TabType, GoogleStatusResponse } from '../types/index';
import { TAB_LABELS, TAB_SUBTITLES } from '../config/constants';
import { loadInitialAppData } from '../services/api.service';

// Hooks (Controllers)
import { useAppointments } from '../hooks/useAppointments';
import { useClients } from '../hooks/useClients';
import { useServiceCatalog } from '../hooks/useServiceCatalog';
import { useCalendarView } from '../hooks/useCalendarView';
import { useScheduleForm } from '../hooks/useScheduleForm';
import { useTutorForm } from '../hooks/useTutorForm';
import { usePetForm } from '../hooks/usePetForm';

// Layout & View Components
import { Sidebar } from './layout/Sidebar';
import { Header } from './layout/Header';
import { DashboardTab } from './tabs/DashboardTab';
import { ClientsTab } from './tabs/ClientsTab';
import { ServicesTab } from './tabs/ServicesTab';
import { CompletedTab } from './tabs/CompletedTab';
import { CancelledTab } from './tabs/CancelledTab';
import { ReportsTab } from './tabs/ReportsTab';
import { AuditTab } from './tabs/AuditTab';
import { NotificationsTab } from './tabs/NotificationsTab';

// Modals
import { AppointmentDetailModal } from './modals/AppointmentDetailModal';
import { NewAppointmentModal } from './modals/NewAppointmentModal';
import { NewTutorModal } from './modals/NewTutorModal';
import { NewPetModal } from './modals/NewPetModal';
import { ServiceModal } from './modals/ServiceModal';

export default function VetCareDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('DASHBOARD');
  const [searchQuery, setSearchQuery] = useState('');
  const [googleStatus, setGoogleStatus] = useState<GoogleStatusResponse | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [notifications, setNotifications] = useState<EmailNotification[]>([]);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Hook: Agendamentos
  const {
    appointments,
    setAppointments,
    selectedAppointment,
    setSelectedAppointment,
    changeStatus,
    cancel,
    getFilteredAppointments,
  } = useAppointments();

  // Hook: Clientes e Pets
  const { clients, setClients, addClient, addPet } = useClients();

  // Hook: Catálogo de Serviços (Req 3.3)
  const {
    services,
    setServices,
    addService,
    toggleServiceActive,
  } = useServiceCatalog();

  // Hook: Calendário / Grade / Filtros de período
  const {
    periodFilter,
    handlePeriodChange,
    displayMode,
    setDisplayMode,
    gridDays,
    appointmentsByDateHour,
  } = useCalendarView(appointments);

  // Carregamento inicial em lote
  const loadData = useCallback(async () => {
    try {
      const data = await loadInitialAppData();
      setAppointments(data.appointments);
      setClients(data.clients);
      setServices(data.services);
      setAuditLogs(data.auditLogs);
      setNotifications(data.notifications);
      setGoogleStatus(data.googleStatus);
    } catch (err) {
      console.error('[VetCare Init Error]', err);
    } finally {
      setInitialLoading(false);
    }
  }, [setAppointments, setClients, setServices]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Hook: Formulário de Agendamento
  const scheduleForm = useScheduleForm(clients, services, async (created) => {
    setAppointments((prev) => [created, ...prev]);
    // Recarrega auditoria e notificações
    loadData();
  });

  // Hook: Formulário de Novo Tutor
  const tutorForm = useTutorForm(async (newClient) => {
    scheduleForm.selectTutor(newClient);
    loadData();
  });

  // Hook: Formulário de Novo Pet
  const petForm = usePetForm(async () => {
    loadData();
  });

  // Agendamentos filtrados
  const filteredAppointments = useMemo(
    () => getFilteredAppointments(activeTab, searchQuery),
    [getFilteredAppointments, activeTab, searchQuery],
  );

  return (
    <div className="text-slate-800 antialiased min-h-screen bg-slate-50 flex">
      {/* SIDEBAR */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        googleStatus={googleStatus}
      />

      {/* ÁREA PRINCIPAL */}
      <main className="main-content flex-1 min-h-screen flex flex-col">
        {/* HEADER */}
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          periodFilter={periodFilter}
          onPeriodChange={handlePeriodChange}
          displayMode={displayMode}
          setDisplayMode={setDisplayMode}
          onOpenNewAppointmentModal={() => scheduleForm.openModal()}
          googleStatus={googleStatus}
        />

        {/* CONTEÚDO PRINCIPAL DA ABA */}
        <div className="p-8 flex-1">
          {/* Título & Subtítulo da Seção */}
          <div className="mb-6 flex justify-between items-end">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">{TAB_LABELS[activeTab]}</h1>
              <p className="text-slate-500 text-sm mt-1">{TAB_SUBTITLES[activeTab]}</p>
            </div>
          </div>

          {/* Renderização condicional de Abas */}
          {activeTab === 'DASHBOARD' && (
            <DashboardTab
              loading={initialLoading}
              displayMode={displayMode}
              appointments={filteredAppointments}
              services={services}
              gridDays={gridDays}
              periodFilter={periodFilter}
              appointmentsByDateHour={appointmentsByDateHour}
              onSelectAppointment={(a) => setSelectedAppointment(a)}
              onSelectSlot={(dateIso, hour) => scheduleForm.openModal(dateIso, hour)}
              onOpenNewAppointmentModal={() => scheduleForm.openModal()}
            />
          )}

          {activeTab === 'CLIENTES' && (
            <ClientsTab
              clients={clients}
              onOpenNewTutorModal={tutorForm.openModal}
              onOpenNewPetModal={petForm.openForTutor}
              onScheduleForClient={(client) => {
                scheduleForm.selectTutor(client);
                scheduleForm.openModal();
              }}
            />
          )}

          {activeTab === 'SERVICOS' && (
            <ServicesTab
              services={services}
              onOpenNewServiceModal={() => setIsServiceModalOpen(true)}
              onToggleActive={toggleServiceActive}
            />
          )}

          {activeTab === 'CONSULTAS_REALIZADAS' && (
            <CompletedTab
              appointments={filteredAppointments}
              onSelectAppointment={(a) => setSelectedAppointment(a)}
            />
          )}

          {activeTab === 'CANCELADAS' && (
            <CancelledTab
              appointments={filteredAppointments}
              onSelectAppointment={(a) => setSelectedAppointment(a)}
            />
          )}

          {activeTab === 'RELATORIOS' && <ReportsTab />}

          {activeTab === 'HISTORICO' && <AuditTab logs={auditLogs} />}

        </div>
      </main>

      {/* MODAIS */}
      {/* 1. Detalhes do Agendamento */}
      <AppointmentDetailModal
        appointment={selectedAppointment}
        onClose={() => setSelectedAppointment(null)}
        onUpdateStatus={async (id, status) => {
          await changeStatus(id, status);
          loadData();
        }}
        onCancel={async (id) => {
          await cancel(id);
          loadData();
        }}
      />

      {/* 2. Novo Agendamento */}
      <NewAppointmentModal
        isOpen={scheduleForm.isOpen}
        onClose={scheduleForm.closeModal}
        tutorSearchInput={scheduleForm.tutorSearchInput}
        setTutorSearchInput={scheduleForm.setTutorSearchInput}
        isTutorDropdownOpen={scheduleForm.isTutorDropdownOpen}
        setIsTutorDropdownOpen={scheduleForm.setIsTutorDropdownOpen}
        selectedClient={scheduleForm.selectedClient}
        tutorRecommendations={scheduleForm.tutorRecommendations}
        onSelectTutor={scheduleForm.selectTutor}
        onClearTutor={scheduleForm.clearTutor}
        onOpenNewTutorModal={tutorForm.openModal}
        onOpenNewPetModal={petForm.openForTutor}
        petId={scheduleForm.petId}
        setPetId={scheduleForm.setPetId}
        serviceId={scheduleForm.serviceId}
        onServiceChange={scheduleForm.handleServiceChange}
        services={services}
        vetName={scheduleForm.vetName}
        setVetName={scheduleForm.setVetName}
        date={scheduleForm.date}
        setDate={scheduleForm.setDate}
        time={scheduleForm.time}
        setTime={scheduleForm.setTime}
        duration={scheduleForm.duration}
        setDuration={scheduleForm.setDuration}
        notes={scheduleForm.notes}
        setNotes={scheduleForm.setNotes}
        submitting={scheduleForm.submitting}
        errorMessage={scheduleForm.errorMessage}
        conflictingAppointment={scheduleForm.conflictingAppointment}
        onSubmit={scheduleForm.handleSubmit}
        tutorInputRef={scheduleForm.tutorInputRef}
        dateCheckResult={scheduleForm.dateCheckResult}
        checkingDate={scheduleForm.checkingDate}
        showHolidayConfirmation={scheduleForm.showHolidayConfirmation}
        confirmHolidayAndSave={scheduleForm.confirmHolidayAndSave}
        dismissHolidayPrompt={scheduleForm.dismissHolidayPrompt}
      />

      {/* 3. Novo Tutor */}
      <NewTutorModal
        isOpen={tutorForm.isOpen}
        onClose={tutorForm.closeModal}
        name={tutorForm.name}
        setName={tutorForm.setName}
        phone={tutorForm.phone}
        setPhone={tutorForm.setPhone}
        email={tutorForm.email}
        setEmail={tutorForm.setEmail}
        cpf={tutorForm.cpf}
        setCpf={tutorForm.setCpf}
        submitting={tutorForm.submitting}
        error={tutorForm.error}
        onSubmit={(e) => {
          e.preventDefault();
          tutorForm.submit(addClient);
        }}
      />

      {/* 4. Novo Pet */}
      <NewPetModal
        selectedTutor={petForm.selectedTutor}
        onClose={petForm.close}
        name={petForm.name}
        setName={petForm.setName}
        species={petForm.species}
        setSpecies={petForm.setSpecies}
        breed={petForm.breed}
        setBreed={petForm.setBreed}
        sex={petForm.sex}
        setSex={petForm.setSex}
        birthDate={petForm.birthDate}
        setBirthDate={petForm.setBirthDate}
        weightKg={petForm.weightKg}
        setWeightKg={petForm.setWeightKg}
        notes={petForm.notes}
        setNotes={petForm.setNotes}
        submitting={petForm.submitting}
        error={petForm.error}
        onSubmit={(e) => {
          e.preventDefault();
          petForm.submit(addPet);
        }}
      />

      {/* 5. Novo Serviço (Req 3.3) */}
      <ServiceModal
        isOpen={isServiceModalOpen}
        onClose={() => setIsServiceModalOpen(false)}
        onSave={async (srv) => {
          await addService(srv);
          loadData();
        }}
      />
    </div>
  );
}
