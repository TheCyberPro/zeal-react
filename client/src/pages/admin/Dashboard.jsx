import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api, auth } from '../../lib/api.js';
import Manager from './Manager.jsx';
import Messages from './Messages.jsx';
import Password from './Password.jsx';

const POST_FIELDS = [
  { name: 'title', label: 'Title', required: true },
  { name: 'slug', label: 'URL slug', placeholder: 'Leave blank to generate from the title' },
  { name: 'excerpt', label: 'Excerpt', type: 'textarea', rows: 3 },
  { name: 'body', label: 'Body (blank line between paragraphs)', type: 'textarea', rows: 14 },
  { name: 'published', label: 'Published', type: 'checkbox' },
];
const SERVICE_FIELDS = [
  { name: 'title', label: 'Title', required: true },
  { name: 'description', label: 'Description', type: 'textarea', rows: 4 },
  { name: 'icon', label: 'Icon (emoji or short text)' },
  { name: 'sort_order', label: 'Sort order (lowest first)', type: 'number' },
];
const TABS = [['overview', 'Overview'], ['posts', 'Posts'], ['services', 'Services'], ['messages', 'Messages'], ['password', 'Password']];

export default function Dashboard() {
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const navigate = useNavigate();

  useEffect(() => { api.get('/admin/stats').then(setStats).catch(() => {}); }, [tab]);

  return (
    <div className="admin">
      <aside>
        <strong className="brand">Zeal admin</strong>
        <nav aria-label="Admin">
          {TABS.map(([id, name]) => (
            <button key={id} className={tab === id ? 'on' : ''} onClick={() => setTab(id)}>
              {name}{id === 'messages' && stats?.unread > 0 ? ` (${stats.unread})` : ''}
            </button>
          ))}
        </nav>
        <Link to="/">View site</Link>
        <button className="linklike" onClick={() => { auth.clear(); navigate('/admin/login'); }}>Sign out</button>
      </aside>
      <section className="panel">
        {tab === 'overview' && (
          <div>
            <h2>Overview</h2>
            {!stats ? <p className="muted">Loading…</p> : (
              <div className="grid">
                <div className="item"><h3>{stats.published} of {stats.posts}</h3><p>Posts published</p></div>
                <div className="item"><h3>{stats.services}</h3><p>Services</p></div>
                <div className="item"><h3>{stats.unread}</h3><p>Unread messages</p></div>
              </div>
            )}
          </div>
        )}
        {tab === 'posts' && <Manager resource="posts" label="Post" fields={POST_FIELDS} blank={{ title: '', slug: '', excerpt: '', body: '', published: false }} />}
        {tab === 'services' && <Manager resource="services" label="Service" fields={SERVICE_FIELDS} blank={{ title: '', description: '', icon: '', sort_order: 0 }} />}
        {tab === 'messages' && <Messages />}
        {tab === 'password' && <Password />}
      </section>
    </div>
  );
}
