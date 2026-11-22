import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api.js';

export default function Blog() {
  const [posts, setPosts] = useState(null);
  useEffect(() => { api.get('/posts').then(setPosts).catch(() => setPosts([])); }, []);

  return (
    <section className="wrap section narrow">
      <h1>Blog</h1>
      {posts === null && <p className="muted">Loading…</p>}
      {posts?.length === 0 && <p className="muted">No posts published yet.</p>}
      {posts?.map((p) => (
        <article key={p.id} className="post-row">
          <h2><Link to={`/blog/${p.slug}`}>{p.title}</Link></h2>
          <p className="muted">{new Date(p.created_at + 'Z').toLocaleDateString()}</p>
          <p>{p.excerpt}</p>
        </article>
      ))}
    </section>
  );
}
