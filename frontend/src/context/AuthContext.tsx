import { useState } from "react";
import { isTokenExpired } from "../utils/token";
import { AuthContext } from "./AuthContextType";
export function AuthProvider({ children }: any) {
  const [token, setTokenState] = useState<string | null>(() => {
    const storedToken = localStorage.getItem("token");
    return storedToken && !isTokenExpired(storedToken) ? storedToken : null;
  });

  const [userID, setUserIDState] = useState<string | null>(() => {
    const storedUserID = localStorage.getItem("userID");
    return storedUserID ? storedUserID : null;
  });

  function logOut() {
    setTokenState("");
    setUserIDState("");
  }

  function setToken(token: string | null) {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
    setTokenState(token);
  }
  function setUserID(userID: string | null) {
    if (userID) {
      localStorage.setItem("userID", userID);
    } else {
      localStorage.removeItem("userID");
      logOut();
    }
    setUserIDState(userID)
  }
  return (
    <AuthContext.Provider
      value={{ token, setToken, userID, setUserID: setUserID, logOut }}>
      {children}
    </AuthContext.Provider>
  );
}
