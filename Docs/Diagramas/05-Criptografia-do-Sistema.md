# Criptografia do Sistema

Este documento mapeia todos os usos de criptografia no sistema PFC: **em trânsito**, **em repouso**, **hashing**, **assinatura** e **geração de números aleatórios**. Cada algoritmo é justificado e acompanhado das recomendações de hardening.

---

## 1. Visão Geral

O sistema aplica criptografia em três momentos distintos:

**Em trânsito:** toda comunicação entre browser, API e Supabase ocorre sobre HTTPS/TLS 1.2+. Não há tráfego sensível em texto claro em nenhuma camada.

**Em repouso:** senhas são armazenadas exclusivamente como hashes bcrypt. O banco de dados Supabase aplica AES-256 no disco. Backups também são criptografados pelo provedor.

**Em uso:** tokens JWT assinados com HMAC-SHA256 controlam as sessões. Códigos 2FA são gerados via TOTP (RFC 6238). Logs de auditoria de usuários autenticados recebem um HMAC-SHA256 no momento da inserção para garantir integridade.

---

## 2. Inventário Criptográfico

| Componente | Onde | Algoritmo | Tamanho / Parâmetros | Biblioteca | Finalidade |
|------------|------|-----------|----------------------|------------|------------|
| TLS Frontend a API | Vercel / Render | TLS 1.2/1.3 (ECDHE + AES-GCM) | 128/256 bits | Plataforma | Confidencialidade e integridade em trânsito |
| Hash de senha | `hash.ts` | **bcrypt** (Blowfish-based KDF) | `BCRYPT_SALT_ROUNDS` (>= 10) | `bcrypt` | Armazenamento seguro de senha |
| Assinatura de sessão | `jwt.ts` | **HMAC-SHA256 (HS256)** | Segredo simétrico `JWT_SECRET` | `jsonwebtoken` | Autenticidade do JWT (exp 10 min) |
| 2FA TOTP | `auth.service.ts` | **HMAC-SHA1 (RFC 6238)** | Segredo 160 bits, janela 30 s | `speakeasy` | Segundo fator de autenticação |
| Token de reset | `generate-reset-token.ts` | **CSPRNG** (`crypto.randomBytes`) | 32 bytes = 256 bits | Node `crypto` | Reset de senha (uso único, 1 h) |
| Integridade de logs | `audit.service.ts` | **HMAC-SHA256** | Chave = `JWT_SECRET` | Node `crypto` | Proteção contra adulteração dos logs de auditoria (LGPD) |
| Banco de dados | Supabase | **AES-256** em repouso, **TLS** em trânsito | Gerenciado | Supabase | Confidencialidade dos dados persistidos |

---

## 3. Fluxos Criptográficos

### 3.1 Senha de Usuário (registro / login / reset)

No cadastro e no reset, a senha em texto claro chega à API sobre TLS e é imediatamente processada pelo bcrypt, que gera um salt aleatório de 128 bits embutido no hash resultante. Apenas o hash é persistido — a senha original nunca é armazenada.

No login, o hash armazenado é recuperado do banco e comparado com a senha fornecida usando `bcrypt.compare`, que opera em tempo constante para mitigar timing attacks.

**Formato do hash:** `$2b$<custo>$<22 chars salt><31 chars hash>`

**Propriedades:**
- Salt único por hash (embutido no formato).
- Custo adaptativo — `cost = 10` resulta em ~100 ms por hash; aumentar com hardware mais rápido.
- Comparação em tempo constante.

### 3.2 JWT (HS256)

O JWT é composto por três partes separadas por ponto: header e payload em Base64Url, seguidos de uma assinatura HMAC-SHA256.

Formato: `Base64Url(header).Base64Url(payload).HMAC_SHA256(header.payload, JWT_SECRET)`

O payload contém apenas `{ userId, iat, exp }`. A expiração de 10 minutos limita o impacto de um token roubado. O algoritmo `alg: none` é rejeitado automaticamente pelo `jsonwebtoken`.

**Recomendação:** migrar para RS256 ou EdDSA (par de chaves assimétrico) para que serviços possam verificar tokens sem ter acesso à chave de assinatura.

