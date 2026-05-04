import { supabase } from '../../db/supabase/client';
import { hashPassword, comparePassword } from '../../utils/hash';
import { generateToken } from '../../utils/jwt';
import { generateResetToken } from '../../utils/generate-reset-token';
import { auditService, AuditAction } from '../audit/audit.service';
import { emailService } from '../email/email.service';
import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';

const MAX_ATTEMPTS = 5;
const LOCK_TIME = 15 * 60 * 1000; //15 min de bloqueio
const RESET_TOKEN_EXPIRY = 1 * 60 * 60 * 1000; // 1 hora

export class AuthService {

  async register(email: string, password: string, ipAddress?: string, userAgent?: string) {

    const password_hash = await hashPassword(password);

    const { data, error } = await supabase
      .from('pfc_users')
      .insert([{ email, password:password_hash, is_2fa_enabled: false, secret_2fa: null }])
      .select()
      .single();

    if (error) {
      await auditService.logActivity(null, AuditAction.REGISTER_FAILED, {
        email,
        reason: error.message
      }, ipAddress, userAgent);

      if (error.message.includes('duplicate')) {
        throw new Error('Email já cadastrado.');
      }
      throw new Error('Erro ao registrar usuário!');
    }

    await auditService.logActivity(data.id, AuditAction.REGISTER_SUCCESS, {
      email: data.email
    }, ipAddress, userAgent);

    return data;
  }

  // 🔐 LOGIN
  async login(email: string, password: string, ipAddress?: string, userAgent?: string) {

    const { data: user, error } = await supabase
      .from('pfc_users')
      .select('*')
      .eq('email', email)
      .single();

    if (!user || error) {
      await auditService.logActivity(null, AuditAction.LOGIN_FAILED, {
        email,
        reason: 'Usuário não encontrado'
      }, ipAddress, userAgent);
      throw new Error('Credenciais inválidas.');
    }

    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      await auditService.logActivity(user.id, AuditAction.ACCOUNT_LOCKED, {
        email: user.email,
        lockedUntil: user.locked_until
      }, ipAddress, userAgent);
      throw new Error('Conta bloqueada temporariamente. Tente novamente mais tarde.');
    }

    const isValid = await comparePassword(password, user.password);

    if (!isValid) {
      await this.handleFailedLogin(user);
      await auditService.logActivity(user.id, AuditAction.LOGIN_FAILED, {
        email: user.email,
        reason: 'Senha inválida'
      }, ipAddress, userAgent);
      throw new Error('Credenciais inválidas.');
    }

    await supabase
      .from('pfc_users')
      .update({
        failed_attempts: 0,
        locked_until: null
      })
      .eq('id', user.id);

    await auditService.logActivity(user.id, AuditAction.LOGIN_SUCCESS, {
      email: user.email,
      requires2FA: !!user.is_2fa_enabled
    }, ipAddress, userAgent);

    if (user.is_2fa_enabled) {
      return {
        requires_2fa: true,
        user: {
          id: user.id,
          email: user.email
        }
      };
    }

    const token = generateToken({ userId: user.id });

