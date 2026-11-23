import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api, auth } from '../../lib/api.js';
import Manager from './Manager.jsx';
import Messages from './Messages.jsx';
import Password from './Password.jsx';
import Bookings from './Bookings.jsx';
import Availability from './Availability.jsx';
import Traffic from './Traffic.jsx';
import LiveChat from './LiveChat.jsx';

const PROJECT_FIELDS = [
  { name: 'title', label: 'Title', required: true },
  { name: 'slug', label: 'URL slug', placeholder: 'Leave blank to generate from the title' },
  { name: 'summary', label: 'One-line summary', type: 'textarea', rows: 2 },
  { name: 'body', label: 'Details (blank line between paragraphs)', type: 'textarea', rows: 10 },
  { name: 'tags', label: 'Tags, separated by commas', placeholder: 'React, Node, SQLite' },
  { name: 'year', label: 'Year (0 hides it)', type: 'number' },
  { name: 'url', label: 'Live link (optional)', placeholder: 'https://' },
  { name: 'sort_order', label: 'Sort order (lowest first)', type: 'number' },
  { name: 'is_demo', label: 'Concept or demo build (not a real client)', type: 'checkbox' },
  { name: 'private_view', label: 'Private: visitors see only a lock and the label until they book a demo', type: 'checkbox' },
  { name: 'anonymous', label: 'Anonymous: hide the name, link and URL slug on the public site', type: 'checkbox' },
  { name: 'label', label: 'Public label when anonymous', placeholder: 'e.g. Logistics company website' },
  { name: 'featured', label: 'Featured (listed first)', type: 'checkbox' },
  { name: 'published', label: 'Published', type: 'checkbox' },
];
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
  { name: 'sort_order', label: 'Sort order (lowest first)', type: 'number' },
];
const TABS = [['overview', 'Overview'], ['projects', 'Projects'], ['posts', 'Journal posts'], ['services', 'Services'], ['chat', 'Live chat'], ['bookings', 'Bookings'], ['availability', 'Availability'], ['messages', 'Messages'], ['password', 'Password']];

export default function Dashboard() {
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const navigate = useNavigate();
  const [chat, setChat] = useState({ available: false, online: false, unread: 0 });

  // Check in every 20 seconds so visitors only see chat while an admin is really here.
  useEffect(() => {
    let on = true;
    const beat = () => api.post('/admin/chat/heartbeat').then((r) => on && setChat(r)).catch(() => {});
    beat();
    const id = setInterval(beat, 20000);
    return () => { on = false; clearInterval(id); };
  }, []);
  const toggleChat = () => api.put('/admin/chat/available', { available: !chat.available }).then((r) => setChat((c) => ({ ...c, ...r }))).catch(() => {});

  useEffect(() => { api.get('/admin/stats').then(setStats).catch(() => {}); }, [tab]);

  return (
    <div className="admin">
      <aside>
        <strong className="brand">ZEAL admin</strong>
        <nav aria-label="Admin">
          {TABS.map(([id, name]) => (
            <button key={id} className={tab === id ? 'on' : ''} onClick={() => setTab(id)}>
              {name}{id === 'messages' && stats?.unread > 0 ? ` (${stats.unread})` : ''}{id === 'chat' && chat.unread > 0 ? ` (${chat.unread})` : ''}
            </button>
          ))}
        </nav>
        <button type="button" className={`chat-toggle${chat.online ? ' on' : ''}`} onClick={toggleChat}>{chat.available ? (chat.online ? 'Chat: online' : 'Chat: connecting…') : 'Chat: away (click to go online)'}</button>
        <Link to="/">View site</Link>
        <button className="linklike" onClick={() => { auth.clear(); navigate('/admin/login'); }}>Sign out</button>
      </aside>
      <section className="panel">
        {tab === 'overview' && (
          <div>
            <h2>Overview</h2>
            {!stats ? <p className="muted">Loading…</p> : (
              <div className="grid">
                <div className="item"><h3>{stats.projects}</h3><p>Published projects</p></div>
                <div className="item"><h3>{stats.published} of {stats.posts}</h3><p>Journal posts published</p></div>
                <div className="item"><h3>{stats.services}</h3><p>Services</p></div>
                <div className="item"><h3>{stats.unread}</h3><p>Unread messages</p></div>
                <div className="item"><h3>{stats.bookings}</h3><p>Booking requests</p></div>
              </div>
            )}
            <Traffic />
          </div>
        )}
        {tab === 'chat' && <LiveChat />}
        {tab === 'bookings' && <Bookings />}
        {tab === 'availability' && <Availability />}
        {tab === 'projects' && <Manager resource="projects" label="Project" fields={PROJECT_FIELDS} blank={{ title: '', slug: '', summary: '', body: '', tags: '', year: new Date().getFullYear(), url: '', sort_order: 0, featured: false, published: true, is_demo: false, anonymous: false, private_view: false, label: '' }} />}
        {tab === 'posts' && <Manager resource="posts" label="Post" fields={POST_FIELDS} blank={{ title: '', slug: '', excerpt: '', body: '', published: false }} />}
        {tab === 'services' && <Manager resource="services" label="Service" fields={SERVICE_FIELDS} blank={{ title: '', description: '', sort_order: 0 }} />}
        {tab === 'messages' && <Messages />}
        {tab === 'password' && <Password />}
      </section>
    </div>
  );
}