### 3.3 TOTP — 2FA (RFC 6238)

Um segredo aleatório é gerado pelo `speakeasy` e apresentado ao usuário como QR Code no formato `otpauth://totp/PFC:user?secret=BASE32&issuer=PFC`. O aplicativo autenticador usa esse segredo para derivar um código de 6 dígitos a cada 30 segundos via HOTP:

`TOTP(t) = HOTP(secret, floor(unix_time / 30)) mod 10^6`

A verificação na API usa janela de tolerância de 2 períodos (±60 s) para compensar dessincronização de relógio.

**Risco residual:** o `secret_2fa` é armazenado em base32 no banco. Recomenda-se criptografá-lo em repouso com AES-256-GCM.

### 3.4 Token de Reset de Senha

O token é gerado com `crypto.randomBytes(32).toString('hex')`, resultando em 64 caracteres hexadecimais com 256 bits de entropia. Ele é armazenado no banco junto com a data de expiração (now + 1h) e invalidado após o primeiro uso bem-sucedido.

**Recomendação:** armazenar `SHA-256(token)` no banco em vez do token em claro, reduzindo o impacto de um vazamento do banco de dados.

### 3.5 Integridade dos Logs de Auditoria (HMAC-SHA256)

Ao registrar um evento de um usuário autenticado, o `AuditService` serializa os campos do log em JSON, calcula um HMAC-SHA256 com o `JWT_SECRET` como chave e persiste o resultado no campo `integrity_hash`.

Para verificar a integridade de um log, basta recalcular o HMAC com os mesmos campos e comparar com o hash armazenado. Se qualquer campo tiver sido alterado, os hashes divergirão — tornando a adulteração detectável e a auditoria incontestável para fins de LGPD.

Logs de eventos sem usuário autenticado (ex.: tentativas com e-mail inexistente) recebem `integrity_hash = null`.

---

## 4. Camadas de Proteção

| Camada | Mecanismo |
|--------|----------|
| Em trânsito | TLS 1.2/1.3 em todas as conexões (Vercel, Render, Supabase, SendGrid) |
| Senhas | bcrypt com salt único e custo adaptativo |
| Sessões | JWT HS256 com expiração de 10 minutos |
| 2FA | TOTP HMAC-SHA1 com janela de 30 segundos |
| Reset | CSPRNG 256 bits, uso único, expira em 1 hora |
| Logs | HMAC-SHA256 por registro para integridade auditável (LGPD) |
| Banco | AES-256 em repouso + TLS em trânsito (Supabase gerenciado) |

---

## 5. Boas Práticas e Recomendações

1. **Rotação de chaves:** definir cronograma para `JWT_SECRET`; considerar versionamento com `kid` no header.
2. **Migrar JWT para RS256/EdDSA** com par de chaves; chave pública distribuída, privada em KMS.
3. **Criptografar `secret_2fa`** com AES-256-GCM e chave gerenciada (Render Secret Files, AWS KMS, Vault).
4. **Hash do `reset_token`** antes de persistir (`crypto.createHash('sha256').update(token).digest('hex')`).
5. **Aumentar `BCRYPT_SALT_ROUNDS` para 12** em produção (~250 ms/hash).
6. **HSTS + TLS 1.3** obrigatórios; certificados gerenciados pelo provedor.
7. **Cookies HttpOnly + Secure + SameSite=Strict** para armazenar o JWT em vez de `localStorage`.
8. **Logging seguro:** nunca registrar segredos, tokens ou senhas em `pfc_audit_logs`.
9. **Integridade dos logs:** cada registro de usuário autenticado recebe um `integrity_hash` (HMAC-SHA256) calculado no momento da inserção. Qualquer alteração posterior nos campos do log invalida o hash, tornando a auditoria incontestável para fins de LGPD.
10. **Auditoria criptográfica** periódica (Mozilla SSL Test, `testssl.sh`).

---

## 6. Referências

- OWASP **ASVS v4** — V2 Authentication, V6 Cryptography
- NIST **SP 800-63B** — Digital Identity Guidelines
- RFC **6238** — TOTP
- RFC **7519** — JSON Web Token
- OWASP **Password Storage Cheat Sheet**
