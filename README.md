# 🐾 VetCare (VetCare)

![VetCare Banner](./docs/Banner.png)

Sistema de gestão veterinária e agendamento clínico, desenvolvido para facilitar a administração de clínicas, o cadastro de tutores e pets e o gerenciamento de consultas e procedimentos.

## ✨ Funcionalidades

- 📅 Agendamento e gerenciamento de consultas com detecção informativa de sobreposição de horários e integração com Brasil API (feriados).
- 🐶 Cadastro e gerenciamento completo de tutores e animais com upload de fotos no Supabase Storage (`pet-fotos`).
- 🩺 Catálogo de serviços e procedimentos veterinários com validação estrita de payload.
- 👤 Gestão completa de perfil de usuário com atualização, troca de senha e exclusão segura da conta.
- 📋 Auditoria operacional e exportação de registros em XML.

## 🏗️ Arquitetura

O projeto utiliza uma arquitetura **Monorepo**, organizada em aplicações e pacotes compartilhados via npm Workspaces:

- **`backend` (`@vetcare/api`)** — Backend MVC em Express 5 e TypeScript, com suporte a PostgreSQL, Supabase e in-memory store.
- **`frontend` (`@vetcare/web`)** — Frontend desenvolvido com Next.js 15, React 18 e Tailwind CSS.
- **`packages/shared` (`@vetcare/shared`)** — Tipagens, entidades, validações e utilitários compartilhados entre frontend e backend.
- **`packages/ui` (`@vetcare/ui`)** — Design tokens, componentes e configurações visuais.

**Tecnologias:** Node.js, TypeScript, Next.js, React, Supabase, PostgreSQL, Tailwind CSS, Turborepo, npm Workspaces e Vitest.

## 🚀 Como executar

### Pré-requisitos

- Node.js >= 18
- npm >= 9

### Instalação

```bash
npm install
```

### Ordem e Comandos de Build dos Pacotes

Para compilar o projeto de forma consistente, a ordem recomendada respeita as dependências internas:

1. **Compilação do pacote compartilhado `@vetcare/shared` (obrigatório antes das aplicações):**
```bash
npm run build --workspace=@vetcare/shared
```
*(Gera os bundles ESM e declarações de tipos TypeScript `.d.ts` em `packages/shared/dist`)*

2. **Compilação do Backend (`@vetcare/api`):**
```bash
npm run build --workspace=@vetcare/api
```

3. **Compilação do Frontend (`@vetcare/web`):**
```bash
npm run build --workspace=@vetcare/web
```

4. **Compilação Geral de Todo o Monorepo:**
```bash
npm run build
```

### Desenvolvimento

```bash
npm run dev
```

Após iniciar:

- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:4000
- **Healthcheck:** http://localhost:4000/api/health

## 🧪 Testes e validação

```bash
npm test
npm run typecheck
npm run build
```

## 📚 Documentação

Consulte a documentação técnica para conhecer a arquitetura, os diagramas e as decisões de engenharia do projeto:

[📖 Documentação de Arquitetura](./docs/ARCHITECTURE.md)
