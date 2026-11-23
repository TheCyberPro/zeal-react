import { Link } from 'react-router-dom';
import Browser from './Browser.jsx';
import Cover from './Cover.jsx';
import Reveal from './Reveal.jsx';

const parts = (p) => [p.is_demo ? 'Concept build' : null, p.year || null, ...String(p.tags || '').split(',').map((t) => t.trim())].filter(Boolean);

export default function WorkList({ items }) {
  return (
    <ul className="work-grid">
      {items.map((p, i) => (
        <Reveal as="li" key={p.id} delay={(i % 2) * 90}>
          <Link to={`/work/${p.slug}`} className="work-card">
            <Browser url={p.url ? p.url.replace(/^https?:\/\//, '') : p.anonymous ? 'confidential' : 'concept'}>
              <Cover project={p} />
            </Browser>
            <div className="work-meta">
              <h3>{p.title}</h3>
              <p>{p.summary}</p>
              <span className="work-tags">{parts(p).join(', ')}</span>
            </div>
          </Link>
        </Reveal>
      ))}
    </ul>
  );
}
