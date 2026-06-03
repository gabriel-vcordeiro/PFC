import { createContext } from 'react';
interface AuthContextType {
  userID: string | null;
  setUserID: (userID: string | null) => void;
  logOut: () => Promise<void>;
  isSessionLoading: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  userID: null,
  setUserID: () => {},
  logOut: async () => {},
  isSessionLoading: true,
});