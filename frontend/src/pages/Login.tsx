import { useState, useContext, } from 'react';
import { login } from '../api/auth.api';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { setToken, setUserID } = useContext(AuthContext);
  async function handleLogin(e: any) {
    e.preventDefault();

    try {
      const data = await login(email, password);
      setToken(data.token);
      setUserID(data.user.id);
      navigate('home');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro');
    }
  }

  return (
    <div>
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
    <button onClick={() => navigate('/register')}>Cadastro</button>
    </div>
  );
}