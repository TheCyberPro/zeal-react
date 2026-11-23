import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import fs from 'node:fs';
import path from 'node:path';

const file = path.resolve(process.env.DB_PATH || './data/zeal.db');
fs.mkdirSync(path.dirname(file), { recursive: true });

const db = new Database(file);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL DEFAULT '',
  published INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  summary TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL DEFAULT '',
  tags TEXT NOT NULL DEFAULT '',
  year INTEGER NOT NULL DEFAULT 0,
  url TEXT NOT NULL DEFAULT '',
  featured INTEGER NOT NULL DEFAULT 0,
  published INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS services (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  icon TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
`);

// Migrate older databases: columns for demo and anonymous projects.
{
  const have = db.prepare('PRAGMA table_info(projects)').all().map((c) => c.name);
  for (const [name, def] of [
    ['is_demo', 'INTEGER NOT NULL DEFAULT 0'],
    ['anonymous', 'INTEGER NOT NULL DEFAULT 0'],
    ['label', "TEXT NOT NULL DEFAULT ''"],
  ]) {
    if (!have.includes(name)) db.exec(`ALTER TABLE projects ADD COLUMN ${name} ${def}`);
  }
}

// Seed the first admin from env if there are no users yet.
if (!db.prepare('SELECT 1 FROM users LIMIT 1').get()) {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (email && password) {
    db.prepare('INSERT INTO users (email, password_hash) VALUES (?, ?)').run(
      email.toLowerCase(),
      bcrypt.hashSync(password, 12)
    );
    console.log(`Created admin user ${email}`);
  } else {
    console.warn('No users exist. Set ADMIN_EMAIL and ADMIN_PASSWORD and restart to create one.');
  }
}

// ---- First-run content, carried over from the old site. Edit or delete it in /admin. ----
const slugify = (t) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

if (!db.prepare('SELECT 1 FROM services LIMIT 1').get()) {
  const add = db.prepare('INSERT INTO services (title, description, sort_order) VALUES (?, ?, ?)');
  [
    ['Enterprise Web Platforms', 'Resilient, scalable platforms for mission-critical operations, built to enterprise SLAs.'],
    ['Ecommerce & Conversion', 'High-converting stores with headless architecture and fast checkout flows.'],
    ['UX, UI & Design Systems', 'Accessible, consistent interfaces and design systems that scale with your product.'],
    ['API Strategy & Integrations', 'Secure, developer-friendly APIs and integrations that unlock ecosystem value.'],
    ['Performance Engineering', 'Lighthouse-grade speed: caching, edge delivery and Core Web Vitals that stay green.'],
    ['Security & Compliance', 'Security by design, with compliance readiness for regulated industries.'],
    ['Growth, Analytics & CRO', 'Experimentation, analytics and conversion work that turns traffic into revenue.'],
  ].forEach(([t, d], i) => add.run(t, d, i));
}

if (!db.prepare('SELECT 1 FROM projects LIMIT 1').get()) {
  const add = db.prepare('INSERT INTO projects (title, slug, summary, body, tags, sort_order) VALUES (?, ?, ?, ?, ?, ?)');
  [
    ['Resilient Microservices', 'Microservices with automated CI/CD, health checks and zero-downtime deploys.', 'Designed and shipped a microservices architecture with automated CI/CD, health checks, and zero-downtime deploys. Reduced incident recovery time by 72%.', 'Microservices, CI/CD, Cloud-native'],
    ['Headless Commerce', 'A migration to composable storefronts and payment orchestration.', 'Led a migration to a headless commerce stack with composable storefronts and payment orchestration. Achieved a 28% improvement in checkout conversion.', 'Headless, Payments, Ecommerce'],
    ['Design System', 'Accessible components, tokens and a Figma-to-code pipeline.', 'Created a production-ready design system with tokens, accessible components, and Figma-to-code pipelines. Cut new feature UI time by 35%.', 'Design tokens, Components, Accessibility'],
    ['Performance Wins', 'Faster core pages and consistently green Core Web Vitals.', 'Delivered Lighthouse improvements across core pages: LCP down 45%, TTFB improved by 60%, and Core Web Vitals scores consistently green.', 'Performance, CDN, Edge'],
    ['API-First Integrations', 'A REST and GraphQL layer with observability and contract tests.', 'Built a robust API layer (REST + GraphQL) with strong observability and contract tests, enabling partner onboarding in under 2 weeks.', 'REST, GraphQL, OAuth'],
    ['Data-Driven Growth', 'An experimentation framework that surfaced funnel wins.', 'Established an experimentation framework and analytics instrumentation that surfaced high-impact funnel optimizations, increasing AOV.', 'Analytics, A/B testing, CRO'],
  ].forEach(([t, sum, body, tags], i) => add.run(t, slugify(t), sum, body, tags, i));
}

export default db;
