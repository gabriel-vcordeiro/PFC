import { useState, useContext } from 'react';
import { enable2FA, disable2FA } from '../api/auth.api';
import { AuthContext } from '../context/AuthContextType';
import { useNavigate } from 'react-router-dom';

export default function Settings() {
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { userID } = useContext(AuthContext);
  const navigate = useNavigate();

  async function handleEnable2FA() {
    setError('');
    setSuccess('');

    try {
      const data = await enable2FA(userID!);
      setQrCode(data.qrCodeUrl);
      setSecret(data.secret);
      setSuccess('2FA habilitado. Escaneie o QR code no seu app autenticador.');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro');
    }
  }

  async function handleDisable2FA() {
    setError('');
    setSuccess('');

    try {
      await disable2FA(userID!);
      setQrCode('');
      setSecret('');
      setSuccess('2FA desabilitado.');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro');
    }
  }

  return (
    <div className="min-h-screen bg-white px-4">
      <div className="max-w-2xl mx-auto pt-16">
        <div className="mb-8">
          <h1 className="text-4xl font-semibold text-gray-900 mb-2">Configurações de Segurança</h1>
          <p className="text-gray-600">Gerencie suas configurações de autenticação</p>
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

        <div className="space-y-3 mb-8">
          <button 
            onClick={handleEnable2FA}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            Habilitar 2FA
          </button>
          <button 
            onClick={handleDisable2FA}
            className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            Desabilitar 2FA
          </button>
        </div>

        {qrCode && (
          <div className="mb-8 p-6 bg-gray-50 border border-gray-200 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Escaneie o código QR</h2>
            <p className="text-sm text-gray-600 mb-4">
              Escaneie este código no seu app autenticador (ex: Google Authenticator):
            </p>
            <img 
              src={qrCode} 
              alt="QR Code" 
              className="w-48 mx-auto mb-4 border border-gray-300 rounded-lg"
            />
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <p className="text-xs text-gray-600 mb-1">Secret:</p>
              <p className="text-sm font-mono text-gray-900 break-all">{secret}</p>
            </div>
          </div>
        )}

        <button 
          onClick={() => navigate('/home')}
          className="w-full px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
        >
          Voltar
        </button>
      </div>
    </div>
  );
}