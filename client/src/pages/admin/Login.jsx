import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, auth } from '../../lib/api.js';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setError('');
    try {
      const { token } = await api.post('/auth/login', { email, password });
      auth.set(token);
      navigate('/admin');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main className="wrap narrow section">
      <h1>Admin sign in</h1>
      {error && <p className="notice err" role="alert">{error}</p>}
      <form onSubmit={submit} className="stack">
        <label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" required /></label>
        <label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required /></label>
        <button className="btn">Sign in</button>
      </form>
    </main>
  );
}
