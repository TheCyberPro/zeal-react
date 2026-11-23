import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api.js';
import WorkList from '../components/WorkList.jsx';
import Browser from '../components/Browser.jsx';
import Reveal from '../components/Reveal.jsx';

const STEPS = [
  ['Discover', 'We learn your goals, audience and constraints, then agree on scope and a plan.'],
  ['Design', 'Layouts, type and color, shown as a clickable prototype before any code is written.'],
  ['Build', 'A fast React front end, a secure API, and an admin so you can edit content yourself.'],
  ['Launch', 'We deploy, test across devices, and stay on hand for fixes and improvements.'],
];
const STACK = ['React', 'Vite', 'Node.js', 'Express', 'SQLite', 'Vercel'];

export default function Home() {
  const [projects, setProjects] = useState(null);
  const [services, setServices] = useState(null);

  useEffect(() => {
    api.get('/projects').then(setProjects).catch(() => setProjects([]));
    api.get('/services').then(setServices).catch(() => setServices([]));
  }, []);

  return (
    <>
      <section className="hero-dark">
        <div className="wrap hero-grid">
          <div>
            <p className="badge"><span className="pulse" />Taking on new projects</p>
            <h1>Websites and web apps, built to perform.</h1>
            <p className="lede">ZEAL is a web development studio. Design, code, hosting and support, from first sketch to launch.</p>
            <div className="row">
              <Link className="btn" to="/contact?demo=1">Book a demo</Link>
              <Link className="btn ghost" to="/work">See our work</Link>
            </div>
          </div>
          <div className="hero-visual" aria-hidden="true">
            <Browser url="yourbrand.com">
              <div className="wf">
                <div className="wf-nav"><i /><b /><b /><b /></div>
                <div className="wf-hero"><span className="wf-h" /><span className="wf-h short" /><span className="wf-p" /><div className="wf-btns"><i /><i /></div></div>
                <div className="wf-cards"><i /><i /><i /></div>
              </div>
            </Browser>
            <pre className="code-card"><code>
              <div><span className="k">const</span> project = {'{'}</div>
              <div className="i">design: <span className="s">"custom"</span>,</div>
              <div className="i">stack: [<span className="s">"React"</span>, <span className="s">"Node"</span>],</div>
              <div className="i">status: <span className="s">"live"</span>,</div>
              <div>{'}'};</div>
            </code></pre>
          </div>
        </div>
        <div className="wrap stack-strip">
          <span>Built with</span>
          {STACK.map((s) => <b key={s}>{s}</b>)}
        </div>
      </section>

      <section className="wrap section" id="work">
        <Reveal className="head">
          <h2>Selected work</h2>
          <Link to="/work">See all work</Link>
        </Reveal>
        {projects === null && <p className="muted">Loading…</p>}
        {projects?.length === 0 && <p className="muted">No projects published yet.</p>}
        {projects && <WorkList items={projects.slice(0, 4)} />}
      </section>

      <section className="wrap section" id="services">
        <Reveal className="section-head">
          <h2>What we do</h2>
          <p className="lede">Everything a modern website needs, handled in one place.</p>
        </Reveal>
        {services === null && <p className="muted">Loading…</p>}
        {services?.length === 0 && <p className="muted">No services listed yet.</p>}
        <div className="svc-grid">
          {services?.map((s) => (
            <article key={s.id} className="svc-card">
              <h3>{s.title}</h3>
              <p>{s.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="wrap section" id="process">
        <Reveal className="section-head">
          <h2>How a project runs</h2>
          <p className="lede">A clear path from first call to launch.</p>
        </Reveal>
        <ol className="steps">
          {STEPS.map(([title, text], i) => (
            <Reveal as="li" key={title} className="step" delay={i * 80}>
              <span className="step-n">{i + 1}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </Reveal>
          ))}
        </ol>
      </section>

      <section className="wrap section">
        <Reveal as="blockquote" className="quote">
          <p>Reliable, secure, and beautifully executed.</p>
          <cite>Lola M., Head of Growth</cite>
        </Reveal>
      </section>

      <section className="wrap section">
        <Reveal className="cta-panel">
          <h2>Have a project in mind?</h2>
          <p className="lede">Tell us what you're building. We'll reply by email with next steps.</p>
          <Link className="btn" to="/contact?demo=1">Book a demo</Link>
        </Reveal>
      </section>
    </>
  );
}
