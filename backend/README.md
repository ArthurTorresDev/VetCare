# VetCare API - Backend & Serviços

Backend principal do sistema VetCare, estruturado em TypeScript com arquitetura **MVC (Model-View-Controller)**, API RESTful robusta e módulo completo de autenticação e gerenciamento de contas de usuários (CRUD).

## 🚀 Arquitetura & Tecnologias

- **Linguagem:** TypeScript 5.7+ (com verificação estrita de tipos)
- **Framework Web:** Express 5.x
- **Arquitetura:** MVC com Inversão de Dependências (SOLID)
- **Autenticação:** Tokens JWT (RFC 7519) com assinatura HMAC-SHA256, controle de sessão e blacklist com TTL
- **Criptografia de Senhas:** Hashing Scrypt com salt aleatório e proteção contra timing attacks (`timingSafeEqual`)
- **Proteção contra Brute Force:** Rate Limiter em memória por IP
- **Documentação:** Swagger UI interativo (`/api/docs`) e especificação OpenAPI 3.0 (`/api/docs/openapi.json`)
- **Persistência Relacional:** Modelagem para PostgreSQL com script DDL completo (`src/database/schema.sql`) e repositório desacoplado (`IUserRepository`)

---

## 📌 Endpoints da API

| Método | Endpoint | Acesso | Descrição | Status HTTP |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Público | Cadastro de nova conta | `201 Created` / `400` / `409` |
| `POST` | `/api/auth/login` | Público | Autenticação e emissão de JWT | `200 OK` / `401 Unauthorized` |
| `POST` | `/api/auth/logout` | Protegido | Encerramento de sessão e revogação do token | `200 OK` / `401 Unauthorized` |
| `GET` | `/api/users/me` | Protegido | Consulta dados cadastrais do próprio usuário | `200 OK` / `401 Unauthorized` |
| `PATCH` | `/api/users/me` | Protegido | Atualiza dados cadastrais próprios | `200 OK` / `400` / `409` |
| `PATCH` | `/api/users/me/password` | Protegido | Altera senha (valida senha atual) | `200 OK` / `400 Bad Request` |
| `DELETE`| `/api/users/me` | Protegido | Exclui a própria conta (exige senha e confirmação) | `200 OK` / `400` / `401` |
| `GET` | `/api/docs` | Público | Interface Swagger UI interativa | `200 OK` (HTML) |
| `GET` | `/api/docs/openapi.json` | Público | Especificação OpenAPI 3.0 em JSON | `200 OK` (JSON) |

---

## 🔐 Camadas de Segurança da Informação

1. **Hashing Seguro:** Scrypt (OWASP / NIST) com salt criptográfico de 16 bytes.
2. **Prevenção de Timing Attacks:** Comparações feitas via `crypto.timingSafeEqual` e `dummyCompare()` para prevenção de enumeração de usuários no endpoint `/auth/login`.
3. **Revogação Instantânea de Sessões (Blacklist):** No logout ou exclusão de conta, o identificador do token (`jti`) é imediatamente inserido na lista de revogação até seu tempo limite de expiração (`exp`).
4. **Proteção de Dados Sensíveis:** Nenhuma resposta da API expõe senhas ou hashes (`PublicUser` omite estritamente `passwordHash`).
5. **Rate Limiting:** Rotas de autenticação protegidas contra força bruta com limite de tentativas por janela temporal.
6. **SQL Injection Defense:** Interface `IUserRepository` e `PostgresUserRepository` utilizam consultas 100% parametrizadas (`$1`, `$2`, ...).

---

## 🛠️ Como Executar

```bash
# Executar em modo desenvolvimento (com live reload via tsx)
npm run dev --workspace=@vetcare/api

# Executar verificação de tipagem TypeScript
npm run typecheck --workspace=@vetcare/api

# Executar testes unitários e de integração
npm test

# Build de produção
npm run build --workspace=@vetcare/api
```
