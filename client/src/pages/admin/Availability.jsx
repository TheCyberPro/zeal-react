import { useEffect, useState } from 'react';
import { api } from '../../lib/api.js';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function Availability() {
  const [cfg, setCfg] = useState(null);
  const [msg, setMsg] = useState({ ok: false, text: '' });
  useEffect(() => { api.get('/admin/availability').then(setCfg).catch((e) => setMsg({ ok: false, text: e.message })); }, []);
  if (!cfg) return <p className="muted">Loading…</p>;

  const num = (k) => (e) => setCfg({ ...cfg, [k]: Number(e.target.value) });
  const toggle = (d) => setCfg({ ...cfg, days: cfg.days.includes(d) ? cfg.days.filter((x) => x !== d) : [...cfg.days, d] });

  async function save(e) {
    e.preventDefault();
    try { setCfg(await api.put('/admin/availability', cfg)); setMsg({ ok: true, text: 'Saved. The calendar on the site updates immediately.' }); }
    catch (err) { setMsg({ ok: false, text: err.message }); }
  }

  return (
    <form onSubmit={save} className="stack">
      <h2>Availability</h2>
      <p className="muted">Set the hours visitors can book demos. Booked and cancelled times update on their own.</p>
      {msg.text && <p className={`notice ${msg.ok ? 'ok' : 'err'}`} role="status">{msg.text}</p>}
      <label>Your time zone<input value={cfg.tz} onChange={(e) => setCfg({ ...cfg, tz: e.target.value })} placeholder="Europe/Amsterdam" required /></label>
      <fieldset style={{ border: 0, padding: 0 }}>
        <legend style={{ font: '600 .9rem var(--sans)', marginBottom: '.4rem' }}>Days you take demos</legend>
        <div className="row">
          {DAYS.map((name, d) => (
            <label key={d} className="check"><input type="checkbox" checked={cfg.days.includes(d)} onChange={() => toggle(d)} />{name}</label>
          ))}
        </div>
      </fieldset>
      <div className="grid">
        <label>Start hour (0 to 23)<input type="number" min="0" max="23" value={cfg.start} onChange={num('start')} /></label>
        <label>End hour (1 to 24)<input type="number" min="1" max="24" value={cfg.end} onChange={num('end')} /></label>
        <label>Slot length (minutes)<input type="number" min="15" max="180" step="5" value={cfg.slot} onChange={num('slot')} /></label>
        <label>Minimum notice (hours)<input type="number" min="0" max="168" value={cfg.notice} onChange={num('notice')} /></label>
        <label>Show days ahead<input type="number" min="1" max="60" value={cfg.horizon} onChange={num('horizon')} /></label>
      </div>
      <button className="btn">Save availability</button>
    </form>
  );
}
