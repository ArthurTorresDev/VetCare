# Sistema de Autenticação e Gerenciamento de Usuários (CRUD) - VetCare API

## 1. Visão Geral e Arquitetura

O sistema de autenticação e gerenciamento de contas do **VetCare** foi construído seguindo rigorosamente a **Arquitetura MVC (Model-View-Controller)**, os princípios **SOLID** e as melhores práticas de **Engenharia de Software e Segurança da Informação (OWASP / NIST)**.

O sistema foi concebido de forma desacoplada:
- A camada de dados utiliza o padrão **Repository Pattern** com inversão de dependências (`IUserRepository`).
- Está 100% funcional para testes e desenvolvimento através do `InMemoryUserRepository`.
- Está preparado para integração com o banco de dados relacional **PostgreSQL** através do `PostgresUserRepository` e do script DDL completo em `apps/api/src/database/schema.sql`.
- Assegura que nenhum usuário acesse, altere ou exclua contas de terceiros pelos endpoints próprios (`/users/me`).

---

## 2. Estrutura de Diretórios e Separação de Responsabilidades

```
apps/api/
├── src/
│   ├── config/
│   │   ├── auth.config.ts             # Parâmetros JWT, Scrypt, Rate Limit
│   │   └── env.ts                     # Variáveis de ambiente validadas
│   ├── controllers/
│   │   ├── auth.controller.ts         # Handlers HTTP para /auth/*
│   │   └── user.controller.ts         # Handlers HTTP para /users/*
│   ├── database/
│   │   └── schema.sql                 # DDL completo para PostgreSQL (tabelas, índices, triggers)
│   ├── docs/
│   │   └── openapi.ts                 # Especificação OpenAPI 3.0 completa
│   ├── domain/
│   │   ├── models/
│   │   │   └── in-memory.store.ts     # Store central em memória
│   │   ├── repositories/
│   │   │   ├── user.repository.interface.ts # Contrato IUserRepository (DIP/SOLID)
│   │   │   ├── in-memory-user.repository.ts  # Implementação em memória
│   │   │   └── postgres-user.repository.ts   # Implementação PostgreSQL com queries parametrizadas
│   │   └── services/
│   │       ├── hash.service.ts        # Hashing de senhas Scrypt e proteção contra timing attacks
│   │       ├── token.service.ts       # Assinatura JWT RFC 7519, verificação e Token Blacklist Store
│   │       ├── auth.service.ts        # Regras de negócio de cadastro, login e logout
│   │       └── user.service.ts        # Regras de negócio do perfil, alteração de senha e exclusão
│   ├── middleware/
│   │   ├── auth.middleware.ts         # Validação de Bearer token JWT e injeção de req.user
│   │   ├── cors.middleware.ts         # Configuração de CORS seguro
│   │   ├── error.middleware.ts        # Tratamento centralizado de exceções
│   │   └── rate-limiter.middleware.ts # Proteção contra força bruta e DoS por IP
│   ├── routes/
│   │   ├── auth.routes.ts             # Rotas /auth
│   │   ├── user.routes.ts             # Rotas /users
│   │   ├── docs.routes.ts             # Rota Swagger UI (/docs) e OpenAPI JSON (/docs/openapi.json)
│   │   └── index.ts                   # Roteador central da API
│   └── server.ts                      # Entrada da aplicação Express
packages/shared/
└── src/
    ├── models/
    │   ├── types.ts                   # Entidades User, PublicUser, DTOs e Roles
    │   └── validation.ts              # Regras de negócio e validações RFC 5322 e senhas fortes
tests/
├── unit/
│   └── auth.test.ts                   # 29 testes unitários de criptografia, regras e segurança
└── integration/
    └── auth-http.test.ts              # Testes de integração RESTful do fluxo completo de ponta a ponta
```

---

## 3. Endpoints RESTful

### 3.1. `POST /api/auth/register` (Cadastro de Usuário)
- **Acesso:** Público (com Rate Limiting).
- **Body Esperado:**
  ```json
  {
    "name": "Arthur Steiner",
    "email": "arthur@exemplo.com",
    "password": "SenhaForte#2026",
    "confirmPassword": "SenhaForte#2026",
    "phone": "(11) 98765-4321",
    "role": "CLIENT"
  }
  ```
- **Respostas:**
  - `201 Created`: Retorna perfil público sanitizado (sem hash) e token de autenticação JWT.
  - `400 Bad Request`: Dados inválidos, confirmação de senha não confere ou senha fraca.
  - `409 Conflict`: E-mail já existente no sistema.
  - `429 Too Many Requests`: Limite de tentativas excedido.

### 3.2. `POST /api/auth/login` (Autenticação)
- **Acesso:** Público (com Rate Limiting).
- **Body Esperado:**
  ```json
  {
    "email": "arthur@exemplo.com",
    "password": "SenhaForte#2026"
  }
  ```
