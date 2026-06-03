export interface UserNotNeeding2FA {
  token: string;
  user: {
    id: string;
    email: string;
  };
  requires_2fa?: never;
}
export interface UserNeeding2FA {
  requires_2fa: true;
  user: {
    id: string;
    email: string;
  };
  token?: never;
}
