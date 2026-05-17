export interface ConsentHistory {
  id: number;
  user_id: string;
  consentimento_aceito: boolean;
  consentimento_finalidade: string;
  consentimento_versao: string;
  data_registro: string;
}
