import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { getSessionTokenFromRequest } from '../utils/session';

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = getSessionTokenFromRequest(req);

  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido.' });
  }

  try {
    const decoded = verifyToken(token);

    (req as any).user = decoded;

    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido ou expirado.' });
  }
}