- **Respostas:**
  - `200 OK`: Retorna `AuthResponse` com o token JWT e dados do usuário.
  - `401 Unauthorized`: Mensagem genérica `"Credenciais inválidas."` (protegido contra timing attacks e enumeração de usuários).
  - `403 Forbidden`: Conta de usuário desativada.
  - `429 Too Many Requests`: Limite de tentativas excedido.

### 3.3. `POST /api/auth/logout` (Encerramento de Sessão)
- **Acesso:** Protegido (`Authorization: Bearer <token>`).
- **Respostas:**
  - `200 OK`: `{"message": "Sessão encerrada com sucesso."}`. O token é revogado e incluído na blacklist.
  - `401 Unauthorized`: Token ausente ou inválido.

### 3.4. `GET /api/users/me` (Consulta de Conta Própria)
- **Acesso:** Protegido (`Authorization: Bearer <token>`).
- **Respostas:**
  - `200 OK`: Retorna `PublicUser` (`id`, `name`, `email`, `role`, `phone`, `isActive`, `createdAt`, `updatedAt`, `lastLoginAt`).
  - `401 Unauthorized`: Token ausente, expirado ou revogado.

### 3.5. `PATCH /api/users/me` (Atualização de Dados Cadastrais)
- **Acesso:** Protegido (`Authorization: Bearer <token>`).
- **Body Aceito:** `{ "name": "...", "email": "...", "phone": "..." }`
- **Regras:** Bloqueia terminantemente alteração de campos protegidos (`id`, `role`, `password`, `createdAt`). Se o e-mail for alterado, checa duplicidade com outros usuários.
- **Respostas:**
  - `200 OK`: Retorna o perfil atualizado.
  - `400 Bad Request`: Entrada inválida ou tentativa de alterar campos protegidos.
  - `409 Conflict`: Novo e-mail já pertence a outro usuário.

### 3.6. `PATCH /api/users/me/password` (Alteração de Senha)
- **Acesso:** Protegido (`Authorization: Bearer <token>`).
- **Body Esperado:**
  ```json
  {
    "currentPassword": "SenhaForte#2026",
    "newPassword": "NovaSenhaUltraSegura#2027",
    "confirmPassword": "NovaSenhaUltraSegura#2027"
  }
  ```
- **Respostas:**
  - `200 OK`: `{"message": "Senha alterada com sucesso."}`.
  - `400 Bad Request`: Senha atual incorreta, critérios de complexidade não atingidos ou nova senha idêntica à atual.

### 3.7. `DELETE /api/users/me` (Exclusão da Própria Conta)
- **Acesso:** Protegido (`Authorization: Bearer <token>`).
- **Body Esperado:**
  ```json
  {
    "password": "SenhaForte#2026",
    "confirmation": "EXCLUIR"
  }
  ```
- **Respostas:**
  - `200 OK`: `{"message": "Conta de usuário excluída com sucesso.", "id": "..."}`.
  - `400 Bad Request`: Senha incorreta ou confirmação diferente de `"EXCLUIR"`.
  - `401 Unauthorized`: Não autenticado.

---

## 4. Segurança da Informação

| Requisito | Mecanismo Implementado |
| :--- | :--- |
| **Hash de Senhas** | `crypto.scrypt` (N=16384, r=8, p=1) com salt criptográfico de 16 bytes via `crypto.randomBytes`. |
| **Timing Attacks** | Comparações com `crypto.timingSafeEqual` e chamada a `dummyCompare()` para uniformizar tempo em usuários inexistentes. |
| **Revogação de Tokens** | `TokenBlacklistStore` com indexação por `jti` e limpeza automática baseada no timestamp de expiração (`exp`). |
| **Rate Limiting** | `RateLimiter` em memória por endereço IP (limite de 10 requisições a cada 15 minutos para rotas de auth). |
| **Controle de Acesso** | Nenhum endpoint permite passagem de `userId` de terceiros no path para manipulação de perfil; toda operação é ancorada em `req.user.id`. |
| **Sanitização** | E-mails forçados a minúsculas (`lowercase`), nomes e telefones limpos contra injeções e tags maliciosas. |
| **Prevenção a SQL Injection** | No `PostgresUserRepository`, todas as consultas utilizam parâmetros posicionais (`$1, $2, ...`), sem concatenação de strings. |

---

## 5. Documentação OpenAPI / Swagger UI

A documentação interativa está disponível em:
- **Interface Gráfica Swagger UI:** `http://localhost:4000/api/docs`
- **Especificação OpenAPI 3.0 (JSON):** `http://localhost:4000/api/docs/openapi.json`

Permite explorar todos os schemas, autenticar via botão *Authorize* com `Bearer <token>` e testar as requisições diretamente.

---

## 6. Instruções de Teste e Validação

Para executar toda a suíte de testes (44 testes automatizados cobrindo unitários, regras de negócio e integração HTTP):

```bash
npm test
```
