import { useState } from 'react';
import { register } from '../api/auth.api';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  async function handleRegister(e: any) {
    e.preventDefault();
    try {
      await register(email, password);
      alert('Cadastro realizado');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro');
    }
  }

  return (
    <div>
    <form onSubmit={handleRegister}>
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
        minLength={6}
      />

      <button type="submit">Cadastrar</button>
    </form>
    <button onClick={() => navigate('/')}>Login</button>
    </div>
  );
}