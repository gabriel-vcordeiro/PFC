import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  exp: number;
}

export function isTokenExpired(token: string): boolean {
  try {
    const decoded = jwtDecode<DecodedToken>(token);

    return decoded.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}