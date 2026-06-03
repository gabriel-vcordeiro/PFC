import { z } from 'zod';

export const RegisterSchema = z.object({
  username: z
    .string()
    .min(3)
    .max(20)
    .regex(/^[a-zA-Z0-9_]+$/),
  email: z.email(),
  password: z.string().min(6),
  consentimento_aceito: z.boolean().refine(v => v === true, 'Consentimento deve ser aceito'),
  consentimento_finalidade: z.string().min(1, 'Finalidade do consentimento é obrigatória'),
  consentimento_versao: z.string().regex(/^\d+\.\d+\.\d+$/, 'Versão deve estar no formato X.Y.Z'),
});

export const LoginSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
});