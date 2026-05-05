export interface User {
  id: string;
  email: string;
  password: string;
  username: string;
  is2FAEnabled: boolean;
  twoFASecret?: string | null;
}