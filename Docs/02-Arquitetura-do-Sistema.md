# Arquitetura do Sistema

Este documento apresenta a visão arquitetural do sistema PFC, composto por uma **SPA React** (frontend), uma **API Node.js/Express** (backend) e o **Supabase (PostgreSQL)** como camada de persistência, além de serviços externos para envio de e-mails.

---

## 1. Visão Geral (C4 - Contexto / Containers)

```mermaid
flowchart LR
    User([Usuário]):::actor

    subgraph Cliente["Camada de Apresentação"]
        FE["Frontend (React + Vite + Tailwind)<br/>Vercel<br/>Auth Context · Axios · React Router"]:::front
    end

    subgraph Servidor["Camada de Aplicação"]
        API["API REST (Node.js + Express + TypeScript)<br/>Render<br/>Rate Limit · CORS · Auth Middleware"]:::back
        subgraph Modules["Módulos da API"]
            MAUTH[auth]
            MUSER[user]
            MCONS[consent]
            MAUD[audit]
            MEMAIL[email]
        end
    end

    subgraph Dados["Camada de Dados"]
        DB[(Supabase / PostgreSQL<br/>pfc_users · pfc_audit_logs · pfc_consents)]:::db
    end

    subgraph Externos["Serviços Externos"]
        SG[SendGrid<br/>Envio de e-mails]:::ext
        TOTP[Aplicativo TOTP<br/>Google Authenticator / Authy]:::ext
    end

    User -- HTTPS/TLS --> FE
    FE -- HTTPS / JWT Bearer --> API
    API --> MAUTH & MUSER & MCONS & MAUD & MEMAIL
    MAUTH -. SQL/HTTPS .-> DB
    MUSER -. SQL/HTTPS .-> DB
    MCONS -. SQL/HTTPS .-> DB
    MAUD -. SQL/HTTPS .-> DB
    MEMAIL -- HTTPS API --> SG
    SG -- e-mail --> User
    User -- gera código --> TOTP

    classDef actor fill:#f5d76e,stroke:#b58900,color:#000
    classDef front fill:#a3d5ff,stroke:#1c6dd0,color:#000
    classDef back  fill:#b6e2b6,stroke:#2e7d32,color:#000
    classDef db    fill:#e0bbe4,stroke:#6a1b9a,color:#000
    classDef ext   fill:#ffd6a5,stroke:#bf6b04,color:#000
```

---

## 2. Arquitetura em Camadas (Backend)

A API segue uma estrutura modular orientada a domínio (`modules/<feature>`), com separação clara entre **Rota → Controller → Service → Repositório (Supabase Client)**.

```mermaid
flowchart TB
    subgraph EntryPoint["Entry Point"]
        S[server.ts]
        A[app.ts<br/>cors · json · rateLimit]
    end

    subgraph Routing["Routing Layer"]
        R[routes/index.ts]
        R1[auth.routes]
        R2[user.routes]
        R3[consent.routes]
    end

    subgraph Middlewares
        MW[authMiddleware<br/>verifyToken JWT]
    end

    subgraph Controllers
        C1[AuthController]
        C2[UserController]
        C3[ConsentController]
    end

    subgraph Services["Services / Regras de Negócio"]
        SV1[AuthService]
        SV2[UserService]
        SV3[ConsentService]
        SV4[AuditService]
        SV5[EmailService]
    end

    subgraph Utils
        U1[hash.ts · bcrypt]
        U2[jwt.ts · jsonwebtoken]
        U3[generate-reset-token.ts · crypto]
        U4[requestHelper.ts]
    end

    subgraph DTO["Validação (Zod)"]
        D1[auth.dto · RegisterSchema · LoginSchema]
        D2[consent.dto]
    end

    subgraph Persistencia
        SB[db/supabase/client.ts]
        PG[(PostgreSQL · Supabase)]
    end

    S --> A --> R --> R1 & R2 & R3
    R1 --> MW --> C1
    R1 --> C1
    R2 --> MW --> C2
    R3 --> MW --> C3
    C1 -. valida .-> D1
    C3 -. valida .-> D2
    C1 --> SV1
    C2 --> SV2
    C3 --> SV3
    SV1 --> U1 & U2 & U3
    SV1 --> SV4 & SV5
    SV1 & SV2 & SV3 & SV4 --> SB --> PG
```

---

## 3. Modelo de Dados (principais tabelas)

```mermaid
erDiagram
    PFC_USERS ||--o{ PFC_AUDIT_LOGS : "gera"
    PFC_USERS ||--o{ PFC_CONSENTS  : "registra"

    PFC_USERS {
        uuid id PK
        string username
        string email "unique, lowercase"
        string password "bcrypt hash"
        bool is_2fa_enabled
        string secret_2fa "base32 TOTP"
        int failed_attempts
        timestamp locked_until
        string reset_token "hex 64 chars"
        timestamp reset_token_expires_at
        timestamp created_at
    }

    PFC_AUDIT_LOGS {
        uuid id PK
        uuid user_id FK
        string action "enum AuditAction"
        jsonb details
        string ip_address
        string user_agent
        timestamp created_at
    }

    PFC_CONSENTS {
        uuid id PK
        uuid user_id FK
        bool consentimento_aceito
        string consentimento_finalidade
        string consentimento_versao "X.Y.Z"
        timestamp created_at
    }
```

---

## 4. Implantação (Deployment)

```mermaid
flowchart LR
    subgraph Browser["Navegador do Usuário"]
        B[Cliente React SPA]
    end

    subgraph Vercel["Vercel (CDN + Edge)"]
        FEDeploy[Build estático Vite<br/>HTTPS/TLS 1.3]
    end

    subgraph Render["Render (Web Service)"]
        APIDeploy["Node 20<br/>Express API<br/>HTTPS/TLS"]
    end

    subgraph SupabaseCloud["Supabase Cloud"]
        SUPA[PostgreSQL gerenciado<br/>TLS · Row Level Security]
    end

    subgraph SaaS["SaaS Externo"]
        SGAPI[SendGrid API]
    end

    B -- HTTPS --> FEDeploy
    B -- HTTPS / fetch --> APIDeploy
    APIDeploy -- HTTPS --> SUPA
    APIDeploy -- HTTPS --> SGAPI
```

**Variáveis de ambiente principais** (`api/.env`):
`PORT`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `JWT_SECRET`, `BCRYPT_SALT_ROUNDS`, `EMAIL_FROM`, `SENDGRID_API_KEY`, `FRONTEND_URL`.

---

## 5. Padrões e Decisões Arquiteturais

| Decisão | Justificativa |
|---|---|
| **Modular por feature** (`modules/auth`, `modules/user`, …) | Alta coesão, baixo acoplamento, fácil evolução. |
| **Validação com Zod nas DTOs** | Garante contratos de entrada antes de tocar a camada de serviço. |
| **JWT stateless (10 min)** | Reduz superfície de ataque; força renovação frequente. |
| **bcrypt** para senhas | Algoritmo adaptativo padrão da indústria; resistente a brute-force. |
| **TOTP (RFC 6238) via speakeasy** | 2FA off-line, compatível com Google Authenticator / Authy. |
| **Auditoria centralizada** (`AuditService`) | Rastreabilidade exigida pela LGPD e detecção de incidentes. |
| **Rate Limit global** | Mitiga brute-force, scraping e DoS de aplicação. |
| **CORS restrito ao `FRONTEND_URL`** | Bloqueia origens não autorizadas. |
| **Supabase (PostgreSQL gerenciado)** | Backups, criptografia em repouso e em trânsito out-of-the-box. |
