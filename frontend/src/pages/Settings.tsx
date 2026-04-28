import { useState, useContext } from 'react';
import { enable2FA, disable2FA } from '../api/auth.api';
import { AuthContext } from '../context/AuthContext';

export default function Settings() {
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const { userID } = useContext(AuthContext);

  async function handleEnable2FA() {
    try {
      const data = await enable2FA(userID!);
      setQrCode(data.qrCodeUrl);
      setSecret(data.secret);
      alert('2FA habilitado. Escaneie o QR code no seu app autenticador.');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro');
    }
  }

  async function handleDisable2FA() {
    try {
      await disable2FA(userID!);
      setQrCode('');
      setSecret('');
      alert('2FA desabilitado.');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro');
    }
  }

  return (
    <div>
      <h1>Configurações de Segurança</h1>
      <button onClick={handleEnable2FA}>Habilitar 2FA</button>
      <button onClick={handleDisable2FA}>Desabilitar 2FA</button>
      {qrCode && (
        <div>
          <p>Escaneie este QR code no seu app autenticador (ex: Google Authenticator):</p>
          <img src={qrCode} alt="QR Code" />
          <p>Ou copie o secret: {secret}</p>
        </div>
      )}
    </div>
  );
}