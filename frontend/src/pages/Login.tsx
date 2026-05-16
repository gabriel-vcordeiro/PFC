import { useState, useContext, } from 'react';
import { login, verify2FA } from '../api/auth.api';
import { AuthContext } from '../context/AuthContextType';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [requires2FA, setRequires2FA] = useState(false);
  const [userId, setUserId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setToken, setUserID } = useContext(AuthContext);

  async function handleLogin(e: any) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await login(email, password);
      if (data.requires_2fa) {
        setRequires2FA(true);
        setUserId(data.user.id);
      } else {
        setToken(data.token);
        setUserID(data.user.id);
        navigate('/home');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify2FA(e: any) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await verify2FA(userId, twoFactorCode);
      setToken(data.token);
      setUserID(data.user.id);
      navigate('/home');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 text-center">Login</h1>
          <p className="text-gray-600 text-center mt-2">Acesse sua conta</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-full">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {!requires2FA ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={loading}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <input
                type="password"
                placeholder="Digite sua senha"
                value={password}
                onChange={e => setPassword(e.target.value)}
                disabled={loading}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
            >
              {loading ? 'Carregando...' : 'Entrar'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify2FA} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Código 2FA
              </label>
              <input
                type="text"
                placeholder="Digite o código"
                value={twoFactorCode}
                onChange={e => setTwoFactorCode(e.target.value)}
                disabled={loading}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
            >
              {loading ? 'Carregando...' : 'Verificar'}
            </button>
          </form>
        )}

        <div className="mt-6 space-y-2">
          <button 
            onClick={() => navigate('/register')}
            disabled={loading}
            className="w-full px-4 py-2 text-gray-700 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed font-medium"
          >
            Criar Conta
          </button>
          <button 
            onClick={() => navigate('/reset-password')}
            disabled={loading}
            className="w-full px-4 py-2 text-gray-700 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed font-medium"
          >
            Recuperar Senha
          </button>
          <button 
            onClick={() => navigate('/privacy-policy')}
            disabled={loading}
            className="w-full px-4 py-2 text-gray-600 text-sm hover:text-gray-900 hover:cursor-pointer hover:underline transition-colors disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            Política de Privacidade
          </button>
        </div>
      </div>
    </div>
  );
}