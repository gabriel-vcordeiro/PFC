# Fluxo de Autenticação

Este documento descreve os fluxos de autenticação implementados no sistema PFC: **Cadastro**, **Login com 2FA** e **Redefinição de Senha**.

---

## 1. Cadastro de Usuário

Endpoint: `POST /auth/register`

```mermaid
sequenceDiagram
    autonumber
    actor U as Usuário
    participant F as Frontend (React)
    participant API as API (Express)
    participant V as Validador (Zod)
    participant H as bcrypt
    participant DB as Supabase (PostgreSQL)
    participant AUD as AuditService

    U->>F: Preenche formulário (username, email, senha, consentimento)
    F->>API: POST /auth/register (HTTPS)
    API->>V: RegisterSchema.safeParse(body)
    alt Dados inválidos
        V-->>API: erro
        API-->>F: 400 "Dados inválidos."
    else Dados válidos
        API->>H: hashPassword(senha, SALT_ROUNDS)
        H-->>API: password_hash
        API->>DB: INSERT pfc_users
        alt Email duplicado
            DB-->>API: erro de duplicidade
            API->>AUD: REGISTER_FAILED
            API-->>F: 400 "Email já cadastrado."
        else Sucesso
            DB-->>API: user
            API->>DB: INSERT pfc_consents (LGPD)
            API->>AUD: REGISTER_SUCCESS (ip, user-agent)
            API-->>F: 201 user
        end
    end
```

**Pontos de segurança aplicados:**
- Validação de entrada com **Zod** (`RegisterSchema`).
- Senha armazenada como hash **bcrypt** (`BCRYPT_SALT_ROUNDS` configurável).
- Normalização do email para minúsculas (evita contas duplicadas).
- Registro de **consentimento LGPD** atômico (rollback do usuário caso falhe).
- Auditoria de tentativas (sucesso e falha) com IP e User-Agent.

---

## 2. Login com Autenticação em Dois Fatores (2FA)

Endpoints: `POST /auth/login` e `POST /auth/verify-2fa`

```mermaid
sequenceDiagram
    autonumber
    actor U as Usuário
    participant F as Frontend
    participant API as API
    participant DB as Supabase
    participant BC as bcrypt
    participant SP as speakeasy (TOTP)
    participant JWT as JWT
    participant AUD as AuditService

    U->>F: email + senha
    F->>API: POST /auth/login
    API->>DB: SELECT pfc_users WHERE email
    alt Usuário não existe
        API->>AUD: LOGIN_FAILED
        API-->>F: 401 "Credenciais inválidas."
    else Conta bloqueada (locked_until > now)
        API->>AUD: ACCOUNT_LOCKED
        API-->>F: 401 "Conta bloqueada temporariamente."
    else
        API->>BC: comparePassword(senha, hash)
        alt Senha incorreta
            API->>DB: failed_attempts++ (ou locked_until = now+15min se >=5)
            API->>AUD: LOGIN_FAILED
            API-->>F: 401 "Credenciais inválidas."
        else Senha correta
            API->>DB: failed_attempts=0
            API->>AUD: LOGIN_SUCCESS
            alt 2FA habilitado
                API-->>F: { requires_2fa: true, user }
                U->>F: código TOTP (6 dígitos)
                F->>API: POST /auth/verify-2fa
                API->>SP: totp.verify(secret_2fa, token, window=2)
                alt Código inválido
                    API-->>F: 401 "Código 2FA inválido."
                else Código válido
                    API->>JWT: generateToken({ userId }) exp=10m
                    API-->>F: { token, user }
                end
            else 2FA desabilitado
                API->>JWT: generateToken({ userId })
                API-->>F: { token, user }
            end
        end
    end
```

**Pontos de segurança aplicados:**
- Bloqueio de conta após **5 tentativas falhas** por **15 minutos** (`MAX_ATTEMPTS=5`, `LOCK_TIME=15min`).
- Mensagens de erro genéricas (não revelam se o e-mail existe).
- TOTP com `speakeasy` (RFC 6238), janela de tolerância de 2 períodos.
- JWT de curta duração (**10 minutos**), assinado com `JWT_SECRET`.
- Rate limit global: 100 req / 15 min por IP (`express-rate-limit`).

---

## 3. Redefinição de Senha

Endpoints: `POST /auth/request-password-reset`, `POST /auth/validate-reset-token`, `POST /auth/reset-password`

```mermaid
sequenceDiagram
    autonumber
    actor U as Usuário
    participant F as Frontend
    participant API as API
    participant DB as Supabase
    participant CR as crypto.randomBytes
    participant EM as EmailService (SendGrid)
    participant BC as bcrypt
    participant AUD as AuditService

    U->>F: Solicita "Esqueci minha senha"
    F->>API: POST /auth/request-password-reset (email)
    API->>DB: SELECT pfc_users WHERE email
    alt Email não existe
        API->>AUD: PASSWORD_RESET_FAILED
        API-->>F: Mensagem genérica (não revela existência)
    else Email existe
        API->>CR: randomBytes(32).toString('hex')
        CR-->>API: resetToken (256 bits)
        API->>DB: UPDATE reset_token, reset_token_expires_at (now+1h)
        API->>AUD: PASSWORD_RESET_REQUESTED
        API->>EM: sendPasswordResetEmail(token, expiresAt)
        EM-->>U: Email com link contendo token
    end

    U->>F: Acessa link de reset
    F->>API: POST /auth/validate-reset-token
    API->>DB: SELECT WHERE reset_token = ?
    alt Token inválido ou expirado
        API->>AUD: PASSWORD_RESET_TOKEN_EXPIRED
        API-->>F: 400 "Token inválido/expirado."
    else Token válido
        API-->>F: { valid: true, email }
        U->>F: Define nova senha
        F->>API: POST /auth/reset-password
        API->>BC: hashPassword(newPassword)
        API->>DB: UPDATE password, reset_token=null, reset_token_expires_at=null
        API->>AUD: PASSWORD_RESET_COMPLETED
        API->>EM: sendPasswordChangedEmail()
        API-->>F: 200 "Senha resetada com sucesso."
    end
```

**Pontos de segurança aplicados:**
- Token de reset gerado com `crypto.randomBytes(32)` (**256 bits de entropia**).
- Validade do token: **1 hora** (`RESET_TOKEN_EXPIRY`).
- Token invalidado após uso (campos `reset_token` e `reset_token_expires_at` zerados).
- Mensagem genérica quando o email não existe (evita user enumeration).
- Notificação por e-mail ao concluir a troca (detecção de uso indevido).

---

## 4. Acesso a Rotas Protegidas

```mermaid
sequenceDiagram
    autonumber
    actor U as Usuário autenticado
    participant F as Frontend
    participant MW as authMiddleware
    participant JWT as JWT
    participant CTRL as Controller

    U->>F: Ação que exige autenticação
    F->>MW: Request com header "Authorization: Bearer <token>"
    alt Sem header
        MW-->>F: 401 "Token não fornecido."
    else
        MW->>JWT: verifyToken(token)
        alt Token inválido/expirado
            JWT-->>MW: erro
            MW-->>F: 401 "Token inválido ou expirado."
        else Token válido
            JWT-->>MW: { userId }
            MW->>CTRL: req.user = { userId }; next()
            CTRL-->>F: 200 (recurso)
        end
    end
```
