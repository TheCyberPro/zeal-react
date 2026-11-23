// Replaces ALL projects with six private demo builds (name and link hidden publicly).
// Run from the server folder:  node --env-file=.env scripts/set-private-demos.js
import db from '../src/db.js';

const slugify = (t) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

// Make sure the columns exist (older databases).
const have = db.prepare('PRAGMA table_info(projects)').all().map((c) => c.name);
for (const [name, def] of [['is_demo', 'INTEGER NOT NULL DEFAULT 0'], ['anonymous', 'INTEGER NOT NULL DEFAULT 0'], ['label', "TEXT NOT NULL DEFAULT ''"]]) {
  if (!have.includes(name)) db.exec(`ALTER TABLE projects ADD COLUMN ${name} ${def}`);
}

// Safety copy of the whole database before anything is replaced.
await db.backup('./data/zeal-before-private-demos.db');

// title = your private name (never shown publicly). label, summary and body ARE public, so they use no names.
const items = [
  {
    title: 'The Long Draft', label: 'Author website with admin', year: 2026, tags: 'Node, Express, SQL, Admin panel',
    summary: 'An editorial journal with essays, search, a books shelf, a newsletter sign-up and a private dashboard for writing and publishing.',
    body: 'A demo build showing how an author can run their own site: essays with search and pagination, a books shelf with buy links, a monthly newsletter sign-up, and a private admin where posts are written as drafts, published, edited and trashed.\n\nBuilt with Node, Express and a SQL database.',
  },
  {
    title: 'Marinestar', label: 'Industrial marine website', year: 2026, tags: 'HTML, CSS, Vercel',
    summary: 'A one-page site for an offshore vessel delivery and marine steel brand.',
    body: 'A demo marketing site for an offshore logistics and steel manufacturing brand. Services, fleet, steel products and standards lead into an inquiry form.\n\nIt shows how to present a complex, multi-service business clearly on one page.',
  },
  {
    title: 'Sandbox Payment API', label: 'Payments sandbox API', year: 2026, tags: 'API, Sandbox, Testing',
    summary: 'A mock payments API for sandbox testing.',
    body: 'A developer tool that simulates charges and responses, so checkout flows can be built and tested without moving real money.',
  },
  {
    title: 'Payments Interface', label: 'Checkout interface', year: 2025, tags: 'HTML, CSS, JavaScript',
    summary: 'A checkout and payments interface with a guided purchase flow.',
    body: 'A demo interface exploring a guided checkout, with supporting FAQ and terms pages. A front-end exercise: no real payments are processed.',
  },
  {
    title: 'Zenminer', label: 'Fintech dashboard UI', year: 2026, tags: 'JavaScript, UI design, Vercel',
    summary: 'A data-heavy landing page with a live ticker and sign-in screens.',
    body: 'A front-end exploration of a data-heavy product: a live price ticker, animated statistics, feature panels, and registration and sign-in screens. Interface only: no real accounts or investments.',
  },
  {
    title: 'Livestock', label: 'Livestock web application', year: 2026, tags: 'React, Vercel',
    summary: 'A React web application for a livestock-focused business.',
    body: 'A demo React application built for a livestock-focused business.\n\nEdit this text in the admin to describe what it does.',
  },
];

const add = db.prepare(
  "INSERT INTO projects (title, slug, summary, body, tags, year, url, featured, published, sort_order, is_demo, anonymous, label) VALUES (?, ?, ?, ?, ?, ?, '', 0, 1, ?, 1, 1, ?)"
);
db.transaction(() => {
  db.prepare('DELETE FROM projects').run();
  items.forEach((p, i) => add.run(p.title, slugify(p.title), p.summary, p.body, p.tags, p.year, i, p.label));
})();
console.log(`Saved ${items.length} private demo projects. Backup: data/zeal-before-private-demos.db`);
