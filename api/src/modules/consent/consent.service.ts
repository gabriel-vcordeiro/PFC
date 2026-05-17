import { supabase } from '../../db/supabase/client';
import { ConsentHistory } from './consent.model';

export class ConsentService {
  async recordConsent(
    userId: string,
    consentimento_aceito: boolean,
    consentimento_finalidade: string,
    consentimento_versao: string
  ): Promise<ConsentHistory> {
    const { data, error } = await supabase
      .from('pfc_historico_consentimentos')
      .insert([
        {
          user_id: userId,
          consentimento_aceito,
          consentimento_finalidade,
          consentimento_versao,
        },
      ])
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao registrar consentimento: ${error.message}`);
    }

    return data;
  }

  async getConsentHistory(userId: string, limit = 50, offset = 0): Promise<ConsentHistory[]> {
    const { data, error } = await supabase
      .from('pfc_historico_consentimentos')
      .select('*')
      .eq('user_id', userId)
      .order('data_registro', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Erro ao buscar histórico de consentimentos: ${error.message}`);
    }

    return data || [];
  }

  async getLatestConsent(userId: string): Promise<ConsentHistory | null> {
    const { data, error } = await supabase
      .from('pfc_historico_consentimentos')
      .select('*')
      .eq('user_id', userId)
      .order('data_registro', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Erro ao buscar consentimento mais recente: ${error.message}`);
    }

    return data || null;
  }
}

export const consentService = new ConsentService();
