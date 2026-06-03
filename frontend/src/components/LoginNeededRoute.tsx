import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContextType';

export default function LoginNeededRoute({ children }: any) {
  const { userID, isSessionLoading } = useContext(AuthContext);

  if (isSessionLoading) {
    return null;
  }

  if (!userID) {
    return <Navigate to="/" />;
  }

  return children;
}