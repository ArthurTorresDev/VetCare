export const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'VetCare API - Sistema de Autenticação e Gerenciamento de Usuários',
    version: '1.0.0',
    description:
      'API RESTful robusta desenvolvida em TypeScript e arquitetura MVC para autenticação segura baseada em JWT, autorização por middleware, hashing de senhas criptográfico (Scrypt/OWASP), rate limiting, auditoria e gerenciamento de perfil próprio (CRUD de contas de usuário).',
    contact: {
      name: 'Arthur Steiner - VetCare Engineering Team',
    },
  },
  servers: [
    {
      url: '/api',
      description: 'Servidor API Local / Desenvolvimento',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description:
          'Insira o token JWT no cabeçalho de requisição no padrão: Bearer <seu-token-jwt>',
      },
    },
    schemas: {
      UserRole: {
        type: 'string',
        enum: ['ADMIN', 'VET', 'RECEPTIONIST', 'CLIENT'],
        example: 'CLIENT',
      },
      PublicUser: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'usr_f81d4fae-7dec-11d0-a765-00a0c91e6bf6' },
          name: { type: 'string', example: 'Arthur Steiner' },
          email: { type: 'string', format: 'email', example: 'arthur.steiner@exemplo.com' },
          role: { $ref: '#/components/schemas/UserRole' },
          phone: { type: 'string', example: '(11) 98765-4321' },
          isActive: { type: 'boolean', example: true },
          createdAt: { type: 'string', format: 'date-time', example: '2026-11-15T20:00:00.000Z' },
          updatedAt: { type: 'string', format: 'date-time', example: '2026-11-15T20:00:00.000Z' },
          lastLoginAt: { type: 'string', format: 'date-time', example: '2026-11-15T22:00:00.000Z' },
        },
      },
      RegisterUserDTO: {
        type: 'object',
        required: ['name', 'email', 'password'],
        properties: {
          name: { type: 'string', minLength: 3, example: 'Arthur Steiner' },
          email: { type: 'string', format: 'email', example: 'arthur.steiner@exemplo.com' },
          password: {
            type: 'string',
            minLength: 8,
            description:
              'Mínimo 8 caracteres, contendo ao menos uma maiúscula, uma minúscula, um número e um caractere especial.',
            example: 'SenhaForte#2026',
          },
          confirmPassword: { type: 'string', example: 'SenhaForte#2026' },
          phone: { type: 'string', example: '(11) 98765-4321' },
          role: { $ref: '#/components/schemas/UserRole' },
        },
      },
      LoginDTO: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'arthur.steiner@exemplo.com' },
          password: { type: 'string', example: 'SenhaForte#2026' },
        },
      },
      UpdateUserDTO: {
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 3, example: 'Arthur Steiner da Silva' },
          email: { type: 'string', format: 'email', example: 'arthur.novo@exemplo.com' },
          phone: { type: 'string', example: '(11) 99999-8888' },
        },
        description: 'Campos opcionais. Ao menos um deve ser informado. Campos protegidos (id, role, password) são rejeitados.',
      },
      ChangePasswordDTO: {
        type: 'object',
        required: ['currentPassword', 'newPassword'],
        properties: {
          currentPassword: { type: 'string', example: 'SenhaForte#2026' },
          newPassword: {
            type: 'string',
            minLength: 8,
            example: 'NovaSenhaUltraSegura#2027',
          },
          confirmPassword: { type: 'string', example: 'NovaSenhaUltraSegura#2027' },
        },
      },
      DeleteAccountDTO: {
        type: 'object',
        required: ['password', 'confirmation'],
        properties: {
          password: { type: 'string', description: 'Senha atual para confirmação', example: 'SenhaForte#2026' },
          confirmation: {
            type: 'string',
            enum: ['EXCLUIR'],
            description: 'Deve ser exatamente a palavra "EXCLUIR"',
            example: 'EXCLUIR',
          },
        },
      },
      AuthResponse: {
        type: 'object',
        properties: {
          user: { $ref: '#/components/schemas/PublicUser' },
          token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
          expiresIn: { type: 'string', example: '2h' },
          tokenType: { type: 'string', example: 'Bearer' },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Mensagem de erro detalhada' },
          details: {
            type: 'array',
            items: { type: 'string' },
            example: ['A senha deve conter ao menos uma letra maiúscula.'],
          },
        },
      },
      SuccessMessageResponse: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Operação realizada com sucesso.' },
          id: { type: 'string', example: 'usr_f81d4fae-7dec-11d0-a765-00a0c91e6bf6' },
        },
      },
      Veterinario: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid', example: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d' },
          nome: { type: 'string', example: 'Dra. Camila Rocha' },
          crmv: { type: 'string', example: 'SP-12345' },
          telefone: { type: 'string', example: '(11) 98765-1111' },
          email: { type: 'string', format: 'email', example: 'camila.rocha@vetcare.com' },
          criadoEm: { type: 'string', format: 'date-time' },
        },
      },
      Atendente: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid', example: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d' },
          nome: { type: 'string', example: 'Ana Paula Santos' },
          email: { type: 'string', format: 'email', example: 'ana.santos@vetcare.com' },
          telefone: { type: 'string', example: '(11) 98765-3333' },
          criadoEm: { type: 'string', format: 'date-time' },
        },
      },
      Atendimento: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid', example: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d' },
          petId: { type: 'string', format: 'uuid' },
          veterinarioId: { type: 'string', format: 'uuid' },
          atendenteId: { type: 'string', format: 'uuid' },
          tipoServico: { type: 'string', example: 'Consulta Clínica Geral' },
          dataHora: { type: 'string', format: 'date-time' },
          status: { type: 'string', example: 'Agendado' },
          observacoes: { type: 'string', example: 'Retorno vacina' },
          criadoEm: { type: 'string', format: 'date-time' },
        },
      },
    },
  },
  paths: {
    '/veterinarios': {
      get: {
        tags: ['Veterinários (vetcare.sql)'],
        summary: 'Listar corpo clínico veterinário',
        responses: { 200: { description: 'Lista de veterinários' } },
      },
      post: {
        tags: ['Veterinários (vetcare.sql)'],
        summary: 'Cadastrar veterinário',
        responses: { 201: { description: 'Veterinário criado' } },
      },
    },
    '/atendentes': {
      get: {
        tags: ['Atendentes (vetcare.sql)'],
        summary: 'Listar atendentes e recepção',
        responses: { 200: { description: 'Lista de atendentes' } },
      },
      post: {
        tags: ['Atendentes (vetcare.sql)'],
        summary: 'Cadastrar atendente',
        responses: { 201: { description: 'Atendente criado' } },
      },
    },
    '/atendimentos': {
      get: {
        tags: ['Atendimentos (vetcare.sql)'],
        summary: 'Listar atendimentos clínicos',
        responses: { 200: { description: 'Lista de atendimentos' } },
      },
      post: {
        tags: ['Atendimentos (vetcare.sql)'],
        summary: 'Registrar atendimento clínico',
        responses: { 201: { description: 'Atendimento registrado' } },
      },
    },
    '/auth/register': {
      post: {
        tags: ['Autenticação'],
        summary: 'Cadastro de nova conta de usuário',
        description:
          'Cria uma nova conta no sistema, armazena a senha com hash seguro (Scrypt) e retorna o perfil com o token JWT de acesso.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RegisterUserDTO' },
            },
          },
        },
        responses: {
          201: {
            description: 'Conta criada com sucesso.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthResponse' },
              },
            },
          },
          400: {
            description: 'Dados de cadastro inválidos ou não conformes aos critérios de validação.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
          409: {
            description: 'Conflito: o e-mail informado já está em uso.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
          429: {
            description: 'Muitas requisições (Rate Limit atingido).',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Autenticação'],
        summary: 'Autenticação e obtenção de token JWT',
        description:
          'Valida credenciais do usuário de forma protegida contra timing attacks e enumeração de usuários. Retorna o token JWT.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginDTO' },
            },
          },
        },
        responses: {
          200: {
            description: 'Autenticado com sucesso.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthResponse' },
              },
            },
          },
          400: {
            description: 'Dados de login ausentes ou inválidos.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
          401: {
            description: 'Credenciais inválidas (e-mail ou senha incorretos).',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
          403: {
            description: 'Conta de usuário desativada.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
          429: {
            description: 'Muitas tentativas de autenticação (Rate Limit atingido).',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
        },
      },
    },
    '/auth/logout': {
      post: {
        tags: ['Autenticação'],
        summary: 'Encerramento de sessão com revogação do token',
        description:
          'Invalida imediatamente o token JWT atual adicionando seu identificador único (JTI) à lista de revogação até sua expiração.',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Sessão encerrada com sucesso.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SuccessMessageResponse' },
              },
            },
          },
          401: {
            description: 'Não autorizado: token inválido, expirado ou ausente.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
        },
      },
    },
    '/users/me': {
      get: {
        tags: ['Gerenciamento de Conta'],
        summary: 'Consultar dados cadastrais do próprio usuário',
        description:
          'Retorna as informações autorizadas do usuário autenticado. Garante que senhas ou hashes nunca sejam expostos.',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Dados cadastrais do usuário autenticado.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/PublicUser' },
              },
            },
          },
          401: {
            description: 'Não autorizado: token inválido ou ausente.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
          404: {
            description: 'Usuário não encontrado.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
        },
      },
      patch: {
        tags: ['Gerenciamento de Conta'],
        summary: 'Atualizar dados cadastrais da própria conta',
        description:
          'Permite a edição de nome, telefone ou e-mail. Bloqueia alteração indevida de campos protegidos como ID ou nível de acesso.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateUserDTO' },
            },
          },
        },
        responses: {
          200: {
            description: 'Dados cadastrais atualizados com sucesso.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/PublicUser' },
              },
            },
          },
          400: {
            description: 'Dados inválidos ou tentativa de alteração de campos protegidos.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
          401: {
            description: 'Não autorizado.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
          409: {
            description: 'Conflito: novo e-mail informado já está em uso por outro usuário.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
        },
      },
      delete: {
        tags: ['Gerenciamento de Conta'],
        summary: 'Excluir a própria conta de usuário',
        description:
          'Exclui em definitivo a conta do usuário autenticado. Exige a confirmação expressa "EXCLUIR" e a senha atual para validação.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/DeleteAccountDTO' },
            },
          },
        },
        responses: {
          200: {
            description: 'Conta excluída com sucesso.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SuccessMessageResponse' },
              },
            },
          },
          400: {
            description: 'Senha incorreta ou confirmação diferente de "EXCLUIR".',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
          401: {
            description: 'Não autorizado.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
        },
      },
    },
    '/users/me/password': {
      patch: {
        tags: ['Gerenciamento de Conta'],
        summary: 'Alterar senha da própria conta',
        description:
          'Atualiza a senha do usuário autenticado após validação rigorosa da senha atual e verificação dos critérios de complexidade da nova senha.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ChangePasswordDTO' },
            },
          },
        },
        responses: {
          200: {
            description: 'Senha alterada com sucesso.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SuccessMessageResponse' },
              },
            },
          },
          400: {
            description: 'Senha atual incorreta, nova senha fraca ou idêntica à atual.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
          401: {
            description: 'Não autorizado.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
        },
      },
    },
  },
};
