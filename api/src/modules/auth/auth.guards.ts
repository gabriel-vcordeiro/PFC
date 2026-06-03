import { UserNeeding2FA, UserNotNeeding2FA } from "./auth.types";

export function isUserNotNeeding2FA(
  result: UserNotNeeding2FA | UserNeeding2FA
): result is UserNotNeeding2FA {
  return 'token' in result;
}
