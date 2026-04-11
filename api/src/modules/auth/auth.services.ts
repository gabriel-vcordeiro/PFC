import { supabase } from '../../db/supabase/client';
import { hashPassword, comparePassword } from '../../utils/hash';
import { generateToken } from '../../utils/jwt';

const MAX_ATTEMPTS = 5;
const LOCK_TIME = 15 * 60 * 1000; //15 min de bloqueio

export class AuthService {

  async register(email: string, password: string) {

    const password_hash = await hashPassword(password);

    const { data, error } = await supabase
      .from('pfc_users')
      .insert([{ email, password:password_hash }])
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

    const token = generateToken({ userId: user.id });

    return {
      token,
      user: {
        id: user.id,
        email: user.email
      }
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