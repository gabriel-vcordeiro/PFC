import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ResetPasswordForm from '../components/ResetPassword';

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [token] = useState<string | null>(() =>{
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) {
      return tokenFromUrl;
    }
    return null;
  });

  const handleResetSuccess = () => {
  };

  return (
    <div className="min-h-screen bg-white">
      <ResetPasswordForm token={token || undefined} onSuccess={handleResetSuccess} />
    </div>
  );
};

export default ResetPasswordPage;
