import { useState, useContext, } from 'react';
import { login, verify2FA } from '../api/auth.api';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [requires2FA, setRequires2FA] = useState(false);
  const [userId, setUserId] = useState('');
  const navigate = useNavigate();
  const { setToken, setUserID } = useContext(AuthContext);

  async function handleLogin(e: any) {
    e.preventDefault();

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
      alert(err.response?.data?.error || 'Erro');
    }
  }

  async function handleVerify2FA(e: any) {
    e.preventDefault();

    try {
      const data = await verify2FA(userId, twoFactorCode);
      setToken(data.token);
      setUserID(data.user.id);
      navigate('/home');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro');
    }
  }

  return (
    <div>
      {!requires2FA ? (
        <form onSubmit={handleLogin}>
          <input
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required={true}
          />

          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required={true}
          />

          <button type="submit">Entrar</button>
        </form>
      ) : (
        <form onSubmit={handleVerify2FA}>
          <input
            placeholder="Código 2FA"
            value={twoFactorCode}
            onChange={e => setTwoFactorCode(e.target.value)}
            required={true}
          />

          <button type="submit">Verificar</button>
        </form>
      )}
      <button onClick={() => navigate('/register')}>Cadastro</button>
    </div>
  );
}