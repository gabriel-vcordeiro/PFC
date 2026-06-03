import { useEffect, useState } from 'react';
import { getUser, logout } from '../api/auth.api';
import { AuthContext } from './AuthContextType';
export function AuthProvider({ children }: any) {
  const [userID, setUserIDState] = useState<string | null>(() => {
    return null;
  });
  const [isSessionLoading, setIsSessionLoading] = useState(true);

  useEffect(() => {
    async function loadSession() {
      try {
        const session = await getUser();

        setUserIDState(session?.user?.id ?? null);
      } finally {
        setIsSessionLoading(false);
      }
    }

    loadSession();
  }, []);

  async function logOut() {
    try {
      await logout();
    } finally {
      setUserIDState(null);
    }
  }

  function setUserID(userID: string | null) {
    setUserIDState(userID);
  }
  return (
    <AuthContext.Provider value={{ userID, setUserID: setUserID, logOut, isSessionLoading }}>
      {children}
    </AuthContext.Provider>
  );
}
