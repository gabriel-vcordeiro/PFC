import { createContext, useEffect, useState } from 'react';

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

export function AuthProvider({ children }: any) {
  const [token, setTokenState] = useState<string | null>(null);
  const [userID, setUserIDState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUserID = localStorage.getItem('userID');
    setTokenState(storedToken);
    setUserID(storedUserID);
    setLoading(false);
  }, []);

  function setToken(token: string | null) {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }

    setTokenState(token);
  }
  function setUserID(userID: string | null){
    if (userID){
      localStorage.setItem('userID', userID)
    }
    else{
      localStorage.removeItem('userID');
    }
    setUserIDState(userID);
  }

  function logOut(){
    setTokenState('');
    setUserID('');
  }

  if (loading)
    return (<div>Carregando...</div>)
  return (
    <AuthContext.Provider value={{ token, setToken, userID, setUserID, logOut }}>
      {children}
    </AuthContext.Provider>
  );
}