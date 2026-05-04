import { supabase } from '../../db/supabase/client';

export enum AuditAction {
  PASSWORD_RESET_REQUESTED = 'password_reset_requested',
  PASSWORD_RESET_COMPLETED = 'password_reset_completed',
  PASSWORD_RESET_FAILED = 'password_reset_failed',
  PASSWORD_RESET_TOKEN_EXPIRED = 'password_reset_token_expired',
  LOGIN_SUCCESS = 'login_success',
  LOGIN_FAILED = 'login_failed',
  REGISTER_SUCCESS = 'register_success',
  REGISTER_FAILED = 'register_failed',
  ACCOUNT_LOCKED = 'account_locked',
  MFA_ENABLED = 'mfa_enabled',
  MFA_DISABLED = 'mfa_disabled',
  MFA_VERIFIED = 'mfa_verified',
  MFA_FAILED = 'mfa_failed'
}

export class AuditService {
  async logActivity(
    userId: string | null,
    action: AuditAction,
    details: Record<string, any>,
    ipAddress?: string,
    userAgent?: string
  ) {
    try {
      const { error } = await supabase
        .from('pfc_audit_logs')
        .insert([
          {
            user_id: userId,
            action,
            details: JSON.stringify(details),
            ip_address: ipAddress,
            user_agent: userAgent,
            created_at: new Date().toISOString()
          }
        ]);

      if (error) {
        console.error('Erro ao registrar auditoria:', error);
        // Não lançar erro para não interromper a operação principal
      }
    } catch (err) {
      console.error('Erro ao registrar auditoria:', err);
    }
  }

  async getAuditLogs(userId: string, limit = 50, offset = 0) {
    const { data, error } = await supabase
      .from('pfc_audit_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error('Erro ao buscar logs de auditoria');
    }

    return data;
  }
}

export const auditService = new AuditService();
