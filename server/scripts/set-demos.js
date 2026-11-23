// Replaces the placeholder projects with your real concept builds.
// Run from the server folder:  node --env-file=.env scripts/set-demos.js
import db from '../src/db.js';

const slugify = (t) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const items = [
  {
    title: 'The Long Draft',
    summary: 'An editorial journal for a novelist, with essays, search and a newsletter.',
    body: 'A concept build: a writer\'s journal showing how an author can publish essays, with search, pagination, a monthly newsletter sign-up and a private admin to write and edit posts.\n\nBuilt on Express and SQLite, the same approach this studio uses for its own admin.',
    tags: 'Express, SQLite, Admin panel',
    url: 'https://author-site-snowy.vercel.app/',
    label: '', priv: 0,
  },
  {
    title: 'Marinestar',
    summary: 'A one-page site for an offshore vessel delivery and marine steel company.',
    body: 'A concept marketing site for an offshore logistics and steel manufacturing brand. Sections for services, fleet, steel products and standards lead into an inquiry form.\n\nIt shows how to present a complex, multi-service industrial business clearly on a single page.',
    tags: 'HTML, CSS, Vercel',
    url: '',
    label: 'Industrial marine website', priv: 1,
  },
  {
    title: 'Zenminer',
    summary: 'A data-heavy fintech landing page with a live ticker and sign-in screens.',
    body: 'A concept landing page for a crypto mining platform. It explores a live price ticker, animated statistics, feature modals and legal pages, with registration and sign-in screens.\n\nA front-end and UI exploration of a data-heavy product.',
    tags: 'JavaScript, UI design, Vercel',
    url: '',
    label: 'Fintech landing page', priv: 1,
  },
];

db.prepare('DELETE FROM projects').run();
const add = db.prepare(
  'INSERT INTO projects (title, slug, summary, body, tags, year, url, featured, published, sort_order, is_demo, label, private_view) VALUES (?, ?, ?, ?, ?, 2026, ?, 0, 1, ?, 1, ?, ?)'
);
items.forEach((p, i) => add.run(p.title, slugify(p.title), p.summary, p.body, p.tags, p.url, i, p.label, p.priv));
console.log(`Saved ${items.length} projects.`);
