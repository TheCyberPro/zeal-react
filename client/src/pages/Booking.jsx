import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api.js';

const dayKey = (iso) => new Date(iso).toLocaleDateString('en-CA'); // YYYY-MM-DD in the visitor's time zone
const dayLabel = (iso) => new Date(iso).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
const timeLabel = (iso) => new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
const EMPTY = { name: '', email: '', notes: '', website: '' };

export default function Booking() {
  const [data, setData] = useState(null);
  const [day, setDay] = useState('');
  const [slot, setSlot] = useState('');
  const [form, setForm] = useState(EMPTY);
  const [state, setState] = useState({ busy: false, error: '', done: '' });

  const load = () => api.get('/slots').then(setData).catch(() => setData({ slots: [] }));
  useEffect(() => { load(); }, []);

  const byDay = useMemo(() => {
    const m = new Map();
    (data?.slots || []).forEach((s) => { const k = dayKey(s); m.set(k, [...(m.get(k) || []), s]); });
    return m;
  }, [data]);

  const days = [...byDay.keys()];
  const activeDay = day && byDay.has(day) ? day : days[0];
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setState({ busy: true, error: '', done: '' });
    try {
      await api.post('/bookings', { ...form, slot });
      setState({ busy: false, error: '', done: slot });
    } catch (err) {
      setState({ busy: false, error: err.message, done: '' });
      setSlot('');
      load();
    }
  }

  if (state.done) {
    return (
      <section className="wrap section narrow">
        <h1>You're on the calendar.</h1>
        <p className="lede">{new Date(state.done).toLocaleString(undefined, { dateStyle: 'full', timeStyle: 'short' })}</p>
        <p>We'll confirm by email shortly. Until then the time is held for you.</p>
        <Link className="btn ghost" to="/">Back to home</Link>
      </section>
    );
  }

  return (
    <section className="wrap section narrow booking">
      <h1>Book a demo</h1>
      <p className="lede">Choose a time for a private walkthrough of our work. Times are shown in your local time zone{data?.tz ? ` (we're on ${data.tz})` : ''}.</p>

      {data === null && <p className="muted">Loading available times…</p>}
      {data && days.length === 0 && (
        <p className="notice err">No times are open right now. <Link to="/contact">Send us a message</Link> and we'll find a time.</p>
      )}

      {days.length > 0 && (
        <>
          <div className="days" role="group" aria-label="Choose a day">
            {days.map((d) => (
              <button type="button" key={d} className="chip" aria-pressed={d === activeDay} onClick={() => { setDay(d); setSlot(''); }}>
                {dayLabel(byDay.get(d)[0])}
              </button>
            ))}
          </div>
          <div className="times" role="group" aria-label="Choose a time">
            {byDay.get(activeDay).map((s) => (
              <button type="button" key={s} className="chip" aria-pressed={s === slot} onClick={() => setSlot(s)}>{timeLabel(s)}</button>
            ))}
          </div>
        </>
      )}

      {slot && (
        <form onSubmit={submit} className="stack">
          <h2>Your details</h2>
          {state.error && <p className="notice err" role="alert">{state.error}</p>}
          <label>Name<input value={form.name} onChange={set('name')} required maxLength={120} /></label>
          <label>Email<input type="email" value={form.email} onChange={set('email')} required /></label>
          <label>What are you planning to build?<textarea rows={4} value={form.notes} onChange={set('notes')} maxLength={2000} /></label>
          <input className="hp" tabIndex={-1} autoComplete="off" aria-hidden="true" value={form.website} onChange={set('website')} name="website" />
          <button className="btn" disabled={state.busy}>{state.busy ? 'Booking…' : `Book ${dayLabel(slot)} at ${timeLabel(slot)}`}</button>
        </form>
      )}
      {!slot && state.error && <p className="notice err" role="alert">{state.error}</p>}
      <p className="muted" style={{ marginTop: '2rem' }}>Prefer to write? <Link to="/contact">Send a message instead</Link>.</p>
    </section>
  );
}
