import { useState } from 'react';
import { api } from '../../lib/api.js';

export default function Password() {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [msg, setMsg] = useState({ ok: false, text: '' });

  async function submit(e) {
    e.preventDefault();
    try {
      await api.post('/admin/password', { current, next });
      setMsg({ ok: true, text: 'Password changed.' });
      setCurrent(''); setNext('');
    } catch (err) { setMsg({ ok: false, text: err.message }); }
  }

  return (
    <form onSubmit={submit} className="stack">
      <h2>Change password</h2>
      {msg.text && <p className={`notice ${msg.ok ? 'ok' : 'err'}`} role="status">{msg.text}</p>}
      <label>Current password<input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} autoComplete="current-password" required /></label>
      <label>New password (10+ characters)<input type="password" value={next} onChange={(e) => setNext(e.target.value)} autoComplete="new-password" minLength={10} required /></label>
      <button className="btn">Change password</button>
    </form>
  );
}
