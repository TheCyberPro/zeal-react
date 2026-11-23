import { useEffect, useRef, useState } from 'react';
import { api } from '../../lib/api.js';

export default function LiveChat() {
  const [threads, setThreads] = useState(null);
  const [sel, setSel] = useState(null);
  const [data, setData] = useState({ thread: null, messages: [] });
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const listRef = useRef(null);

  const loadThreads = () => api.get('/admin/chat/threads').then(setThreads).catch((e) => setError(e.message));
  useEffect(() => { loadThreads(); const id = setInterval(loadThreads, 4000); return () => clearInterval(id); }, []);

  const loadThread = (id) => api.get(`/admin/chat/threads/${id}`).then(setData).catch(() => {});
  useEffect(() => {
    if (!sel) return;
    let alive = true;
    const load = () => api.get(`/admin/chat/threads/${sel}`).then((r) => alive && setData(r)).catch(() => {});
    load();
    const id = setInterval(load, 3000);
    return () => { alive = false; clearInterval(id); };
  }, [sel]);

  useEffect(() => { const el = listRef.current; if (el) el.scrollTop = el.scrollHeight; }, [data.messages.length, sel]);

  async function reply(e) {
    e.preventDefault();
    const body = text.trim();
    if (!body || !sel) return;
    setText('');
    try { await api.post(`/admin/chat/threads/${sel}/messages`, { body }); loadThread(sel); loadThreads(); }
    catch (err) { setError(err.message); }
  }
  const setStatus = (status) => api.patch(`/admin/chat/threads/${sel}`, { status }).then(() => { loadThread(sel); loadThreads(); }).catch((e) => setError(e.message));
  const remove = () => confirm('Delete this conversation permanently?') && api.del(`/admin/chat/threads/${sel}`).then(() => { setSel(null); setData({ thread: null, messages: [] }); loadThreads(); }).catch((e) => setError(e.message));

  const t = data.thread;
  return (
    <div>
      <h2>Live chat</h2>
      <p className="muted">Visitors can chat only while you're set to <strong>online</strong> (the Chat button in the sidebar) and this admin is open in a browser tab.</p>
      {error && <p className="notice err" role="alert">{error}</p>}
      {threads === null && <p className="muted">Loading…</p>}
      {threads?.length === 0 && <p className="muted">No conversations yet.</p>}
      {threads?.length > 0 && (
        <div className="chat-admin">
          <ul className="thread-list">
            {threads.map((x) => (
              <li key={x.id}>
                <button type="button" className={`thread${sel === x.id ? ' on' : ''}`} onClick={() => setSel(x.id)}>
                  <span className="row between"><strong>{x.name}</strong>{x.unread > 0 && <span className="chat-badge">{x.unread}</span>}</span>
                  <span className="muted thread-last">{x.last_body}</span>
                  {x.status === 'closed' && <span className="tag">closed</span>}
                </button>
              </li>
            ))}
          </ul>
          <div className="thread-view">
            {!t && <p className="muted">Select a conversation.</p>}
            {t && (
              <>
                <div className="row between">
                  <span>{t.name}{t.email && <> · <a href={`mailto:${t.email}`}>{t.email}</a></>}</span>
                  <span className="row">
                    {t.status === 'open' ? <button type="button" className="btn ghost sm" onClick={() => setStatus('closed')}>End chat</button> : <button type="button" className="btn ghost sm" onClick={() => setStatus('open')}>Reopen</button>}
                    <button type="button" className="btn ghost sm danger" onClick={remove}>Delete</button>
                  </span>
                </div>
                <div className="chat-list admin" ref={listRef}>
                  {data.messages.map((m) => <div key={m.id} className={`bubble ${m.sender === 'team' ? 'visitor' : 'team'}`}>{m.body}</div>)}
                </div>
                {t.status === 'open' && (
                  <form className="chat-input" onSubmit={reply}>
                    <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Write a reply" maxLength={2000} aria-label="Reply" />
                    <button className="btn sm">Send</button>
                  </form>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
