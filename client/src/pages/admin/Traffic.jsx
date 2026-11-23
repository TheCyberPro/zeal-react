import { useEffect, useState } from 'react';
import { api } from '../../lib/api.js';

export default function Traffic() {
  const [d, setD] = useState(null);
  useEffect(() => { api.get('/admin/analytics').then(setD).catch(() => setD({ days: [], top: [] })); }, []);
  if (!d) return null;

  const byDay = Object.fromEntries(d.days.map((r) => [r.day, r.n]));
  const days = [...Array(14)].map((_, i) => {
    const day = new Date(Date.now() - (13 - i) * 864e5).toISOString().slice(0, 10);
    return { day, n: byDay[day] || 0 };
  });
  const max = Math.max(1, ...days.map((x) => x.n));
  const total = days.reduce((a, x) => a + x.n, 0);

  return (
    <div className="traffic">
      <h3>Page views, last 14 days <span className="muted">({total} total)</span></h3>
      <div className="bars" role="img" aria-label={`Page views per day, ${total} in total`}>
        {days.map((x) => <div key={x.day} className="bar-col" title={`${x.day}: ${x.n}`}><span style={{ height: `${(x.n / max) * 100}%` }} /></div>)}
      </div>
      {d.top.length === 0 ? <p className="muted">No visits recorded yet.</p> : (
        <ul className="toplist">{d.top.map((t) => <li key={t.path}><span>{t.path}</span><b>{t.n}</b></li>)}</ul>
      )}
      <p className="muted" style={{ fontSize: '.85rem' }}>Counts only the day and page. No cookies, no IP addresses, nothing personal.</p>
    </div>
  );
}
