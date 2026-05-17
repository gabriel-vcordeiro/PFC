import { Request, Response } from 'express';
import { consentService } from './consent.service';
import { RecordConsentSchema, GetConsentHistorySchema } from './consent.dto';
import { verifyToken } from '../../utils/jwt';

type DecodedAuthToken = {
  userId?: string;
};

export class ConsentController {
  async recordConsent(req: Request, res: Response) {
    try {
      const parsed = RecordConsentSchema.safeParse(req.body);

      if (!parsed.success) {
        return res.status(400).json({ error: 'Dados de consentimento inválidos.' });
      }

      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token necessário.' });
      }

      const token = authHeader.split(' ')[1];
      const validatedToken = verifyToken(token!) as DecodedAuthToken;

      if (!validatedToken?.userId) {
        return res.status(401).json({ error: 'Token inválido.' });
      }

      const { consentimento_aceito, consentimento_finalidade, consentimento_versao } = parsed.data;

      const consent = await consentService.recordConsent(
        validatedToken.userId,
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
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token necessário.' });
      }

      const token = authHeader.split(' ')[1];
      const validatedToken = verifyToken(token!) as DecodedAuthToken;

      if (!validatedToken?.userId) {
        return res.status(401).json({ error: 'Token inválido.' });
      }

      const parsed = GetConsentHistorySchema.safeParse(req.query);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Parâmetros de paginação inválidos.' });
      }

      const { limit, offset } = parsed.data;
      const history = await consentService.getConsentHistory(validatedToken.userId, limit, offset);

      res.json(history);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
}
