import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function LoginNeededRoute({ children }: any) {
  const { token } = useContext(AuthContext);
  if (!token) {
    return <Navigate to="/" />;
  }

  return children;
}