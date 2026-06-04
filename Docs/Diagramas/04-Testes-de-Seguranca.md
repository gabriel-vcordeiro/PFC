# Testes de Segurança

Plano e casos de teste de segurança aplicáveis ao sistema PFC. Cobre testes **manuais**, **automatizados** e **ferramentas** recomendadas, mapeados ao OWASP ASVS / Top 10 e aos riscos catalogados em [Análise de Riscos](03-Analise-de-Riscos.md).

---

## 1. Estratégia de Testes

A estratégia combina quatro camadas complementares, executadas em sequência no pipeline de CI/CD:

**SAST (Análise Estática):** ferramentas como ESLint com plugin de segurança e Semgrep analisam o código-fonte em busca de padrões inseguros antes mesmo de executar a aplicação.

**SCA (Análise de Composição):** `npm audit` e Snyk verificam vulnerabilidades conhecidas nas dependências de terceiros.

**Testes funcionais de segurança:** casos de teste Jest e Supertest validam os comportamentos de segurança esperados (bloqueio de conta, rejeição de JWT inválido, etc.).

**DAST (Análise Dinâmica):** OWASP ZAP executa varreduras automatizadas contra o ambiente de staging após o deploy, identificando vulnerabilidades em tempo de execução.

---

## 2. Casos de Teste

### 2.1 Autenticação (Login)

| # | Caso | Resultado esperado |
|---|------|--------------------|
| T01 | Login com credenciais válidas | 200 + JWT (ou `requires_2fa`) |
| T02 | Login com senha incorreta | 401 "Credenciais inválidas." e `failed_attempts++` |
| T03 | Bloqueio após 5 tentativas | 6ª tentativa: 401 + `locked_until` setado para +15min |
| T04 | Acesso durante bloqueio com senha correta | 401 "Conta bloqueada temporariamente." |
| T05 | User enumeration | Mensagens e tempos indistinguíveis para e-mail inexistente vs. senha incorreta |
| T06 | Rate limit | 101 requisições em 15 min do mesmo IP retorna 429 |
| T07 | SQL Injection no e-mail | 400 Zod (formato inválido); sem vazamento de dados |
| T08 | Login sem HTTPS em produção | Redirect 301 para HTTPS |

### 2.2 2FA / TOTP

| # | Caso | Resultado esperado |
|---|------|--------------------|
| T09 | 2FA com código válido | 200 + JWT |
| T10 | 2FA com código inválido | 401 "Código 2FA inválido." |
| T11 | Replay do mesmo OTP em menos de 30s | 401 anti-replay (recomendado) |
| T12 | OTP de janela ±2 períodos | 200 |
| T13 | Tentativa de pular `/verify-2fa` | Endpoint nega acesso sem JWT final |
| T14 | Brute-force de OTP (100 tentativas/min) | Rate limit ou bloqueio temporário |

### 2.3 Cadastro

| # | Caso | Resultado esperado |
|---|------|--------------------|
| T15 | Registro válido | 201, hash bcrypt persistido (nunca o plaintext) |
| T16 | E-mail duplicado | 400 "Email já cadastrado." |
| T17 | Senha com menos de 6 caracteres | 400 "Dados inválidos." |
| T18 | Username com caracteres especiais | 400 (regex `^[a-zA-Z0-9_]+$`) |
| T19 | Registro sem aceite do consentimento (LGPD) | 400 "Consentimento deve ser aceito" |
| T20 | XSS no username ou e-mail | Resposta sanitizada; SPA não executa script |

### 2.4 Reset de Senha

| # | Caso | Resultado esperado |
|---|------|--------------------|
| T21 | Solicitar reset com e-mail existente | 200 genérico, token enviado por e-mail |
| T22 | Solicitar reset com e-mail inexistente | 200 genérico (não revela existência) |
| T23 | Validar token expirado (mais de 1h) | 400 "Token inválido/expirado." |
| T24 | Reusar token após reset bem-sucedido | 400 (token foi limpo do banco) |
| T25 | Verificação de entropia do token | Confirmar uso de `crypto.randomBytes(32)` — 256 bits |
| T26 | Reset com nova senha curta | 400 "Senha deve ter pelo menos 6 caracteres." |
| T27 | Token exposto no response da API | Falha de segurança (ver risco R13) |