    return {
      token,
      user: {
        id: user.id,
        email: user.email
      }
    };
  }

  async verify2FA(userId: string, token: string) {
    const { data: user, error } = await supabase
      .from('pfc_users')
      .select('*')
      .eq('id', userId)
      .single();

    if (!user || error) {
      throw new Error('Usuário não encontrado.');
    }

    const verified = speakeasy.totp.verify({
      secret: user.secret_2fa,
      encoding: 'base32',
      token: token,
      window: 2 // permite pequena diferença de tempo
    });

    if (!verified) {
      throw new Error('Código 2FA inválido.');
    }

    const jwtToken = generateToken({ userId: user.id });

    return {
      token: jwtToken,
      user: {
        id: user.id,
        email: user.email
      }
    };
  }

  async enable2FA(userId: string) {
    const secret = speakeasy.generateSecret({
      name: 'PFC App',
      issuer: 'PFC'
    });

    const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url!);

    await supabase
      .from('pfc_users')
      .update({
        secret_2fa: secret.base32,
        is_2fa_enabled: true
      })
      .eq('id', userId);

    return {
      secret: secret.base32,
      qrCodeUrl
    };
  }

  async disable2FA(userId: string) {
    await supabase
      .from('pfc_users')
      .update({
        secret_2fa: null,
        is_2fa_enabled: false
      })
      .eq('id', userId);
  }

  // 🔐 RECUPERAÇÃO DE SENHA
  async requestPasswordReset(email: string, ipAddress?: string, userAgent?: string) {
    const { data: user, error } = await supabase
      .from('pfc_users')
      .select('id, email')
      .eq('email', email)
      .single();

    if (!user || error) {
      // Não revelar se o email existe ou não (segurança)
      await auditService.logActivity(null, AuditAction.PASSWORD_RESET_FAILED, {
        email,
        reason: 'Email não encontrado'
      }, ipAddress, userAgent);
      throw new Error('Se o email existir, você receberá um link de recuperação.');
    }

    const resetToken = generateResetToken();
    const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRY).toISOString();

    const { error: updateError } = await supabase
      .from('pfc_users')
      .update({
        reset_token: resetToken,
        reset_token_expires_at: expiresAt
      })
      .eq('id', user.id);

    if (updateError) {
      throw new Error('Erro ao solicitarrecuperação de senha.');
    }

    await auditService.logActivity(user.id, AuditAction.PASSWORD_RESET_REQUESTED, {
      email: user.email,
      expiresAt
    }, ipAddress, userAgent);

    try {
      await emailService.sendPasswordResetEmail(user.email, resetToken, new Date(expiresAt));
    } catch (err) {
      console.error('Erro ao enviar email de recuperação:', err);
    }

    return {
      message: 'Email enviado. Verifique sua caixa de entrada.',
      // Apenas para desenvolvimento - remover em produção!
      resetToken: resetToken,
      expiresAt
    };
  }

  async validateResetToken(resetToken: string): Promise<{ userId: string; email: string }> {
    const { data: user, error } = await supabase
      .from('pfc_users')
      .select('id, email, reset_token, reset_token_expires_at')
      .eq('reset_token', resetToken)
      .single();

    if (!user || error) {
      throw new Error('Token de recuperação inválido.');
    }

    if (!user.reset_token_expires_at || new Date(user.reset_token_expires_at) < new Date()) {
      await auditService.logActivity(user.id, AuditAction.PASSWORD_RESET_TOKEN_EXPIRED, {
        email: user.email
      });
      throw new Error('Token de recuperação expirado. Solicite um novo.');
    }

    return {
      userId: user.id,
      email: user.email
    };
  }

  async resetPassword(resetToken: string, newPassword: string, ipAddress?: string, userAgent?: string) {
    const { userId } = await this.validateResetToken(resetToken);

    const hashedPassword = await hashPassword(newPassword);

    const { error } = await supabase
      .from('pfc_users')
      .update({
        password: hashedPassword,
        reset_token: null,
        reset_token_expires_at: null
      })
      .eq('id', userId);

    if (error) {
      throw new Error('Erro ao resetar senha.');
    }

    const { data: user } = await supabase
      .from('pfc_users')
      .select('email')
      .eq('id', userId)
      .single();

    await auditService.logActivity(userId, AuditAction.PASSWORD_RESET_COMPLETED, {
      email: user?.email
    }, ipAddress, userAgent);

    try {
      if (user?.email) {
        await emailService.sendPasswordChangedEmail(user.email);
      }
    } catch (err) {
      console.error('Erro ao enviar email de confirmação de senha:', err);
    }

    return {
      message: 'Senha resetada com sucesso.'
    };
  }

  private async handleFailedLogin(user: any) {

    const attempts = (user.failed_attempts || 0) + 1;

    if (attempts >= MAX_ATTEMPTS) {
      const lockUntil = new Date(Date.now() + LOCK_TIME);

      await supabase
        .from('pfc_users')
        .update({
          failed_attempts: 0, //reseta para 0
          locked_until: lockUntil.toISOString()
        })
        .eq('id', user.id);

    } else {
      await supabase
        .from('pfc_users')
        .update({
          failed_attempts: attempts
        })
        .eq('id', user.id);
    }
  }
}