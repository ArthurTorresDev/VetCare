# VetCare (MedPet) — Sistema de Gestão Veterinária & Agendamento Clínico

Plataforma integrada de gestão clínica, agendamento de consultas com integração Google Calendar, cadastro exclusivo de tutores e animais, catálogo de procedimentos veterinários, auditoria operacional e exportação de registros em XML.

---

## Documentacao Tecnica de Arquitetura

A especificação arquitetural completa, diagramas e detalhes de engenharia de software estão disponíveis em:
- **[docs/ARCHITECTURE.md](file:///c:/Users/arthu/OneDrive/Desktop/Arthur%20Steiner/Projetos/Pessoais/VetCare/docs/ARCHITECTURE.md)**

---

## Topologia e Padrao MVC

O projeto é estruturado em um monorepo gerenciado por **Turborepo** e **npm workspaces**:

- **`apps/api` (Backend MVC):**
  - **Routes:** Definição de endpoints HTTP RESTful expressos (`/api/appointments`, `/api/clients`, `/api/pets`, etc.).
  - **Controllers:** Orquestração de requisições e respostas HTTP.
  - **Domain Services & Repositories:** Regras de sobreposição de horário, ciclo de vida de status, integridade referencial tutor-pet e persistência.
  - **Integrações:** Google Calendar API (com fallback automático para simulador/mock) e motor de e-mails.

- **`apps/web` (Frontend MVC):**
  - **Views:** Componentes puros em React/Next.js 15 com Tailwind CSS (Sidebar, Header, CalendarGrid, Cards, Modais).
  - **Controllers:** Hooks desacoplados (`useAppointments`, `useCalendarView`, `useScheduleForm`, `useClients`).
  - **Models / Services:** Abstração de chamadas à API e tipos de domínio.

- **`packages/shared`:**
  - Entidades de domínio, funções puras de formatação brasileira (`DD/MM/AAAA`, `HH:mm`), cálculo dinâmico de datas (`getDateRange`), validação de colisão de horários e gerador de XML.

- **`packages/ui`:**
  - Design tokens, paleta de cores para especialidades clínicas (`CIRURGIA`, `VACINA`, `EMERGENCIA`, `CONSULTA`) e constantes clínicas (`CLINIC_HOURS`).

---

## Como Executar

### 1. Pré-requisitos
- Node.js >= 18.0.0
- npm >= 9.0.0

### 2. Instalação
```bash
npm install
```

### 3. Executando o Projeto Concorrentemente (Dev)
```bash
npm run dev
```
- **Web Dashboard:** [http://localhost:3000](http://localhost:3000)
- **API Backend:** [http://localhost:4000](http://localhost:4000)
- **Healthcheck:** [http://localhost:4000/api/health](http://localhost:4000/api/health)

### 4. Testes e Validação
```bash
npm test         # Executa a suíte de testes com Vitest
npm run typecheck # Validação estática de tipos TypeScript
npm run build     # Compilação e build de produção para Next.js e API
```

