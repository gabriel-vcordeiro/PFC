import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUser } from '../api/auth.api';
import { AuthContext } from '../context/AuthContextType';
import type { User } from '../types/User';

export default function Profile() {
  const { logOut, token } = useContext(AuthContext);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  function getErrorMessage(err: unknown) {
    if (typeof err === 'object' && err && 'response' in err) {
      const response = err as { response?: { data?: { error?: string } } };
      return response.response?.data?.error || 'Erro ao carregar o perfil.';
    }

    return 'Erro ao carregar o perfil.';
  }

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        setError('');
        const data = await getUser(token!);
        setUser(data.user);
      } catch (err: unknown) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [token]);


  return (
    <div className="min-h-screen bg-white text-gray-900">
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.25em] text-gray-500">
                Perfil
              </p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight text-gray-900">
                Sua conta
              </h1>
              <p className="mt-2 max-w-2xl text-gray-600">
                Veja seus dados principais e acesse rapidamente as configurações da sua conta.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => navigate('/home')}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors font-medium"
              >
                Voltar ao início
              </button>
              <button
                onClick={() => navigate('/settings')}
                className="px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors font-medium"
              >
                Configurações
              </button>
              <button
                onClick={() => {
                  logOut();
                  navigate('/');
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors font-medium"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {loading ? (
          <div className="rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-green-600 border-t-transparent" />
            <p className="mt-4 text-sm text-gray-600">Carregando dados do perfil...</p>
          </div>
        ) : error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6">
            <h2 className="text-lg font-semibold text-red-900">Não foi possível abrir o perfil</h2>
            <p className="mt-2 text-sm text-red-700">{error}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={() => navigate('/home')}
                className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors font-medium"
              >
                Ir para o início
              </button>
              <button
                onClick={() => navigate('/settings')}
                className="px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors font-medium"
              >
                Abrir configurações
              </button>
            </div>
          </div>
        ) : user ? (
          <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
            <section className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
              <div className="border-b border-gray-200 bg-gray-50 p-6 sm:p-8">
                <p className="text-sm font-medium uppercase tracking-[0.25em] text-gray-500">
                  Conta ativa
                </p>
                <h2 className="mt-3 text-3xl font-semibold text-gray-900">{user.username}</h2>
                <p className="mt-2 break-all text-gray-600">{user.email}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                    Autenticado
                  </span>
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                    ID: {user.id}
                  </span>
                </div>
              </div>

              <div className="grid gap-4 p-6 sm:p-8 md:grid-cols-2">
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gray-500">
                    Nome de exibição
                  </p>
                  <p className="mt-3 text-lg font-semibold text-gray-900">{user.username}</p>
                  <p className="mt-1 text-sm text-gray-600">
                    Usado no seu perfil dentro do sistema.
                  </p>
                </div>

                <div className="rounded-lg border border-gray-200 bg-gray-50 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gray-500">
                    Email
                  </p>
                  <p className="mt-3 break-all text-lg font-semibold text-gray-900">{user.email}</p>
                  <p className="mt-1 text-sm text-gray-600">Contato principal da conta.</p>
                </div>

                <div className="rounded-lg border border-gray-200 bg-gray-50 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gray-500">
                    ID do usuário
                  </p>
                  <p className="mt-3 break-all font-mono text-sm text-gray-900">{user.id}</p>
                </div>

                <div className="rounded-lg border border-gray-200 bg-gray-50 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gray-500">
                    Status
                  </p>
                  <p className="mt-3 text-lg font-semibold text-gray-900">Conta sincronizada</p>
                  <p className="mt-1 text-sm text-gray-600">
                    Dados carregados direto da API de autenticação.
                  </p>
                </div>
              </div>
            </section>

            <aside className="space-y-6">

              <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 shadow-sm">
                <h3 className="mt-3 text-xl font-semibold text-gray-900">
                  Ajuste suas configurações de segurança
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  Ative ou remova o 2FA e mantenha sua conta protegida.
                </p>
                <button
                  onClick={() => navigate('/settings')}
                  className="mt-5 w-full px-4 py-3 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors font-medium"
                >
                  Abrir configurações
                </button>
              </div>
            </aside>
          </div>
        ) : null}
      </div>
    </div>
  );
}
