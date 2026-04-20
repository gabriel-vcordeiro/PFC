import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ResetPasswordForm from '../components/ResetPassword';

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Pegar token da URL (?token=xxxxx)
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    }
  }, [searchParams]);

  const handleResetSuccess = () => {
    // Limpar qualquer estado necessário
    console.log('Senha resetada com sucesso');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <ResetPasswordForm token={token || undefined} onSuccess={handleResetSuccess} />
    </div>
  );
};

export default ResetPasswordPage;
