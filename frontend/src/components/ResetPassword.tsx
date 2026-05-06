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

  const startResendTimer = () => {
    setSecondsLeft(60);
  };

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await requestPasswordReset(email);
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
      await requestPasswordReset(requestedEmail);
      setSuccess('Email reenviado. Verifique sua caixa de entrada.');
      startResendTimer();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao reenviar recuperação');
    } finally {
      setLoading(false);
    }
  };

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
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 text-center">Recuperar Senha</h1>
          <p className="text-gray-600 text-center mt-2">Redefina sua senha de acesso</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 text-sm">{success}</p>
          </div>
        )}

        {step === 'request' && !tokenValid && !requestedEmail && (
          <form onSubmit={token ? handleValidateToken : handleRequestReset} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            {resetToken && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Token (encontrado na URL)
                </label>
                <input
                  type="text"
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  placeholder="Cole o token aqui"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
            >
              {loading ? 'Processando...' : resetToken ? 'Validar Token' : 'Solicitar Recuperação'}
            </button>
          </form>
        )}

        {step === 'request' && !tokenValid && requestedEmail && !token && (
          <div className="space-y-4">
            <p className="text-gray-700 text-sm">
              Email enviado para <span className="font-semibold">{requestedEmail}</span>. Verifique sua caixa de entrada.
            </p>
            <button
              type="button"
              onClick={handleResend}
              disabled={secondsLeft > 0 || loading}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
            >
              {secondsLeft > 0 ? `Reenviar em ${secondsLeft}s` : 'Reenviar email'}
            </button>
          </div>
        )}

        {tokenValid && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Email:</span> {userEmail}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nova Senha
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Digite sua nova senha"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirmar Senha
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirme sua nova senha"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
            >
              {loading ? 'Resetando Senha...' : 'Resetar Senha'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordForm;
