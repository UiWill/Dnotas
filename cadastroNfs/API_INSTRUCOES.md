# API de Consulta de Serviços — Instruções para Implementação

> Este documento deve ser entregue a uma instância do Claude Code em outra pasta.
> Ela deve criar uma API REST completa seguindo exatamente o que está descrito aqui.

---

## Contexto

A Dnotas é uma empresa que emite notas fiscais de serviço para clientes como salões, papelarias etc.
Existe um banco de dados no **Supabase** com serviços prestados e dados dos clientes.
Esta API deve permitir consultar todos os serviços realizados em um período de datas,
retornando em JSON todos os campos do serviço **e** todos os campos do cliente que o contratou.

---

## Banco de Dados — Supabase

| Parâmetro        | Valor                                    |
|------------------|------------------------------------------|
| **Project URL**  | `https://reubrhhceuxwbtaqxcnq.supabase.co` |
| **Anon Key**     | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJldWJyaGhjZXV4d2J0YXF4Y25xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5MDY5NDAsImV4cCI6MjA4NDQ4Mjk0MH0.A8QX4PkS4Vb0ZqZcn_L2aqbo73dxhSknfQPIFFF8un8` |
| **Service Key**  | (pegar no painel do Supabase em Settings → API → service_role key) |

### Tabelas relevantes

#### `servicos_prestados`
| Coluna           | Tipo          | Descrição                              |
|------------------|---------------|----------------------------------------|
| `id`             | BIGSERIAL     | ID único do serviço (gerado automático)|
| `empresa_id`     | UUID          | FK para `empresas_nfs`                 |
| `cnpj_empresa`   | VARCHAR(14)   | CNPJ (só dígitos) da empresa prestadora |
| `cliente_id`     | UUID          | FK para `clientes`                     |
| `atividade`      | TEXT          | Descrição do serviço realizado         |
| `valor`          | NUMERIC(10,2) | Valor cobrado                          |
| `forma_pagamento`| VARCHAR(10)   | `pix`, `debito` ou `credito`           |
| `data`           | DATE          | Data do serviço                        |
| `created_at`     | TIMESTAMPTZ   | Data/hora do registro                  |

#### `clientes`
| Coluna         | Tipo         | Descrição                      |
|----------------|--------------|--------------------------------|
| `id`           | UUID         | ID único do cliente            |
| `nome`         | VARCHAR(255) | Nome completo                  |
| `cpf`          | VARCHAR(14)  | CPF formatado (000.000.000-00) |
| `cep`          | VARCHAR(9)   | CEP                            |
| `logradouro`   | VARCHAR(255) | Rua/Avenida                    |
| `numero`       | VARCHAR(20)  | Número                         |
| `complemento`  | VARCHAR(100) | Complemento (opcional)         |
| `bairro`       | VARCHAR(100) | Bairro                         |
| `cidade`       | VARCHAR(100) | Cidade                         |
| `estado`       | CHAR(2)      | UF                             |
| `codigo_ibge`  | VARCHAR(10)  | Código IBGE da cidade          |
| `telefone`     | VARCHAR(20)  | Telefone                       |
| `created_at`   | TIMESTAMPTZ  | Data/hora do cadastro          |

#### `empresas_nfs`
| Coluna         | Tipo         | Descrição                    |
|----------------|--------------|------------------------------|
| `id`           | UUID         | ID único                     |
| `cnpj`         | VARCHAR(14)  | CNPJ só dígitos              |
| `nome_empresa` | VARCHAR(255) | Nome da empresa              |
| `created_at`   | TIMESTAMPTZ  | Data/hora do cadastro        |

---

## O que a API deve fazer

### Endpoint principal

```
GET /api/servicos
```

**Todos os parâmetros são obrigatórios:**

| Param  | Formato    | Exemplo          | Descrição                                        |
|--------|------------|------------------|--------------------------------------------------|
| `cnpj` | 14 dígitos | `12345678000199` | CNPJ da empresa (só dígitos, sem pontos/barras)  |
| `de`   | YYYY-MM-DD | `2026-01-01`     | Data início do período                           |
| `ate`  | YYYY-MM-DD | `2026-01-31`     | Data fim do período                              |

**Exemplo de chamada:**
```
GET /api/servicos?cnpj=12345678000199&de=2026-01-01&ate=2026-01-31
```

---

### Resposta esperada (JSON)

```json
{
  "success": true,
  "cnpj_empresa": "12345678000199",
  "nome_empresa": "Salão da Maria",
  "periodo": {
    "de": "2026-01-01",
    "ate": "2026-01-31"
  },
  "total_registros": 2,
  "valor_total": 850.00,
  "servicos": [
    {
      "servico": {
        "id": 1,
        "atividade": "Emissão de nota fiscal mensal",
        "valor": 397.00,
        "forma_pagamento": "pix",
        "data": "2026-01-10",
        "cnpj_empresa": "12345678000199",
        "created_at": "2026-01-10T14:30:00Z"
      },
      "cliente": {
        "id": "uuid-aqui",
        "nome": "João da Silva",
        "cpf": "123.456.789-00",
        "telefone": "(31) 99999-9999",
        "cep": "30112-021",
        "logradouro": "Avenida Getúlio Vargas",
        "numero": "671",
        "complemento": "Sala 500",
        "bairro": "Savassi",
        "cidade": "Belo Horizonte",
        "estado": "MG",
        "codigo_ibge": "3106200",
        "created_at": "2026-01-05T10:00:00Z"
      },
      "empresa": {
        "id": "uuid-aqui",
        "cnpj": "12345678000199",
        "nome_empresa": "Salão da Maria"
      }
    }
  ]
}
```

### Respostas de erro

```json
{ "success": false, "error": "Parâmetros 'cnpj', 'de' e 'ate' são obrigatórios", "servicos": [] }
{ "success": false, "error": "CNPJ deve ter 14 dígitos numéricos", "servicos": [] }
{ "success": false, "error": "Data 'de' não pode ser maior que 'ate'", "servicos": [] }
{ "success": false, "error": "Empresa não encontrada para o CNPJ informado", "servicos": [] }
```

---

## Stack recomendada

Use **Node.js + Express** com o pacote `@supabase/supabase-js`.

```
project/
├── src/
│   ├── index.js          ← entry point Express
│   ├── routes/
│   │   └── servicos.js   ← rota GET /api/servicos
│   └── lib/
│       └── supabase.js   ← cliente Supabase
├── .env
├── package.json
└── README.md
```

### Dependências

```bash
npm install express @supabase/supabase-js dotenv cors
npm install -D nodemon
```

### `.env`

```env
SUPABASE_URL=https://reubrhhceuxwbtaqxcnq.supabase.co
SUPABASE_SERVICE_KEY=sua_service_role_key_aqui
PORT=3001
```

> ⚠️ Use a **service_role key** (não a anon key) no backend para ter acesso completo sem restrição de RLS.

---

## Lógica da query no Supabase

A query deve fazer um JOIN entre as 3 tabelas.
No Supabase JS v2 use o select com relacionamentos:

```js
const { data, error } = await supabase
  .from('servicos_prestados')
  .select(`
    id,
    atividade,
    valor,
    forma_pagamento,
    data,
    cnpj_empresa,
    created_at,
    clientes (
      id, nome, cpf, telefone,
      cep, logradouro, numero, complemento,
      bairro, cidade, estado, codigo_ibge,
      created_at
    ),
    empresas_nfs (
      id, cnpj, nome_empresa
    )
  `)
  .eq('cnpj_empresa', cnpj)
  .gte('data', de)
  .lte('data', ate)
  .order('data', { ascending: false });
