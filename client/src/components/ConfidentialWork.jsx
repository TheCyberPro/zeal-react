import { Link } from 'react-router-dom';

// No URLs or client names on purpose. Edit titles and blurbs freely.
// Set concept: true on anything that was not paid client work.
const ITEMS = [
  { sector: 'Finance', title: 'Business banking platform', blurb: 'Landing, onboarding, pricing and account sign-in flows.', tags: ['Landing', 'Onboarding', 'Auth'], hue: 222 },
  { sector: 'Agritech', title: 'Livestock management app', blurb: 'React web app for tracking and managing livestock records.', tags: ['React', 'Web app'], hue: 142 }, // CHECK
  { sector: 'Payments', title: 'Payments platform', blurb: 'Web front end for payment flows and account activity.', tags: ['Payments', 'Web app'], hue: 262 }, // CHECK
  { sector: 'Developer tools', title: 'Mock payments API', blurb: 'Sandbox API for testing payment integrations safely.', tags: ['API', 'Sandbox'], hue: 200, concept: true },
  { sector: 'Maritime', title: 'Marine logistics and steel site', blurb: 'Marketing site for vessel delivery and steel manufacturing, with an enquiry form.', tags: ['Marketing site', 'Enquiry form'], hue: 205 },
  { sector: 'Publishing', title: 'Author journal and newsletter', blurb: 'Essay journal with search, newsletter sign-up and an admin area.', tags: ['Journal', 'Newsletter', 'Admin'], hue: 28 },
  { sector: 'Crypto', title: 'Crypto platform front end', blurb: 'Landing page, sign-in and dashboard interface.', tags: ['Landing', 'Auth', 'Dashboard UI'], hue: 280 },
];

function LockIcon({ big }) {
  const s = big ? 34 : 14;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="4" y="11" width="16" height="10" rx="2.5" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

export default function ConfidentialWork() {
  return (
    <section className="cw" aria-labelledby="cw-title">
      <div className="cw-head">
        <span className="cw-eyebrow"><LockIcon /> Confidential</span>
        <h2 id="cw-title">More work, kept private</h2>
        <p className="lede">Not every build is shown publicly. This is the range of what we have made, with names and links withheld. A private walkthrough is available on request.</p>
      </div>
      <ul className="cw-grid">
        {ITEMS.map((it) => (
          <li key={it.title} className="cw-card" style={{ '--h': it.hue }}>
            <div className="cw-cover" aria-hidden="true">
              <LockIcon big />
              <span className="cw-bars"><i /><i /><i /></span>
            </div>
            <div className="cw-body">
              <div className="cw-meta">
                <span>{it.sector}</span>
                {it.concept && <span className="cw-chip">Concept build</span>}
              </div>
              <h3>{it.title}</h3>
              <p>{it.blurb}</p>
              <span className="cw-tags">{it.tags.join(' · ')}</span>
            </div>
          </li>
        ))}
      </ul>
      <p className="cw-cta"><Link className="btn" to="/contact?demo=1">Request a private walkthrough</Link></p>
    </section>
  );
}
