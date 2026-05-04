import React, { useState, useEffect } from 'react';
import { requestPasswordReset, validateResetToken, resetPassword } from '../api/auth.api';

interface ResetPasswordFormProps {
  token?: string;
  onSuccess?: () => void;
}

export const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ token, onSuccess }) => {
  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [email, setEmail] = useState('');
  const [requestedEmail, setRequestedEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetToken, setResetToken] = useState(token || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tokenValid, setTokenValid] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    if (token) {
      setResetToken(token);
    }
  }, [token]);

  useEffect(() => {
    if (token && !tokenValid) {
      validateTokenAutomatically();
    }
  }, [token, tokenValid]);

  useEffect(() => {
    if (secondsLeft <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsLeft]);

  // Manter o token sincronizado com a prop
  const validateTokenAutomatically = async () => {
    if (!token) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await validateResetToken(token);
      setTokenValid(true);
      setUserEmail(response.email);
      setStep('reset');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Token inválido ou expirado');
      setStep('request');
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Solicitar recuperação de senha
  const startResendTimer = () => {
    setSecondsLeft(60);
  };

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await requestPasswordReset(email);
      setSuccess('Email enviado. Verifique sua caixa de entrada.');
      setRequestedEmail(email);
      startResendTimer();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao solicitar recuperação');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!requestedEmail) {
      setError('Preencha o email antes de reenviar.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await requestPasswordReset(requestedEmail);
      setSuccess('Email reenviado. Verifique sua caixa de entrada.');
      startResendTimer();
      if (response.resetToken) {
        console.log('Token para desenvolvimento:', response.resetToken);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao reenviar recuperação');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Validar token
  const handleValidateToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await validateResetToken(resetToken);
      setTokenValid(true);
      setUserEmail(response.email);
      setStep('reset');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Token inválido ou expirado');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Resetar senha
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (newPassword.length < 6) {
      setError('Senha deve ter pelo menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      await resetPassword(resetToken, newPassword);
      setSuccess('Senha resetada com sucesso! Redirecionando para a página inicial...');
      setNewPassword('');
      setConfirmPassword('');

      // Redirecionar para a página inicial após 2 segundos
      setTimeout(() => {
        onSuccess?.();
        window.location.href = '/';
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao resetar senha');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px' }}>
      <h1>🔐 Recuperar Senha</h1>

      {error && (
        <div style={{
          backgroundColor: '#fee',
          color: '#c33',
          padding: '10px',
          borderRadius: '4px',
          marginBottom: '15px'
        }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{
          backgroundColor: '#efe',
          color: '#3c3',
          padding: '10px',
          borderRadius: '4px',
          marginBottom: '15px'
        }}>
          {success}
        </div>
      )}

      {/* Passo 1: Solicitar reset */}
      {step === 'request' && !tokenValid && !requestedEmail && (
        <form onSubmit={token ? handleValidateToken : handleRequestReset}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Email
            </label>
            <input
              type="email"
              value={email || resetToken || ''}
              onChange={(e) => {
                if (!resetToken) {
                  setEmail(e.target.value);
                }
              }}
              placeholder="seu@email.com"
              required
              disabled={!!resetToken}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {resetToken && (
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Token (encontrado na URL)
              </label>
              <input
                type="text"
                value={resetToken}
                onChange={(e) => setResetToken(e.target.value)}
                placeholder="Cole o token aqui"
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  boxSizing: 'border-box',
                  fontFamily: 'monospace',
                  fontSize: '12px'
                }}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? 'Processando...' : resetToken ? 'Validar Token' : 'Solicitar Recuperação'}
          </button>
        </form>
      )}

      {step === 'request' && !tokenValid && requestedEmail && !token && (
        <div style={{ marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <p style={{ margin: 0 }}>
            Email enviado para <strong>{requestedEmail}</strong>. Aguarde o link e reenvie se necessário.
          </p>
          <button
            type="button"
            onClick={handleResend}
            disabled={secondsLeft > 0 || loading}
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: secondsLeft > 0 ? '#999' : '#17a2b8',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: secondsLeft > 0 || loading ? 'not-allowed' : 'pointer',
              opacity: secondsLeft > 0 || loading ? 0.6 : 1
            }}
          >
            {secondsLeft > 0 ? `Reenviar em ${secondsLeft}s` : 'Reenviar email'}
          </button>
        </div>
      )}

      {/* Passo 2: Resetar senha */}
      {tokenValid && (
        <form onSubmit={handleResetPassword}>
          <div style={{ marginBottom: '10px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
            <p style={{ margin: '0' }}>
              <strong>Email:</strong> {userEmail}
            </p>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Nova Senha
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Digite sua nova senha"
              required
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Confirmar Senha
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirme sua nova senha"
              required
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? 'Resetando Senha...' : 'Resetar Senha'}
          </button>
        </form>
      )}
    </div>
  );
};

export default ResetPasswordForm;
