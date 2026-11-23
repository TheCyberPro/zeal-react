import { useEffect, useState } from 'react';
import { api } from '../../lib/api.js';

export default function Bookings() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const load = () => api.get('/admin/bookings').then(setData).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);

  const setStatus = (b, status) => api.patch(`/admin/bookings/${b.id}`, { status }).then(() => { setError(''); load(); }).catch((e) => setError(e.message));

  return (
    <div>
      <h2>Bookings</h2>
      {error && <p className="notice err" role="alert">{error}</p>}
      {!data && <p className="muted">Loading…</p>}
      {data?.rows.length === 0 && <p className="muted">No bookings yet. They appear here when someone picks a time.</p>}
      {data?.rows.map((b) => (
        <article key={b.id} className={`msg ${b.status === 'requested' ? 'unread' : ''}`}>
          <header className="row between">
            <strong>{new Date(b.slot_start).toLocaleString(undefined, { timeZone: data.tz, dateStyle: 'medium', timeStyle: 'short' })} <span className="muted">({data.tz})</span></strong>
            <span className="tag">{b.status}</span>
          </header>
          <p style={{ margin: '.4rem 0' }}>{b.name}, <a href={`mailto:${b.email}`}>{b.email}</a></p>
          {b.notes && <p style={{ whiteSpace: 'pre-wrap' }}>{b.notes}</p>}
          <div className="row">
            {b.status !== 'confirmed' && <button className="btn sm" onClick={() => setStatus(b, 'confirmed')}>Confirm</button>}
            {b.status !== 'cancelled' && <button className="btn ghost sm danger" onClick={() => setStatus(b, 'cancelled')}>Cancel</button>}
            {b.status === 'cancelled' && <button className="btn ghost sm" onClick={() => setStatus(b, 'requested')}>Restore</button>}
          </div>
        </article>
      ))}
    </div>
  );
}
