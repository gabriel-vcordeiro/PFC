import { z } from 'zod';

export const RecordConsentSchema = z.object({
  consentimento_aceito: z.boolean().refine(v => v === true, 'Consentimento deve ser aceito'),
  consentimento_finalidade: z.string().min(1, 'Finalidade do consentimento é obrigatória'),
  consentimento_versao: z.string().regex(/^\d+\.\d+\.\d+$/, 'Versão deve estar no formato X.Y.Z'),
});

export const GetConsentHistorySchema = z.object({
  limit: z.number().int().positive().optional().default(50),
  offset: z.number().int().nonnegative().optional().default(0),
});