```

Depois formatar o resultado para o JSON esperado (renomear `clientes` → `cliente`, etc.).

---

## Validações obrigatórias

- `cnpj`, `de` e `ate` são todos **obrigatórios** → retornar erro 400 se qualquer um estiver ausente
- `cnpj` deve ter exatamente 14 dígitos numéricos → remover formatação (pontos, barra, traço) antes de validar
- Verificar se o `cnpj` existe na tabela `empresas_nfs` → retornar erro 404 se não existir
- Formato das datas deve ser `YYYY-MM-DD` → validar com regex `/^\d{4}-\d{2}-\d{2}$/`
- `de` deve ser ≤ `ate` → retornar erro 400 se não for
- Se não houver serviços no período, retornar `servicos: []` com `success: true`

---

## CORS

Habilitar CORS para qualquer origem (ou pelo menos para `https://dnotas.com.br`):

```js
const cors = require('cors');
app.use(cors({ origin: '*' }));
```

---

## Cálculo do valor_total

Somar todos os valores dos serviços retornados e incluir no response root como `valor_total` (número com 2 casas decimais).

---

## Testes manuais esperados

Após criar a API, testar com curl ou Postman:

```bash
# Buscar todos os serviços do Salão da Maria em janeiro/2026
GET /api/servicos?cnpj=12345678000199&de=2026-01-01&ate=2026-01-31

# Buscar apenas fevereiro
GET /api/servicos?cnpj=12345678000199&de=2026-02-01&ate=2026-02-28

# Erro: faltando parâmetros
GET /api/servicos
→ { "success": false, "error": "Parâmetros 'cnpj', 'de' e 'ate' são obrigatórios" }

# Erro: CNPJ não cadastrado
GET /api/servicos?cnpj=99999999000199&de=2026-01-01&ate=2026-01-31
→ { "success": false, "error": "Empresa não encontrada para o CNPJ informado" }
```

---

## Observações finais

- O campo `data` em `servicos_prestados` é do tipo `DATE` no Postgres → filtrar com `.gte()` e `.lte()`
- O campo `cliente_id` pode ser `null` (serviço sem cliente vinculado) → tratar no JSON retornando `"cliente": null`
- A API será consumida pelo site Dnotas e por integrações futuras de emissão de NFS-e
- Deploy pode ser feito no Railway, Render ou VPS própria

---

*Gerado automaticamente pelo sistema Dnotas — 2026*
