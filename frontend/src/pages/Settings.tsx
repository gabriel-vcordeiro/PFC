import { useState, useContext } from 'react';
import { enable2FA, disable2FA, deleteUserData, exportUserData } from '../api/auth.api';
import { AuthContext } from '../context/AuthContextType';
import { useNavigate } from 'react-router-dom';

export default function Settings() {
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const { userID, token, logOut } = useContext(AuthContext);
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

  async function handleDeleteUserData() {
    if (deleteConfirmation !== 'DELETAR') {
      setError('Confirme digitando "DELETAR"');
      return;
    }

    setError('');
    setSuccess('');
    setIsDeleting(true);

    try {
      await deleteUserData(token!);
      setSuccess('Dados deletados. Você será redirecionado...');
      setTimeout(() => {
        logOut();
      }, 1000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao deletar dados');
      setIsDeleting(false);
    }
  }

  async function handleExportUserData() {
    setError('');
    setSuccess('');
    setIsExporting(true);

    try {
      const data = await exportUserData(token!);
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json;charset=utf-8',
      });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `meus-dados-${data.user.id}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      setSuccess('Seus dados pessoais foram exportados com sucesso.');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao exportar dados pessoais');
    } finally {
      setIsExporting(false);
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

        <div className="mt-12 pt-8 border-t border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Privacidade e Dados</h2>
          <p className="text-gray-600 mb-4">Gerencie seus dados pessoais</p>
          
          <button 
            onClick={handleExportUserData}
            disabled={isExporting}
            className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium mb-3 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isExporting ? 'Exportando...' : 'Exportar Meus Dados'}
          </button>

          <button 
            onClick={() => setShowDeleteModal(true)}
            className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            Deletar Todos os Meus Dados
          </button>
        </div>

        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Deletar Todos os Dados</h3>
              <p className="text-gray-600 mb-4">
                Esta ação é <span className="font-semibold">irreversível</span>. Todos os seus dados pessoais serão permanentemente deletados.
              </p>
              <p className="text-gray-600 mb-6">
                Digite "DELETAR" para confirmar:
              </p>
              
              <input
                type="text"
                placeholder="Digite DELETAR"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4 font-mono"
                disabled={isDeleting}
              />
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteConfirmation('');
                    setError('');
                  }}
                  className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
                  disabled={isDeleting}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteUserData}
                  disabled={isDeleting || deleteConfirmation !== 'DELETAR'}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isDeleting ? 'Deletando...' : 'Deletar'}
                </button>
              </div>
            </div>
          </div>
        )}

        <button 
          onClick={() => navigate('/home')}
          className="w-full px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium mt-4"
        >
          Voltar
        </button>
      </div>
    </div>
  );
}