### 2.5 Autorização / JWT

| # | Caso | Resultado esperado |
|---|------|--------------------|
| T28 | Rota protegida sem token | 401 "Token não fornecido." |
| T29 | Rota protegida com JWT expirado (mais de 10 min) | 401 "Token inválido ou expirado." |
| T30 | JWT assinado com chave errada | 401 |
| T31 | Algoritmo `none` (alg confusion) | 401 (jsonwebtoken rejeita por padrão) |
| T32 | Tampering do payload (userId trocado) | 401 (assinatura inválida) |
| T33 | CORS de origem não autorizada | Preflight bloqueado |

### 2.6 Auditoria / Logs

| # | Caso | Resultado esperado |
|---|------|--------------------|
| T34 | Login bem-sucedido gera `LOGIN_SUCCESS` | Linha com `ip_address`, `user_agent`, `created_at` e `integrity_hash` preenchido |
| T35 | Bloqueio de conta gera `ACCOUNT_LOCKED` | Linha de auditoria correspondente |
| T36 | Detalhes não contêm senha em claro | Verificar JSON `details` |
| T37 | Adulteração de log detectável | Alterar qualquer campo do log e recalcular HMAC — hashes devem divergir |

---

## 3. Exemplos de Implementação

### 3.1 Unit — senha nunca persistida em claro (Jest)

```ts
import { hashPassword, comparePassword } from '../src/utils/hash';

test('hashPassword gera hash bcrypt valido', async () => {
  const hash = await hashPassword('SenhaForte!123');
  expect(hash).not.toBe('SenhaForte!123');
  expect(hash.startsWith('$2')).toBe(true);
  expect(await comparePassword('SenhaForte!123', hash)).toBe(true);
});
```

### 3.2 Integration — bloqueio após 5 tentativas (Supertest)

```ts
import request from 'supertest';
import app from '../src/app';

test('bloqueia conta apos 5 tentativas invalidas', async () => {
  for (let i = 0; i < 5; i++) {
    await request(app).post('/auth/login').send({ email: 'u@test.io', password: 'errada' });
  }
  const res = await request(app).post('/auth/login').send({ email: 'u@test.io', password: 'CorretaXyz!' });
  expect(res.status).toBe(401);
  expect(res.body.error).toMatch(/bloqueada/i);
});
```

### 3.3 JWT tampering

```ts
import jwt from 'jsonwebtoken';
import request from 'supertest';
import app from '../src/app';

test('rejeita JWT assinado com chave errada', async () => {
  const fake = jwt.sign({ userId: 'admin' }, 'segredo-falso', { expiresIn: '1h' });
  const res = await request(app).get('/users/me').set('Authorization', `Bearer ${fake}`);
  expect(res.status).toBe(401);
});
```

### 3.4 DAST — OWASP ZAP em CI

```yaml
name: ZAP Baseline Scan
on: [workflow_dispatch]
jobs:
  zap:
    runs-on: ubuntu-latest
    steps:
      - uses: zaproxy/action-baseline@v0.12.0
        with:
          target: https://staging.pfc.app
          cmd_options: '-a -j'
```

### 3.5 SCA

```bash
npm audit --omit=dev --audit-level=high
npx snyk test
```

---

## 4. Critérios de Aceitação

- **0 vulnerabilidades** críticas ou altas em `npm audit` na branch principal.
- **100%** dos casos T01–T37 passando no pipeline.
- ZAP Baseline sem alertas **High**.
- Cobertura mínima de **80%** nas rotas e serviços do módulo `auth`.
- Checklist OWASP **ASVS Nível 2** revisado antes de cada release.

---

## 5. Ferramentas Recomendadas

| Tipo | Ferramenta |
|------|-----------|
| SAST | ESLint + `eslint-plugin-security`, Semgrep, SonarQube |
| SCA | `npm audit`, Snyk, Dependabot, Renovate |
| DAST | OWASP ZAP, Burp Suite, Nuclei |
| Secret scanning | gitleaks, GitHub Advanced Security |
| E2E | Playwright (com cenários de login/2FA/reset) |
| Monitoramento | Logs estruturados + alertas em `LOGIN_FAILED` / `ACCOUNT_LOCKED` |
