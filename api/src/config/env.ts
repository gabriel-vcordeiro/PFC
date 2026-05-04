import dotenv from 'dotenv';

dotenv.config();

export const env = {
  port: process.env.PORT || 3000,
  supabaseUrl: process.env.SUPABASE_URL!,
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY!,
  jwtSecret: process.env.JWT_SECRET!,
  bcryptRounds: Number(process.env.BCRYPT_SALT_ROUNDS) || 12,
  emailFrom: process.env.EMAIL_FROM || 'noreply@seu-dominio.com',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  sendgridApiKey: process.env.SENDGRID_API_KEY || ''
};