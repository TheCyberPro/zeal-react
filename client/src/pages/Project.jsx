import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../lib/api.js';
import Cover from '../components/Cover.jsx';

export default function Project() {
  const { slug } = useParams();
  const [p, setP] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setP(null); setError('');
    api.get(`/projects/${slug}`).then(setP).catch((e) => setError(e.message));
  }, [slug]);

  if (error) return <section className="wrap section narrow"><h1>{error}</h1><Link to="/work">Back to work</Link></section>;
  if (!p) return <section className="wrap section narrow"><p className="muted">Loading…</p></section>;

  const tags = String(p.tags || '').split(',').map((t) => t.trim()).filter(Boolean);

  return (
    <article className="wrap section narrow prose">
      <Link to="/work">Back to work</Link>
      <h1 className="page-title">{p.title}</h1>
      <p className="lede">{p.summary}</p>
      <Cover project={p} large />
      {p.is_demo ? <p className="notice ok">This is a concept build created to showcase our work. It is not a live business.</p> : null}
      {p.anonymous ? <p className="muted">Client details are confidential. A live walkthrough is available on request.</p> : null}
      <p className="muted">{[p.year || null, ...tags].filter(Boolean).join(', ')}</p>
      {p.body.split(/\n{2,}/).map((para, i) => <p key={i} style={{ whiteSpace: 'pre-wrap' }}>{para}</p>)}
      {p.url && <p><a className="btn ghost" href={p.url} target="_blank" rel="noopener noreferrer">Visit the project</a></p>}
    </article>
  );
}
