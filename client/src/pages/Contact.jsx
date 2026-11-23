import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../lib/api.js';
import Booking from './Booking.jsx';

const EMPTY = { name: '', email: '', message: '', website: '' };

export default function Contact() {
  const [params] = useSearchParams();
  const demo = !!params.get('demo');
  const [form, setForm] = useState({ ...EMPTY, message: demo ? "I'd like to book a demo. Here is what I'm planning to build:\n\n" : '' });
  const [status, setStatus] = useState({ state: 'idle', error: '' });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setStatus({ state: 'sending', error: '' });
    try {
      await api.post('/contact', form);
      setStatus({ state: 'sent', error: '' });
      setForm(EMPTY);
    } catch (err) {
      setStatus({ state: 'idle', error: err.message });
    }
  }

  if (demo) return <Booking />;

  return (
    <section className="wrap section narrow">
      <h1>{demo ? 'Book a demo' : 'Contact'}</h1>
      {status.state === 'sent' && <p className="notice ok" role="status">Message sent. We'll reply by email.</p>}
      {status.error && <p className="notice err" role="alert">{status.error}</p>}
      <form onSubmit={submit} className="stack">
        <label>Name<input value={form.name} onChange={set('name')} required maxLength={120} /></label>
        <label>Email<input type="email" value={form.email} onChange={set('email')} required /></label>
        <label>Message<textarea rows={6} value={form.message} onChange={set('message')} required maxLength={5000} /></label>
        {/* Honeypot: hidden from people, filled in by bots */}
        <input className="hp" tabIndex={-1} autoComplete="off" aria-hidden="true" value={form.website} onChange={set('website')} name="website" />
        <button className="btn" disabled={status.state === 'sending'}>{status.state === 'sending' ? 'Sending…' : 'Send message'}</button>
      </form>
    </section>
  );
}
