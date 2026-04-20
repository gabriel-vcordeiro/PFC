-- =====================================================
-- SCRIPT PARA CRIAR/ATUALIZAR TABELAS NO SUPABASE
-- =====================================================

-- 1. ADICIONAR COLUNAS NA TABELA pfc_users PARA RECUPERAÇÃO DE SENHA
-- Execute este comando se a tabela já existe:

ALTER TABLE pfc_users 
ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255),
ADD COLUMN IF NOT EXISTS reset_token_expires_at TIMESTAMP WITH TIME ZONE;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_pfc_users_reset_token ON pfc_users(reset_token) 
WHERE reset_token IS NOT NULL;

-- =====================================================

-- 2. CRIAR TABELA DE AUDITORIA - pfc_audit_logs
-- Esta tabela registra todas as atividades do sistema

CREATE TABLE IF NOT EXISTS pfc_audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES pfc_users(id) ON DELETE SET NULL,
  action VARCHAR(50) NOT NULL,
  details JSONB NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON pfc_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON pfc_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON pfc_audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_created ON pfc_audit_logs(user_id, created_at DESC);

-- =====================================================

-- 3. OPCIONAL: CRIAR POLICY DE ROW LEVEL SECURITY
-- Para permitir que usuarios vejam apenas seus próprios logs

ALTER TABLE pfc_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own audit logs" ON pfc_audit_logs
  FOR SELECT
  USING (auth.uid() = user_id OR auth.uid()::text = 'admin');

-- =====================================================

-- 4. VERIFICAR AS COLUNAS CRIADAS

SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'pfc_users'
ORDER BY ordinal_position;

-- Para ver logs de auditoria
SELECT * FROM pfc_audit_logs 
ORDER BY created_at DESC 
LIMIT 10;

-- =====================================================
-- AÇÕES DE AUDITORIA QUE ESTÃO SENDO REGISTRADAS:
-- =====================================================
/*
- password_reset_requested: Quando o usuário solicita recuperação de senha
- password_reset_completed: Quando a senha é resetada com sucesso
- password_reset_failed: Quando a solicitação de reset falha
- password_reset_token_expired: Quando o token expira
- login_success: Login bem-sucedido
- login_failed: Tentativa de login falhou
- register_success: Registro bem-sucedido
- register_failed: Falha no registro
- account_locked: Conta bloqueada por múltiplas tentativas
- mfa_enabled: 2FA ativado
- mfa_disabled: 2FA desativado
- mfa_verified: Verificação 2FA bem-sucedida
- mfa_failed: Falha na verificação 2FA
*/
