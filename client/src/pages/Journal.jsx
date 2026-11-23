import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api.js';

export default function Journal() {
  const [posts, setPosts] = useState(null);
  useEffect(() => { api.get('/posts').then(setPosts).catch(() => setPosts([])); }, []);

  return (
    <section className="wrap section narrow">
      <h1 className="page-title">Journal</h1>
      {posts === null && <p className="muted">Loading…</p>}
      {posts?.length === 0 && <p className="muted">No posts published yet.</p>}
      {posts?.map((p) => (
        <article key={p.id} className="post-row">
          <p className="muted">{new Date(p.created_at + 'Z').toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}</p>
          <h2><Link to={`/journal/${p.slug}`}>{p.title}</Link></h2>
          <p>{p.excerpt}</p>
        </article>
      ))}
    </section>
  );
}
