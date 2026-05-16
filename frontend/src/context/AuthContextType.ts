import { createContext } from 'react';
interface AuthContextType {
  token: string | null;
  setToken: (token: string | null) => void;
  userID: string | null;
  setUserID: (userID: string | null) => void;
  logOut: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  token: null,
  setToken: () => {},
  userID: null,
  setUserID: () => {},
  logOut: () => {}
});