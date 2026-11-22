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
