import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import db from '../db.js';

const router = Router();

router.get('/posts', (_req, res) => {
  res.json(
    db
      .prepare('SELECT id, title, slug, excerpt, created_at FROM posts WHERE published = 1 ORDER BY created_at DESC')
      .all()
  );
});

router.get('/posts/:slug', (req, res) => {
  const post = db.prepare('SELECT * FROM posts WHERE slug = ? AND published = 1').get(req.params.slug);
  if (!post) return res.status(404).json({ error: 'Post not found' });
  res.json(post);
});

// Anonymous projects never expose the real name, slug or link.
const publicProject = (p) =>
  p.anonymous ? { ...p, title: p.label || 'Client project', slug: `case-${p.id}`, url: '' } : p;

router.get('/projects', (_req, res) => {
  res.json(
    db
      .prepare('SELECT * FROM projects WHERE published = 1 ORDER BY featured DESC, sort_order, id DESC')
      .all()
      .map(publicProject)
  );
});

router.get('/projects/:slug', (req, res) => {
  const m = /^case-(\d+)$/.exec(req.params.slug);
  const p = m
    ? db.prepare('SELECT * FROM projects WHERE id = ? AND anonymous = 1 AND published = 1').get(m[1])
    : db.prepare('SELECT * FROM projects WHERE slug = ? AND anonymous = 0 AND published = 1').get(req.params.slug);
  if (!p) return res.status(404).json({ error: 'Project not found' });
  res.json(publicProject(p));
});

router.get('/services', (_req, res) => {
  res.json(db.prepare('SELECT * FROM services ORDER BY sort_order, id').all());
});

const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  message: { error: 'Too many messages. Try again later.' },
});

router.post('/contact', contactLimiter, (req, res) => {
  const name = String(req.body?.name || '').trim().slice(0, 120);
  const email = String(req.body?.email || '').trim().slice(0, 200);
  const message = String(req.body?.message || '').trim().slice(0, 5000);
  const honeypot = req.body?.website; // hidden field; bots fill it in
  if (honeypot) return res.json({ ok: true });
  if (!name || !message || !/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ error: 'Enter your name, a valid email, and a message.' });
  }
  db.prepare('INSERT INTO messages (name, email, message) VALUES (?, ?, ?)').run(name, email, message);
  res.status(201).json({ ok: true });
});

export default router;
