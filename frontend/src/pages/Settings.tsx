import { useState, useContext } from 'react';
import { enable2FA, disable2FA } from '../api/auth.api';
import { AuthContext } from '../context/AuthContext';

export default function Settings() {
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { userID } = useContext(AuthContext);

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
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px' }}>
        <h1>⚙️ Configurações de Segurança</h1>

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

        <div style={{ marginBottom: '15px' }}>
          <button 
            onClick={handleEnable2FA}
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginBottom: '10px'
            }}
          >
            Habilitar 2FA
          </button>
          <button 
            onClick={handleDisable2FA}
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Desabilitar 2FA
          </button>
        </div>

        {qrCode && (
          <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
            <p style={{ margin: '0 0 10px 0' }}>
              Escaneie este QR code no seu app autenticador (ex: Google Authenticator):
            </p>
            <img 
              src={qrCode} 
              alt="QR Code" 
              style={{ display: 'block', margin: '0 auto', border: '1px solid #ddd', borderRadius: '4px' }}
            />
            <p style={{ margin: '10px 0 0 0', fontSize: '12px', fontFamily: 'monospace' }}>
              Ou copie o secret: {secret}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}