import { supabase } from '../../db/supabase/client';
import { hashPassword, comparePassword } from '../../utils/hash';
import { generateToken } from '../../utils/jwt';
import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';

const MAX_ATTEMPTS = 5;
const LOCK_TIME = 15 * 60 * 1000; //15 min de bloqueio

export class AuthService {

  async register(email: string, password: string) {

    const password_hash = await hashPassword(password);

    const { data, error } = await supabase
      .from('pfc_users')
      .insert([{ email, password:password_hash, is_2fa_enabled: false, secret_2fa: null }])
      .select()
      .single();

    if (error) {
      if (error.message.includes('duplicate')) {
        throw new Error('Email já cadastrado.');
      }
      throw new Error('Erro ao registrar usuário!');
    }
    return data;
  }

  // 🔐 LOGIN
  async login(email: string, password: string) {

    const { data: user, error } = await supabase
      .from('pfc_users')
      .select('*')
      .eq('email', email)
      .single();

    if (!user || error) {
      throw new Error('Credenciais inválidas.');
    }

    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      throw new Error('Conta bloqueada temporariamente. Tente novamente mais tarde.');
    }

    const isValid = await comparePassword(password, user.password);

    if (!isValid) {
      await this.handleFailedLogin(user);
      throw new Error('Credenciais inválidas.');
    }

    await supabase
      .from('pfc_users')
      .update({
        failed_attempts: 0,
        locked_until: null
      })
      .eq('id', user.id);

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