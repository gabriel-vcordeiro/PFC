import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export function generateToken(payload: object, options: jwt.SignOptions = {}) {
  return jwt.sign(payload, env.jwtSecret, {
    expiresIn: '10m',
    ...options,
  });
}

export function verifyToken(token: string) {
  return jwt.verify(token, env.jwtSecret);
}