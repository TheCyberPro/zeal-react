import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../lib/api.js';

export default function Post() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setPost(null); setError('');
    api.get(`/posts/${slug}`).then(setPost).catch((e) => setError(e.message));
  }, [slug]);

  if (error) return <section className="wrap section narrow"><h1>{error}</h1><Link to="/blog">Back to blog</Link></section>;
  if (!post) return <section className="wrap section narrow"><p className="muted">Loading…</p></section>;

  return (
    <article className="wrap section narrow">
      <Link to="/blog">Back to blog</Link>
      <h1>{post.title}</h1>
      <p className="muted">{new Date(post.created_at + 'Z').toLocaleDateString()}</p>
      {/* Rendered as plain text, so admin content can never inject HTML. */}
      {post.body.split(/\n{2,}/).map((para, i) => <p key={i} style={{ whiteSpace: 'pre-wrap' }}>{para}</p>)}
    </article>
  );
}
