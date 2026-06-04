import bcrypt from 'bcrypt';
import { createHmac } from 'crypto';
import { env } from '../config/env';
 
export async function hashPassword(password: string) {
  return bcrypt.hash(password, env.bcryptRounds);
}
 
export async function comparePassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}
 
export function hmacAuditLog(payload: Record<string, any>): string {
  return createHmac('sha256', env.jwtSecret)
    .update(JSON.stringify(payload))
    .digest('hex');
}