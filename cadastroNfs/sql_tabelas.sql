-- ================================================================
-- DNOTAS - Sistema de Cadastro NFS
-- Banco: reubrhhceuxwbtaqxcnq.supabase.co
-- Cole este script no SQL Editor do Supabase e execute
-- ================================================================


-- ============================================
-- TABELA 1: clientes
-- Armazena os dados dos clientes que contratam a Dnotas
-- ============================================
CREATE TABLE IF NOT EXISTS clientes (
    id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome        VARCHAR(255) NOT NULL,
    cpf         VARCHAR(14)  UNIQUE NOT NULL,
    cep         VARCHAR(9),
    logradouro  VARCHAR(255),
    numero      VARCHAR(20),
    complemento VARCHAR(100),
    bairro      VARCHAR(100),
    cidade      VARCHAR(100),
    estado      CHAR(2),
    codigo_ibge VARCHAR(10),
    telefone    VARCHAR(20),
    created_at  TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================
-- TABELA 2: empresas_nfs
-- Empresas cadastradas para registrar servicos (salao, papelaria, etc.)
-- Login: CNPJ (14 digitos, sem formatacao)
-- Senha: primeiros 6 digitos do CNPJ
-- ============================================
CREATE TABLE IF NOT EXISTS empresas_nfs (
    id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    cnpj         VARCHAR(14)  UNIQUE NOT NULL,
    nome_empresa VARCHAR(255) NOT NULL,
    created_at   TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================
-- TABELA 3: servicos_prestados
-- Servicos anotados por cada empresa
-- ============================================
CREATE TABLE IF NOT EXISTS servicos_prestados (
    id              BIGSERIAL   PRIMARY KEY,
    empresa_id      UUID        NOT NULL REFERENCES empresas_nfs(id),
    cnpj_empresa    VARCHAR(14) NOT NULL,
    cliente_id      UUID        REFERENCES clientes(id) ON DELETE SET NULL,
    atividade       TEXT        NOT NULL,
    valor           NUMERIC(10,2) NOT NULL CHECK (valor >= 0),
    forma_pagamento VARCHAR(10) NOT NULL CHECK (forma_pagamento IN ('pix', 'debito', 'credito')),
    data            DATE        NOT NULL DEFAULT CURRENT_DATE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================
-- INDICES para pesquisa rapida
-- ============================================
CREATE INDEX IF NOT EXISTS idx_clientes_cpf       ON clientes(cpf);
CREATE INDEX IF NOT EXISTS idx_clientes_nome      ON clientes(nome);
CREATE INDEX IF NOT EXISTS idx_empresas_cnpj      ON empresas_nfs(cnpj);
CREATE INDEX IF NOT EXISTS idx_servicos_empresa   ON servicos_prestados(cnpj_empresa);
CREATE INDEX IF NOT EXISTS idx_servicos_cliente   ON servicos_prestados(cliente_id);
CREATE INDEX IF NOT EXISTS idx_servicos_data      ON servicos_prestados(data);


-- ============================================
-- RLS - Row Level Security
-- Necessario para acesso via anon key (frontend)
-- ============================================
ALTER TABLE clientes          ENABLE ROW LEVEL SECURITY;
ALTER TABLE empresas_nfs      ENABLE ROW LEVEL SECURITY;
ALTER TABLE servicos_prestados ENABLE ROW LEVEL SECURITY;

-- Politicas da tabela clientes
CREATE POLICY "clientes_select" ON clientes
    FOR SELECT USING (true);

CREATE POLICY "clientes_insert" ON clientes
    FOR INSERT WITH CHECK (true);

-- Politicas da tabela empresas_nfs
CREATE POLICY "empresas_select" ON empresas_nfs
    FOR SELECT USING (true);

CREATE POLICY "empresas_insert" ON empresas_nfs
    FOR INSERT WITH CHECK (true);

-- Politicas da tabela servicos_prestados
CREATE POLICY "servicos_select" ON servicos_prestados
    FOR SELECT USING (true);

CREATE POLICY "servicos_insert" ON servicos_prestados
    FOR INSERT WITH CHECK (true);


-- ============================================
-- TABELA 4: servicos_pendentes
-- Servicos anotados pelos clientes via link publico
-- Aguardam aprovacao da empresa antes de ir para servicos_prestados
-- ============================================
CREATE TABLE IF NOT EXISTS servicos_pendentes (
    id              BIGSERIAL   PRIMARY KEY,
    empresa_id      UUID        NOT NULL REFERENCES empresas_nfs(id),
    cnpj_empresa    VARCHAR(14) NOT NULL,
    cliente_id      UUID        REFERENCES clientes(id) ON DELETE SET NULL,
    atividade       TEXT        NOT NULL,
    valor           NUMERIC(10,2) NOT NULL CHECK (valor >= 0),
    forma_pagamento VARCHAR(10) NOT NULL CHECK (forma_pagamento IN ('pix', 'debito', 'credito', 'dinheiro')),
    data            DATE        NOT NULL DEFAULT CURRENT_DATE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pendentes_empresa ON servicos_pendentes(cnpj_empresa);
CREATE INDEX IF NOT EXISTS idx_pendentes_cliente ON servicos_pendentes(cliente_id);

ALTER TABLE servicos_pendentes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pendentes_select" ON servicos_pendentes FOR SELECT USING (true);
CREATE POLICY "pendentes_insert" ON servicos_pendentes FOR INSERT WITH CHECK (true);
CREATE POLICY "pendentes_update" ON servicos_pendentes FOR UPDATE USING (true);
CREATE POLICY "pendentes_delete" ON servicos_pendentes FOR DELETE USING (true);


-- ============================================
-- Adicionar 'dinheiro' a servicos_prestados
-- Execute em bancos existentes:
-- ============================================
ALTER TABLE servicos_prestados
    DROP CONSTRAINT IF EXISTS servicos_prestados_forma_pagamento_check;

ALTER TABLE servicos_prestados
    ADD CONSTRAINT servicos_prestados_forma_pagamento_check
    CHECK (forma_pagamento IN ('pix', 'debito', 'credito', 'dinheiro'));


-- ================================================================
-- FIM DO SCRIPT
-- Tabelas criadas:
--   clientes           - cadastro de clientes com endereco via CEP
--   empresas_nfs       - empresas com acesso ao sistema (login por CNPJ)
--   servicos_prestados - servicos aprovados para emissao de NFS-e
--   servicos_pendentes - servicos anotados pelos clientes aguardando aprovacao
-- ================================================================
