# Resumo Visual para Pôster — Sistema PFC

Documento-síntese com **prévias compactas** dos principais diagramas e textos curtos prontos para um pôster acadêmico. Cada bloco já está dimensionado para caber em uma seção do pôster (A1/A0).

> Diagramas completos: [01-Fluxo](Docs/01-Fluxo-de-Autenticacao.md) · [02-Arquitetura](Docs/02-Arquitetura-do-Sistema.md) · [03-Riscos](Docs/03-Analise-de-Riscos.md) · [04-Testes](Docs/04-Testes-de-Seguranca.md) · [05-Criptografia](Docs/05-Criptografia-do-Sistema.md)

---

## 1. Cabeçalho do Pôster (texto pronto)

> **Sistema PFC – Autenticação Segura com 2FA e LGPD**
> Aplicação web full-stack (React + Node/Express + Supabase) que implementa cadastro com consentimento, login com segundo fator TOTP, redefinição de senha por token criptográfico e auditoria completa de eventos — seguindo recomendações do OWASP Top 10 e da LGPD.

**Palavras-chave:** autenticação · 2FA · bcrypt · JWT · TOTP · LGPD · OWASP

---

## 2. Fluxo de Autenticação (prévia)

```mermaid
flowchart LR
    U([Usuário]) -->|email + senha| L[Login]
    L -->|bcrypt OK| Q{2FA?}
    Q -- não --> JWT[Emite JWT 10 min]
    Q -- sim --> T[Verifica TOTP]
    T -->|válido| JWT
    JWT --> APP[Acesso autorizado]

    U -. esqueci .-> RR[Solicita reset]
    RR --> TK[Token 256 bits · 1h]
    TK --> EM[E-mail SendGrid]
    EM --> RP[Define nova senha · bcrypt]
```

**Destaques (3 bullets para o pôster):**
- Senha protegida com **bcrypt** (salt único + custo adaptativo).
- **2FA TOTP** (RFC 6238) compatível com Google Authenticator/Authy.
- Bloqueio automático após **5 tentativas** por **15 minutos**.

---

## 3. Arquitetura do Sistema (prévia)

```mermaid
flowchart LR
    U([Usuário]) -->|HTTPS| FE[Frontend React<br/>Vercel]
    FE -->|JWT Bearer| API[API Express<br/>Render]
    API --> DB[(Supabase<br/>PostgreSQL)]
    API --> SG[SendGrid]
    U -. TOTP .-> APP[App Autenticador]
```

**Destaques:**
- **Camadas:** Apresentação (React) → Aplicação (Express modular) → Dados (Supabase).
- **Modular por feature:** `auth`, `user`, `consent`, `audit`, `email`.
- **Deploy:** Vercel (front) + Render (API) + Supabase (DB gerenciado).

---

## 4. Análise de Riscos (prévia)

```mermaid
quadrantChart
    title Probabilidade x Impacto
    x-axis Baixa --> Alta
    y-axis Baixo --> Alto
    quadrant-1 Crítico
    quadrant-2 Monitorar
    quadrant-3 Aceitável
    quadrant-4 Prioridade
    Brute force: [0.5, 0.8]
    JWT vazado: [0.5, 0.8]
    Dependências: [0.75, 0.6]
    Config insegura: [0.75, 0.8]
    Segredo 2FA: [0.55, 0.8]
```

**Top 5 riscos tratados:**
1. **Brute force** → rate limit + bloqueio de conta.
2. **Sequestro de JWT** → expiração curta (10 min) + HTTPS + CORS.
3. **User enumeration** → mensagens genéricas.
4. **LGPD** → consentimento obrigatório + auditoria.
5. **Reset de senha** → token de 256 bits, uso único, expira em 1 h.

---

## 5. Testes de Segurança (prévia)

```mermaid
flowchart LR
    SAST[SAST<br/>ESLint · Semgrep] --> CI
    SCA[SCA<br/>npm audit · Snyk] --> CI
    UNIT[Unit · Jest] --> CI
    INT[Integration · Supertest] --> CI
    CI[CI/CD] --> DEP[Deploy]
    DEP --> DAST[DAST<br/>OWASP ZAP]
    DEP --> PEN[Pentest<br/>ASVS]
```

**Cobertura:**
- **36 casos de teste** mapeados (login, 2FA, cadastro, reset, JWT, auditoria).
- Critério: **0 vulnerabilidades High** no `npm audit` e no **OWASP ZAP**.
- Meta: **≥ 80%** de cobertura no módulo `auth`.

---

## 6. Criptografia (prévia)

```mermaid
flowchart LR
    SENHA[Senha] --> BC["bcrypt<br/>SALT + cost"] --> DB1[(DB)]
    SES[Sessão] --> JWT["JWT HS256<br/>exp 10 min"]
    F2A[2FA] --> TOTP["HMAC-SHA1<br/>RFC 6238"]
    RST[Reset] --> RB["crypto.randomBytes(32)<br/>256 bits · 1h"] --> DB1
    NET[Tráfego] --> TLS["TLS 1.2/1.3"]
```

**Resumo numérico (ideal para o pôster):**

| Item | Algoritmo | Tamanho |
|------|-----------|---------|
| Senha | bcrypt | salt 128 bits · cost ≥ 10 |
| JWT | HMAC-SHA256 | exp **10 min** |
| 2FA | TOTP / HMAC-SHA1 | segredo 160 bits · janela 30 s |
| Reset | CSPRNG | **256 bits** · validade **1 h** |
| Transporte | TLS | 1.2 / 1.3 |

---

## 7. Sugestão de Layout do Pôster

```mermaid
flowchart TB
    H["TÍTULO + AUTORES + LOGO"]:::h
    subgraph Linha1[" "]
        A[1. Introdução<br/>Objetivo + LGPD]:::s
        B[2. Arquitetura<br/>diagrama §3]:::s
        C[3. Fluxo de Autenticação<br/>diagrama §2]:::s
    end
    subgraph Linha2[" "]
        D[4. Criptografia<br/>tabela + diagrama §6]:::s
        E[5. Análise de Riscos<br/>matriz §4]:::s
        F[6. Testes<br/>pipeline §5]:::s
    end
    G[7. Conclusão + Referências + QR Code do repositório]:::h
    H --> Linha1 --> Linha2 --> G

    classDef h fill:#1c3d5a,stroke:#fff,color:#fff
    classDef s fill:#eaf3fb,stroke:#1c6dd0,color:#000
```

**Dicas de apresentação:**
- Use as **prévias** deste documento como figuras finais (exporte SVG via [Mermaid Live](https://mermaid.live)).
- Cada seção do pôster = **1 diagrama + 3 bullets** (regra dos 3).
- Reserve um **QR Code** apontando para o repositório / documentação.
- Paleta sugerida: azul-marinho (cabeçalho) + azul claro (blocos) + branco (fundo).

---

## 8. Frases curtas para "selos" do pôster

- "Senhas nunca em claro — **bcrypt** sempre."
- "Sessão de **10 minutos** + bloqueio após 5 tentativas."
- "**2FA TOTP** offline com qualquer autenticador."
- "Reset com **256 bits** de entropia e validade de 1 hora."
- "Auditoria completa: cada evento sensível é registrado."
- "Conformidade com **LGPD** desde o cadastro."
