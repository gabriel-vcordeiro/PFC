import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContextType';

export default function LoginNeededRoute({ children }: any) {
  const { token } = useContext(AuthContext);
  if (!token) {
    return <Navigate to="/" />;
  }

  return children;
}