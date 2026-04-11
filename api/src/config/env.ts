import dotenv from 'dotenv';

dotenv.config();

export const env = {
  port: process.env.PORT || 3000,
  supabaseUrl: process.env.SUPABASE_URL!,
  supabaseKey: process.env.SUPABASE_ANON_KEY!,
  jwtSecret: process.env.JWT_SECRET!,
  bcryptRounds: Number(process.env.BCRYPT_SALT_ROUNDS) || 12,
};