import { useEffect, useState } from 'react';
import { api } from '../../lib/api.js';

export default function Messages() {
  const [rows, setRows] = useState(null);
  const [error, setError] = useState('');
  const load = () => api.get('/admin/messages').then(setRows).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);

  const toggle = (m) => api.patch(`/admin/messages/${m.id}`, { is_read: !m.is_read }).then(load).catch((e) => setError(e.message));
  const remove = (m) => confirm('Delete this message?') && api.del(`/admin/messages/${m.id}`).then(load).catch((e) => setError(e.message));

  return (
    <div>
      <h2>Messages</h2>
      {error && <p className="notice err" role="alert">{error}</p>}
      {rows === null && <p className="muted">Loading…</p>}
      {rows?.length === 0 && <p className="muted">No messages yet. Contact form submissions appear here.</p>}
      {rows?.map((m) => (
        <article key={m.id} className={`msg ${m.is_read ? '' : 'unread'}`}>
          <header className="row between">
            <strong>{m.name}</strong>
            <span className="muted">{new Date(m.created_at + 'Z').toLocaleString()}</span>
          </header>
          <a href={`mailto:${m.email}`}>{m.email}</a>
          <p style={{ whiteSpace: 'pre-wrap' }}>{m.message}</p>
          <div className="row">
            <button className="btn ghost sm" onClick={() => toggle(m)}>{m.is_read ? 'Mark unread' : 'Mark read'}</button>
            <button className="btn ghost sm danger" onClick={() => remove(m)}>Delete</button>
          </div>
        </article>
      ))}
    </div>
  );
}
