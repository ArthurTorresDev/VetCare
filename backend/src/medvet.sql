CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Tabela CLIENTE

CREATE TABLE cliente (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(150) NOT NULL,
    cpf VARCHAR(14) UNIQUE,
    telefone VARCHAR(20),
    whatsapp VARCHAR(20),
    endereco TEXT,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabela pet
CREATE TABLE pet (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id UUID NOT NULL,
    nome VARCHAR(100) NOT NULL,
    especie VARCHAR(50) NOT NULL,
    raca VARCHAR(80),
    sexo VARCHAR(20),
    data_nascimento DATE,
    peso DECIMAL(6, 2),
    foto_url VARCHAR(255),
    alergias_medicamentos TEXT,
    observacoes TEXT,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_pet_cliente 
        FOREIGN KEY (cliente_id) 
        REFERENCES cliente(id) 
        ON DELETE CASCADE
);

-- 3. Tabela veterinaria 44
CREATE TABLE veterinario (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(150) NOT NULL,
    crmv VARCHAR(30) UNIQUE NOT NULL,
    telefone VARCHAR(20),
    email VARCHAR(150) UNIQUE NOT NULL,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabela atendendee
CREATE TABLE atendente (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    telefone VARCHAR(20),
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. atendimento 
CREATE TABLE atendimento (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pet_id UUID NOT NULL,
    veterinario_id UUID NOT NULL,
    atendente_id UUID NOT NULL,
    tipo_servico VARCHAR(80) NOT NULL, 
    data_hora TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(40) NOT NULL DEFAULT 'Agendado', 
    observacoes TEXT,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT fk_atendimento_pet 
        FOREIGN KEY (pet_id) 
        REFERENCES pet(id) 
        ON DELETE RESTRICT,

    CONSTRAINT fk_atendimento_veterinario 
        FOREIGN KEY (veterinario_id) 
        REFERENCES veterinario(id) 
        ON DELETE RESTRICT,

    CONSTRAINT fk_atendimento_atendente 
        FOREIGN KEY (atendente_id) 
        REFERENCES atendente(id) 
        ON DELETE RESTRICT
);
--codigo teste q o gemine mando
CREATE INDEX idx_pet_cliente_id ON pet(cliente_id);
CREATE INDEX idx_atendimento_veterinario_id ON atendimento(veterinario_id);
CREATE INDEX idx_atendimento_pet_id ON atendimento(pet_id);
CREATE INDEX idx_atendimento_data_hora ON atendimento(data_hora);