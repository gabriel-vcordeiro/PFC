# 🏗️ Arquitetura do Sistema de Recuperação de Senha

## Fluxo de Dados

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                         │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ ResetPassword Component                                  │   │
│  │ - Solicitar Reset (email)                               │   │
│  │ - Validar Token (token)                                 │   │
│  │ - Formulário Nova Senha (token + password)              │   │
│  └───┬──────────────────────────────────────────┬──────────┘   │
└─────┼──────────────────────────────────────────┼────────────────┘
      │ HTTP Request                             │ HTTP Response
      │                                          │
      ▼                                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API (Node.js/Express)                      │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Auth Routes                                              │   │
│  │ POST /auth/request-password-reset                        │   │
│  │ POST /auth/validate-reset-token                          │   │
│  │ POST /auth/reset-password                                │   │
│  └──────────────┬──────────────────────────┬────────────────┘   │
│                 │                          │                    │
│  ┌──────────────▼──────────────────────────▼────────────────┐   │
│  │ Auth Controller                                          │   │
│  │ - requestPasswordReset()                                 │   │
│  │ - validateResetToken()                                   │   │
│  │ - resetPassword()                                        │   │
│  └──────────────┬──────────────────────────┬────────────────┘   │
│                 │                          │                    │
│  ┌──────────────▼──────────────────────────▼────────────────┐   │
│  │ Auth Service                                             │   │
│  │ - Gera Reset Token (crypto.randomBytes)                  │   │
│  │ - Hash password (bcrypt)                                 │   │
│  │ - Valida expiração                                       │   │
│  │ - Chama Audit Service                                    │   │
│  └────────┬──────────┬───────────────────────┬──────────────┘   │
│           │          │                       │                  │
│  ┌────────▼──────────▼───────────────────────▼──────────────┐   │
│  │ Audit Service                                            │   │
│  │ - Registra password_reset_requested                      │   │
│  │ - Registra password_reset_completed                      │   │
│  │ - Registra IP e User-Agent                               │   │
│  └────────┬─────────────────────────────────────────────────┘   │
│           │                                                     │
│           └──────────────┬──────────────────────────────────┐   │
│                          │                                  │   │
└──────────────────────────┼──────────────────────────────────┼────┘
                           │                                  │
                           ▼                                  ▼
                    ┌──────────────────────────────────────┐
                    │    SUPABASE (PostgreSQL)             │
                    │  ┌──────────────────────────────┐    │
                    │  │ pfc_users                    │    │
                    │  │ - id (UUID)                  │    │
                    │  │ - email (VARCHAR)            │    │
                    │  │ - password (VARCHAR)         │    │
                    │  │ - reset_token (VARCHAR)      │    │
                    │  │ - reset_token_expires_at     │    │
                    │  └──────────────────────────────┘    │
                    │  ┌──────────────────────────────┐    │
                    │  │ pfc_audit_logs               │    │
                    │  │ - id (UUID)                  │    │
                    │  │ - user_id (FK)               │    │
                    │  │ - action (VARCHAR)           │    │
                    │  │ - details (JSONB)            │    │
                    │  │ - ip_address (VARCHAR)       │    │
                    │  │ - user_agent (TEXT)          │    │
                    │  │ - created_at (TIMESTAMP)     │    │
                    │  └──────────────────────────────┘    │
                    └──────────────────────────────────────┘
```

---

## Sequência de Operações

### 1️⃣ Solicitar Reset de Senha

```
┌──────────────────────────────────────────────────────┐
│ Usuário clica em "Esqueceu senha?"                   │
└───┬────────────────────────────────────────────────┬─┘
    │                                                  │
    ▼                                                  ▼
