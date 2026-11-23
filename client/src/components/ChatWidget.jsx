import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

const BASE = (import.meta.env.VITE_API_URL || '') + '/api/chat';
const KEY = 'zeal_chat_token';
const EMPTY = { name: '', email: '', message: '', website: '' };

async function call(method, path, body, token) {
  const res = await fetch(BASE + path, {
    method,
    headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), ...(token ? { 'X-Chat-Token': token } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) { const e = new Error(data.error || 'Request failed'); e.status = res.status; throw e; }
  return data;
}
const store = {
  get: () => { try { return localStorage.getItem(KEY) || ''; } catch { return ''; } },
  set: (v) => { try { localStorage.setItem(KEY, v); } catch { /* private mode */ } },
  clear: () => { try { localStorage.removeItem(KEY); } catch { /* private mode */ } },
};

export default function ChatWidget() {
  const [online, setOnline] = useState(false);
  const [open, setOpen] = useState(false);
  const [token, setToken] = useState(store.get);
  const [messages, setMessages] = useState([]);
  const [ended, setEnded] = useState(false);
  const [seen, setSeen] = useState(0);
  const [form, setForm] = useState(EMPTY);
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const afterRef = useRef(0);
  const pollRef = useRef(null);
  const listRef = useRef(null);
  const lastId = messages.length ? messages[messages.length - 1].id : 0;

  function reset() {
    store.clear(); setToken(''); setMessages([]); setEnded(false); setSeen(0); setError(''); afterRef.current = 0;
  }

  // Without a conversation, just check whether the team is online.
  useEffect(() => {
    if (token) return;
    let alive = true;
    const check = () => call('GET', '/status').then((r) => alive && setOnline(r.online)).catch(() => {});
    check();
    const id = setInterval(check, 30000);
    return () => { alive = false; clearInterval(id); };
  }, [token]);

  // With a conversation, poll for replies (fast while the window is open).
  useEffect(() => {
    if (!token) return;
    let alive = true;
    const poll = () => call('GET', `/thread?after=${afterRef.current}`, null, token).then((r) => {
      if (!alive) return;
      setOnline(r.online);
      if (r.status !== 'open') setEnded(true);
      if (r.messages.length) {
        afterRef.current = r.messages[r.messages.length - 1].id;
        setMessages((m) => [...m, ...r.messages]);
      }
    }).catch((e) => { if (e.status === 404 && alive) reset(); });
    pollRef.current = poll;
    poll();
    const id = setInterval(poll, open ? 3000 : 20000);
    return () => { alive = false; clearInterval(id); };
  }, [token, open]);

  useEffect(() => { if (open) setSeen(lastId); }, [open, lastId]);
  useEffect(() => { const el = listRef.current; if (el) el.scrollTop = el.scrollHeight; }, [messages, open]);

  async function start(e) {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      const r = await call('POST', '/start', form);
      if (!r.token) throw new Error('Could not start the chat. Please try again.');
      afterRef.current = 0; setMessages([]); store.set(r.token); setToken(r.token); setForm(EMPTY);
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  }

  async function send(e) {
    e.preventDefault();
    const body = text.trim();
    if (!body) return;
    setText(''); setError('');
    try {
      await call('POST', '/send', { body }, token);
      pollRef.current?.();
    } catch (err) {
      setError(err.message);
      if (err.status === 409) setEnded(true);
      if (err.status === 404) reset();
    }
  }

  if (!online && !token) return null;
  const unread = !open && messages.some((m) => m.sender === 'team' && m.id > seen);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <>
      {open && (
        <div className="chat-panel" role="dialog" aria-label="Chat with ZEAL">
          <div className="chat-head">
            <div><strong>Chat with ZEAL</strong><span className={`chat-status${online ? ' on' : ''}`}>{online ? 'Online' : 'Offline'}</span></div>
            <button type="button" className="chat-x" onClick={() => setOpen(false)} aria-label="Close chat">×</button>
          </div>

          {!token ? (
            <form className="chat-body stack" onSubmit={start}>
              <p className="muted" style={{ margin: 0 }}>Ask us anything. We usually reply within minutes while we're online.</p>
              {error && <p className="notice err" role="alert">{error}</p>}
              <label>Name<input value={form.name} onChange={set('name')} required maxLength={80} /></label>
              <label>Email (optional)<input type="email" value={form.email} onChange={set('email')} /></label>
              <label>Message<textarea rows={3} value={form.message} onChange={set('message')} required maxLength={1000} /></label>
              <input className="hp" tabIndex={-1} autoComplete="off" aria-hidden="true" value={form.website} onChange={set('website')} name="website" />
              <button className="btn" disabled={busy}>{busy ? 'Starting…' : 'Start chat'}</button>
              <p className="muted" style={{ margin: 0, fontSize: '.8rem' }}>Chats are saved so we can reply.</p>
            </form>
          ) : (
            <>
              <div className="chat-list" ref={listRef} aria-live="polite">
                {messages.map((m) => <div key={m.id} className={`bubble ${m.sender}`}>{m.body}</div>)}
              </div>
              {!online && !ended && <p className="chat-note">The team is offline right now. Your messages are saved and we'll reply when we're back, or <Link to="/contact?demo=1" onClick={() => setOpen(false)}>book a demo</Link>.</p>}
              {error && <p className="chat-note err" role="alert">{error}</p>}
              {ended ? (
                <p className="chat-note">This chat has ended. <button type="button" className="linklike" onClick={reset}>Start a new chat</button></p>
              ) : (
                <form className="chat-input" onSubmit={send}>
                  <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message" maxLength={1000} aria-label="Message" />
                  <button className="btn sm">Send</button>
                </form>
              )}
            </>
          )}
        </div>
      )}
      <button type="button" className="chat-fab" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <span className={`chat-dot${online ? ' on' : ''}`} />
        {open ? 'Close chat' : 'Chat with us'}
        {unread && <span className="chat-badge">New reply</span>}
      </button>
    </>
  );
}
