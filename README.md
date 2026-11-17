# 🐾 VetCare (MedPet)

![VetCare Banner](./docs/Banner.png)

Sistema de gestão veterinária e agendamento clínico, desenvolvido para facilitar a administração de clínicas, o cadastro de tutores e pets e o gerenciamento de consultas e procedimentos.

## ✨ Funcionalidades

- 📅 Agendamento e gerenciamento de consultas.
- 🐶 Cadastro e gerenciamento de tutores e animais.
- 🩺 Catálogo de serviços e procedimentos veterinários.
- 📋 Auditoria operacional e exportação de registros em XML.

## 🏗️ Arquitetura

O projeto utiliza uma arquitetura **Monorepo**, organizada em aplicações e pacotes compartilhados.

- **`apps/api`** — Backend MVC, responsável pelas regras de negócio, endpoints REST e integrações.
- **`apps/web`** — Frontend desenvolvido com Next.js 15, React e Tailwind CSS.
- **`packages/shared`** — Tipagens, entidades, validações e utilitários compartilhados.
- **`packages/ui`** — Design tokens, componentes e configurações visuais.

**Tecnologias:** Node.js, TypeScript, Next.js, React, Tailwind CSS, Turborepo, npm Workspaces e Vitest.

## 🚀 Como executar

### Pré-requisitos

- Node.js >= 18
- npm >= 9

### Instalação

\```bash
npm install
\```

### Desenvolvimento

\```bash
npm run dev
\```

Após iniciar:

- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:4000
- **Healthcheck:** http://localhost:4000/api/health

## 🧪 Testes e validação

\```bash
npm test
npm run typecheck
npm run build
\```

## 📚 Documentação

Consulte a documentação técnica para conhecer a arquitetura, os diagramas e as decisões de engenharia do projeto:

[📖 Documentação de Arquitetura](./docs/ARCHITECTURE.md)