┌─────────────────────┐                      ┌──────────────────┐
│ Insere email        │ ──POST──>             │ requestPasswordReset()
│ "user@example.com"  │                      └────────┬─────────┘
└─────────────────────┘                               │
                                                      ▼
                                        ┌──────────────────────────┐
                                        │ Busca usuário no BD      │
                                        └────────┬─────────────────┘
                                                 │
                                    ┌────────────┴────────────┐
                                    │                         │
                                    ▼ (Encontrado)            ▼ (Não encontrado)
                                    │                         │
                          ┌─────────────┐              ┌──────────────┐
                          │ Gera token  │              │ Log auditoria│ (sem revelar)
                          │ 32 bytes    │              │ return msg   │
                          └──────┬──────┘              └──────────────┘
                                 │
                          ┌──────────────┐
                          │ Define       │
                          │ expiry = +1h │
                          └──────┬───────┘
                                 │
                          ┌──────────────────────┐
                          │ Salva no BD:         │
                          │ reset_token = token  │
                          │ expires_at = 1h      │
                          └──────┬───────────────┘
                                 │
                          ┌──────────────────────┐
                          │ Log auditoria:       │
                          │ password_reset_      │
                          │ requested            │
                          └──────┬───────────────┘
                                 │
                                 ▼
                    ┌────────────────────────┐
                    │ Response ao Cliente:   │
                    │ "Verifique seu email"  │
                    │ token (dev only)       │
                    │ expiresAt              │
                    └────────────────────────┘
```

### 2️⃣ Validar Token

```
┌──────────────────────────────────────────────────────┐
│ Usuário clica no link do email                       │
│ /reset-password?token=abc123...                      │
└───┬────────────────────────────────────────────────┬─┘
    │                                                  │
    ▼                                                  ▼
┌──────────────────────────┐                 ┌────────────────────┐
│ Frontend extrai token    │ ──POST──>       │ validateResetToken()
│ da query parameter       │                 └────────┬───────────┘
└──────────────────────────┘                        │
                                                    ▼
                                        ┌──────────────────────────┐
                                        │ Busca token no BD        │
                                        └────────┬─────────────────┘
                                                 │
                                    ┌────────────┴────────────┐
                                    │                         │
                                    ▼ (Encontrado)            ▼ (Não encontrado)
                                    │                         │
                                ┌────────────┐        ┌──────────────────┐
                                │ Verifica   │        │ return 400       │
                                │ expiração  │        │ "Token inválido" │
                                └────┬───────┘        └──────────────────┘
                                     │
                        ┌────────────┴────────────┐
                        │                         │
                        ▼ (Válido)                ▼ (Expirado)
                        │                         │
                  ┌───────────┐            ┌────────────────────┐
                  │ Retorna   │            │ Log auditoria:     │
                  │ email     │            │ password_reset_    │
                  │ valid:ok  │            │ token_expired      │
                  └───────────┘            │ return 400         │
                                           └────────────────────┘
```

### 3️⃣ Resetar Senha

```
┌──────────────────────────────────────────────────────┐
│ Usuário preenche nova senha                          │
│ Clica "Resetar Senha"                                │
└───┬────────────────────────────────────────────────┬─┘
    │                                                  │
    ▼                                                  ▼
┌────────────────────────┐                  ┌──────────────────┐
│ Valida:                │ ──POST──>        │ resetPassword()
│ - token valido?        │                  └────────┬─────────┘
│ - senha >= 6 chars?    │                         │
└────────────────────────┘                         ▼
                                      ┌───────────────────────┐
                                      │ Chama validar token   │
                                      │ (reutiliza lógica)    │
                                      └────────┬──────────────┘
                                               │
                                    ┌──────────┴───────────┐
                                    │                      │
                                    ▼ (Válido)             ▼ (Inválido)
                                    │                      │
                          ┌─────────────────┐      ┌─────────────────┐
                          │ Hash nova       │      │ Log auditoria   │
                          │ password        │      │ password_reset_ │
                          │ com bcrypt      │      │ failed          │
                          └────────┬────────┘      │ return 400      │
                                   │               └─────────────────┘
                          ┌────────────────┐
                          │ Atualiza BD:   │
                          │ - password     │
                          │ - reset_token  │
                          │ - expires = NULL
                          └────────┬───────┘
                                   │
                          ┌────────────────────────┐
                          │ Log auditoria:         │
                          │ password_reset_        │
                          │ completed              │
                          └────────┬───────────────┘
                                   │
                                   ▼
                      ┌──────────────────────────┐
                      │ Response ao Cliente:     │
                      │ "Senha resetada!"        │
                      │ Redireciona para login   │
                      └──────────────────────────┘
