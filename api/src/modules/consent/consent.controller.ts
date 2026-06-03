import { Request, Response } from 'express';
import { consentService } from './consent.service';
import { RecordConsentSchema, GetConsentHistorySchema } from './consent.dto';

export class ConsentController {
  async recordConsent(req: Request, res: Response) {
    try {
      const parsed = RecordConsentSchema.safeParse(req.body);

      if (!parsed.success) {
        return res.status(400).json({ error: 'Dados de consentimento inválidos.' });
      }

      const userId = (req as any).user?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Token necessário.' });
      }

      const { consentimento_aceito, consentimento_finalidade, consentimento_versao } = parsed.data;

      const consent = await consentService.recordConsent(
        userId,
        consentimento_aceito,
        consentimento_finalidade,
        consentimento_versao
      );

      res.status(201).json(consent);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  async getHistory(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Token necessário.' });
      }

      const parsed = GetConsentHistorySchema.safeParse(req.query);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Parâmetros de paginação inválidos.' });
      }

      const { limit, offset } = parsed.data;
      const history = await consentService.getConsentHistory(userId, limit, offset);

      res.json(history);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
}
