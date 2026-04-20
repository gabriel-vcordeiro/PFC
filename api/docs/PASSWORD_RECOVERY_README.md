# 🔐 Sistema de Recuperação de Senha

Este documento descreve a implementação do sistema de recuperação de senha com token temporário e auditoria.

## 📋 Funcionalidades Implementadas

### 1. **Recuperação por Token Temporário com Expiração** (5 pts)
- ✅ Geração de token aleatório seguro (32 bytes hex)
- ✅ Token com expiração de 1 hora
- ✅ Validação de token antes de resetar a senha
- ✅ Prevenção de reutilização de tokens

### 2. **Registro e Auditoria do Processo** (2 pts)
- ✅ Tabela `pfc_audit_logs` para registrar todas as atividades
- ✅ Log de solicitudes de reset de senha
- ✅ Log de resets bem-sucedidos
- ✅ Log de tokens expirados
- ✅ Registro de IP e User Agent

## 🔧 Endpoints da API

### 1. Solicitar Recuperação de Senha
```
POST /auth/request-password-reset
Content-Type: application/json

{
  "email": "usuario@exemplo.com"
}

Response (200):
{
  "message": "Se o email existir, você receberá um link de recuperação.",
  "resetToken": "token_hash_aqui",
  "expiresAt": "2026-04-20T14:30:00.000Z"
}
```

### 2. Validar Token de Reset
```
POST /auth/validate-reset-token
Content-Type: application/json

{
  "resetToken": "token_hash_aqui"
}

Response (200):
{
  "valid": true,
  "email": "usuario@exemplo.com"
}

Response (400):
{
  "error": "Token de recuperação inválido." ou "Token de recuperação expirado."
}
```

### 3. Resetar Senha
```
POST /auth/reset-password
Content-Type: application/json

{
  "resetToken": "token_hash_aqui",
  "newPassword": "nova_senha_segura"
}

Response (200):
{
  "message": "Senha resetada com sucesso."
}

Response (400):
{
  "error": "Senha deve ter pelo menos 6 caracteres."
}
```

## 🗄️ Estrutura do Banco de Dados

### Tabela `pfc_users` (modificações)
```sql
ALTER TABLE pfc_users 
ADD COLUMN reset_token VARCHAR(255),
ADD COLUMN reset_token_expires_at TIMESTAMP WITH TIME ZONE;
```

### Tabela `pfc_audit_logs` (nova)
```sql
CREATE TABLE pfc_audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES pfc_users(id),
  action VARCHAR(50) NOT NULL,
  details JSONB NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 📊 Tipos de Eventos Auditados

| Ação | Descrição |
|------|-----------|
| `password_reset_requested` | Usuário solicitou recuperação de senha |
| `password_reset_completed` | Senha foi resetada com sucesso |
| `password_reset_failed` | Falha na solicitação de reset |
| `password_reset_token_expired` | Token expirou |
| `login_success` | Login bem-sucedido |
| `login_failed` | Falha na tentativa de login |
| `account_locked` | Conta bloqueada por múltiplas tentativas |
| `mfa_enabled` | 2FA foi ativado |
| `mfa_disabled` | 2FA foi desativado |

## 🚀 Como Usar

### No Frontend (React)

```typescript
// 1. Solicitar reset de senha
const requestReset = async (email: string) => {
  const response = await axios.post('/auth/request-password-reset', { email });
  // Mostrar mensagem: "Verifique seu email"
};

// 2. Validar token (quando usuário clica no link do email)
const validateToken = async (token: string) => {
  try {
    await axios.post('/auth/validate-reset-token', { resetToken: token });
    // Mostrar formulário de nova senha
  } catch (error) {
    // Token inválido ou expirado
  }
};

// 3. Resetar a senha
const resetPassword = async (token: string, newPassword: string) => {
  const response = await axios.post('/auth/reset-password', {
    resetToken: token,
    newPassword
  });
  // Redirecionar para login
};
```

## ⚠️ Considerações de Segurança

1. **Token Temporário**: 
   - Gerado com `crypto.randomBytes(32)` (256 bits)
   - Expiração de 1 hora
   - Nunca reutilizável

2. **Confidencialidade**:
   - Não revelar se email existe (mesmo em erro)
   - Hash da senha com bcrypt
   - Token armazenado no BD (não enviado direto)

3. **Auditoria**:
   - IP do cliente registrado
   - User Agent registrado
   - Timestamp de todas as ações
   - Rastreabilidade total

## 📝 Próximos Passos

Para completar a implementação:

1. **Adicionar tabelas no Supabase**:
   - Execute o script `DATABASE_SETUP.sql`

2. **Implementar Envio de Email**:
   - Integrar com SendGrid, Resend ou similar
   - Enviar link: `https://seu-frontend.com/reset-password?token={token}`

3. **Criar Página de Reset no Frontend**:
   - Componente `ResetPassword.tsx`
   - Validar token ao carregar
   - Formulário com nova senha

4. **Testes**:
   - Testar todo o fluxo de recuperação
   - Validar logs de auditoria
   - Testar expiração de token

## 📦 Arquivos Modificados

- `api/src/modules/auth/auth.services.ts` - Adicionado métodos de reset
- `api/src/modules/auth/auth.controller.ts` - Adicionado controladores
- `api/src/modules/auth/auth.routes.ts` - Adicionadas rotas
- `api/src/services/audit.service.ts` - Novo serviço de auditoria
- `api/src/utils/generate-reset-token.ts` - Geração de token
- `api/docs/DATABASE_SETUP.sql` - Script SQL

## ✅ Checklist de Implementação

- [x] Geração de token temporário (32 bytes)
- [x] Expiração de token (1 hora)
- [x] Validação de token
- [x] Reset de senha
- [x] Auditoria de requisições
- [x] Registro de IP e User Agent
- [x] Endpoints da API
- [ ] Envio de email (a fazer)
- [ ] Página de reset no frontend (a fazer)
- [ ] Testes automatizados (a fazer)

## 🔗 Referências

- [Supabase SQL Editor](https://supabase.com/)
- [bcrypt.js](https://github.com/dcodeIO/bcrypt.js)
- [crypto module Node.js](https://nodejs.org/api/crypto.html)