```

---

## Estrutura de Dados

### Token
```
┌───────────────────────────────────────────┐
│ Reset Token                               │
│ ───────────────────────────────────────── │
│ Tamanho: 32 bytes (256 bits)              │
│ Formato: Hex String (64 caracteres)       │
│ Geração: crypto.randomBytes(32)           │
│ Exemplo:                                  │
│ a1b2c3d4e5f6...xyz (64 chars)            │
│ ───────────────────────────────────────── │
│ Expiração: 1 hora após geração            │
│ Reutilização: Não, descartado após uso    │
└───────────────────────────────────────────┘
```

### Audit Log Entry
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": "550e8400-e29b-41d4-a716-446655440001",
  "action": "password_reset_requested",
  "details": {
    "email": "user@example.com",
    "expiresAt": "2026-04-20T14:30:00.000Z"
  },
  "ip_address": "192.168.1.100",
  "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)...",
  "created_at": "2026-04-20T13:30:00.000Z"
}
```

---

## Timelines

### Token Lifecycle
```
T+0m: Token criado
    └─> Válido por 1 hora
    
T+30m: Usuário clica no email
    └─> Valida token → OK
    └─> Mostra formulário
    
T+45m: Usuário submete nova senha
    └─> Valida token → OK (ainda válido)
    └─> Atualiza BD e anula token
    
T+1h: Token expira
    └─> Qualquer validação retorna erro
```

### Auditoria Completa
```
[13:30:00] password_reset_requested  (user_id: 123, email: user@ex.com)
[13:35:00] (nada - usuário visualiza email)
[13:45:00] password_reset_completed  (user_id: 123, email: user@ex.com)
[13:46:00] login_success             (user_id: 123)
```

---

## Segurança em Camadas

```
┌─────────────────────────────────────────┐
│ Layer 1: Geração de Token               │
│ - 256 bits de aleatoriedade             │
│ - crypto.randomBytes (sistema operativo)│
│ - Impossível prever                     │
└─────────────────────────────────────────┘
                ▼
┌─────────────────────────────────────────┐
│ Layer 2: Armazenamento                  │
│ - Armazenado em text plain no BD         │
│ - Comparado com timing-safe cmp         │
│ - Uma única vez (destruído após uso)    │
└─────────────────────────────────────────┘
                ▼
┌─────────────────────────────────────────┐
│ Layer 3: Expiração                      │
│ - 1 hora de validade                    │
│ - Timestamps precisos em UTC            │
│ - Validação em cada uso                 │
└─────────────────────────────────────────┘
                ▼
┌─────────────────────────────────────────┐
│ Layer 4: Password Hashing               │
│ - bcrypt (10 rounds default)            │
│ - Salt aleatório                        │
│ - Impossível fazer força bruta          │
└─────────────────────────────────────────┘
                ▼
┌─────────────────────────────────────────┐
│ Layer 5: Auditoria                      │
│ - IP registrado                         │
│ - User-Agent registrado                 │
│ - Timestamp exato                       │
│ - Detectar anomalias                    │
└─────────────────────────────────────────┘
```

---

## Tratamento de Erros

```
Request → Controller → Service → Database
                ↓        ↓        ↓
Email não existe? ──────────────> Log (sem error)
Token inválido? ─────────────────> Error: "Token inválido"
Token expirado? ─────────────────> Error: "Token expirado" + Log
Senha fraca? ───────────────────> Error: "Senha < 6 chars"
BD error? ──────────────────────> Error: "Erro ao resetar"
```

---

## Componentes Implementados

```
Backend:
├── auth.service.ts
│   ├── requestPasswordReset()
│   ├── validateResetToken()
│   └── resetPassword()
├── auth.controller.ts
│   ├── requestPasswordReset()
│   ├── validateResetToken()
│   └── resetPassword()
├── auth.routes.ts (3 rotas)
└── audit.service.ts
    ├── logActivity()
    └── getAuditLogs()

Frontend:
├── ResetPassword.tsx (Componente)
└── ResetPasswordPage.tsx (Página)

Database:
├── pfc_users (alterada)
│   ├── reset_token
│   └── reset_token_expires_at
└── pfc_audit_logs (nova)
```

---

## Performance & Load

```
Requisição típica: ~50-100ms
├── Validação: 1-5ms
├── Query ao BD: 20-50ms (com índices)
├── Hash de senha: 200-300ms (bcrypt)
└── Auditoria: 20-50ms

Índices criados:
├── idx_pfc_users_reset_token
├── idx_audit_logs_user_id
├── idx_audit_logs_action
├── idx_audit_logs_created_at
└── idx_audit_logs_user_created
```

---

Diagrama criado com ❤️ para PFC 2026
