import { CookieOptions, Request, Response } from 'express';
import { env } from '../config/env';
import { generateToken, verifyToken } from './jwt';

//Limitação de tempos
const SESSION_MAX_AGE = 10 * 60 * 1000;
const PENDING_2FA_MAX_AGE = 5 * 60 * 1000; // 5 minutos

//Construtores dos cookies
function buildSessionCookieOptions(): CookieOptions {
  const isProduction = env.nodeEnv === 'production';

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  };
}
function buildPending2FACookieOptions(): CookieOptions {
  const isProduction = env.nodeEnv === 'production';

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
    maxAge: PENDING_2FA_MAX_AGE,
  };
}

//Cookie sessão
export function getSessionTokenFromRequest(req: Request) {
  return (
    req.cookies?.[env.sessionCookieName] ??
    req.headers.authorization?.replace(/^Bearer\s/, '') ??
    null
  );
}

export function setSessionCookie(res: Response, token: string) {
  res.cookie(env.sessionCookieName, token, buildSessionCookieOptions());
}

export function clearSessionCookie(res: Response) {
  res.clearCookie(env.sessionCookieName, buildSessionCookieOptions());
}

//Cookie 2FA
export function setPending2FACookie(res: Response, userId: string) {
  const token = generateToken({
    userId,
  }, { expiresIn: '5m' });

  res.cookie(env.pending2FACookieName, token, buildPending2FACookieOptions());
}

export function clearPending2FACookie(res: Response) {
  res.clearCookie(env.pending2FACookieName, buildPending2FACookieOptions());
}

export function getPending2FAUserId(req: Request) {
  const token = req.cookies?.[env.pending2FACookieName];

  if (!token) {
    return null;
  }
  try {
    const decoded = verifyToken(token) as { userId: string};
    return decoded.userId;
  } catch {
    return null;
  }
}