import { describe, it, expect, beforeEach } from 'vitest';
import { EventEmitter } from 'node:events';
import app from '../../backend/src/app.js';
import { InMemoryStore } from '../../backend/src/models/in-memory.store.js';
import { TokenBlacklistStore } from '../../backend/src/services/token.service.js';
import { authRateLimiter } from '../../backend/src/middleware/rate-limiter.middleware.js';

/**
 * Dispatcher in-memory para testar o Express sem abrir sockets TCP
 * (compatível com ambientes sandboxed sem acesso a portas de rede).
 */
function dispatch(
  method: string,
  url: string,
  options: {
    headers?: Record<string, string>;
    body?: any;
  } = {},
): Promise<{ status: number; headers: Record<string, any>; body: any }> {
  return new Promise((resolve) => {
    const req: any = new EventEmitter();
    req.method = method.toUpperCase();
    req.url = url;
    req.headers = {
      'content-type': 'application/json',
      ...options.headers,
    };
    req.socket = { remoteAddress: '127.0.0.1' };
    req.body = options.body;

    const resHeaders: Record<string, any> = {};
    let statusCode = 200;
    let responseBody = '';

    const res: any = new EventEmitter();
    res.setHeader = (k: string, v: any) => {
      resHeaders[k.toLowerCase()] = v;
      return res;
    };
    res.getHeader = (k: string) => resHeaders[k.toLowerCase()];
    res.status = (code: number) => {
      statusCode = code;
      return res;
    };
    res.json = (data: any) => {
      res.setHeader('content-type', 'application/json');
      responseBody = JSON.stringify(data);
      resolve({ status: statusCode, headers: resHeaders, body: data });
      return res;
    };
    res.send = (data: any) => {
      responseBody = typeof data === 'string' ? data : JSON.stringify(data);
      let parsed = data;
      try {
        parsed = JSON.parse(data);
      } catch {
        // texto plano ou html
      }
      resolve({ status: statusCode, headers: resHeaders, body: parsed });
      return res;
    };
    res.end = (data?: any) => {
      if (data) responseBody = String(data);
      resolve({ status: statusCode, headers: resHeaders, body: responseBody });
      return res;
    };

    app.handle(req, res, (err: any) => {
      if (err) {
        resolve({
          status: err.statusCode || 500,
          headers: resHeaders,
          body: { error: err.message },
        });
      }
    });
  });
}

describe('Integração RESTful da API de Autenticação e Usuários (In-Memory Dispatch)', () => {
  beforeEach(() => {
    InMemoryStore.getInstance().reset();
    TokenBlacklistStore.getInstance().clear();
    authRateLimiter.reset();
  });

  it('GET /api/docs/openapi.json deve retornar a especificação OpenAPI 3.0', async () => {
    const res = await dispatch('GET', '/api/docs/openapi.json');
    expect(res.status).toBe(200);
    expect(res.body.openapi).toBe('3.0.3');
    expect(res.body.paths['/auth/register']).toBeDefined();
    expect(res.body.paths['/users/me']).toBeDefined();
  });

  it('GET /api/docs deve responder com HTML da interface Swagger UI', async () => {
    const res = await dispatch('GET', '/api/docs');
    expect(res.status).toBe(200);
    expect(typeof res.body).toBe('string');
    expect(res.body).toContain('SwaggerUIBundle');
  });

  it('Fluxo Completo de Usuário: Cadastro -> Perfil -> Atualização -> Troca de Senha -> Logout -> Exclusão', async () => {
    // 1. Cadastro (POST /api/auth/register)
    const registerPayload = {
      name: 'Arthur Steiner',
      email: 'arthur.integration@vetcare.com',
      password: 'SenhaForte#2026',
      confirmPassword: 'SenhaForte#2026',
      phone: '(11) 98765-4321',
    };

    const regRes = await dispatch('POST', '/api/auth/register', { body: registerPayload });
    expect(regRes.status).toBe(201);
    expect(regRes.body.token).toBeDefined();
    expect(regRes.body.user.email).toBe('arthur.integration@vetcare.com');
    expect(regRes.body.user.passwordHash).toBeUndefined();

    const token = regRes.body.token;

    // 2. Consulta de Perfil Próprio (GET /api/users/me)
    const meRes = await dispatch('GET', '/api/users/me', {
      headers: { authorization: `Bearer ${token}` },
    });
    expect(meRes.status).toBe(200);
    expect(meRes.body.name).toBe('Arthur Steiner');
    expect(meRes.body.email).toBe('arthur.integration@vetcare.com');
    expect(meRes.body.passwordHash).toBeUndefined();

    // 3. Atualização de Dados Cadastrais (PATCH /api/users/me)
    const updateRes = await dispatch('PATCH', '/api/users/me', {
      headers: { authorization: `Bearer ${token}` },
      body: {
        name: 'Arthur Steiner Atualizado',
        phone: '(11) 99999-0000',
      },
    });
    expect(updateRes.status).toBe(200);
    expect(updateRes.body.name).toBe('Arthur Steiner Atualizado');
    expect(updateRes.body.phone).toBe('(11) 99999-0000');

    // 4. Alteração de Senha (PATCH /api/users/me/password)
    const pwdRes = await dispatch('PATCH', '/api/users/me/password', {
      headers: { authorization: `Bearer ${token}` },
      body: {
        currentPassword: 'SenhaForte#2026',
        newPassword: 'NovaSenhaUltraSegura#2027',
        confirmPassword: 'NovaSenhaUltraSegura#2027',
      },
    });
    expect(pwdRes.status).toBe(200);
    expect(pwdRes.body.message).toBe('Senha alterada com sucesso.');

    // 5. Novo Login com a Nova Senha (POST /api/auth/login)
    const loginRes = await dispatch('POST', '/api/auth/login', {
      body: {
        email: 'arthur.integration@vetcare.com',
        password: 'NovaSenhaUltraSegura#2027',
      },
    });
    expect(loginRes.status).toBe(200);
    expect(loginRes.body.token).toBeDefined();
    const freshToken = loginRes.body.token;

    // 6. Logout (POST /api/auth/logout)
    const logoutRes = await dispatch('POST', '/api/auth/logout', {
      headers: { authorization: `Bearer ${freshToken}` },
    });
    expect(logoutRes.status).toBe(200);
    expect(logoutRes.body.message).toContain('sucesso');

    // 7. Acesso com Token Revogado deve falhar com 401
    const revokedCheck = await dispatch('GET', '/api/users/me', {
      headers: { authorization: `Bearer ${freshToken}` },
    });
    expect(revokedCheck.status).toBe(401);
    expect(revokedCheck.body.code).toBe('TOKEN_REVOKED');

    // 8. Relogar para obter token novo e excluir a própria conta (DELETE /api/users/me)
    const reLogin = await dispatch('POST', '/api/auth/login', {
      body: {
        email: 'arthur.integration@vetcare.com',
        password: 'NovaSenhaUltraSegura#2027',
      },
    });
    const deleteToken = reLogin.body.token;

    const deleteRes = await dispatch('DELETE', '/api/users/me', {
      headers: { authorization: `Bearer ${deleteToken}` },
      body: {
        password: 'NovaSenhaUltraSegura#2027',
        confirmation: 'EXCLUIR',
      },
    });
    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body.message).toContain('excluída com sucesso');

    // 9. Acesso subsequente com o token da conta excluída deve ser rejeitado (401)
    const afterDelete = await dispatch('GET', '/api/users/me', {
      headers: { authorization: `Bearer ${deleteToken}` },
    });
    expect(afterDelete.status).toBe(401);
  });
});
