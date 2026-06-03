import { CookieOptions, Request, Response } from 'express';
import { env } from '../config/env';

const SESSION_MAX_AGE = 10 * 60 * 1000;

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