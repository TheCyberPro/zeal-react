import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import db from '../db.js';
import { sendMail, clean } from '../mailer.js';
import { getAvailability, computeSlots } from '../slots.js';

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
const publicProject = (p) => {
  // Private projects expose only a label and a lock: no summary, details, stack or link.
  if (p.private_view) {
    return {
      id: p.id, slug: `case-${p.id}`, title: p.label || 'Private project',
      summary: 'Shown in a private walkthrough.', body: '', tags: '', url: '', year: 0,
      is_demo: p.is_demo, anonymous: 1, private_view: 1, featured: p.featured, sort_order: p.sort_order,
    };
  }
  return p.anonymous ? { ...p, title: p.label || 'Client project', slug: `case-${p.id}`, url: '' } : p;
};

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
    ? db.prepare('SELECT * FROM projects WHERE id = ? AND (anonymous = 1 OR private_view = 1) AND published = 1').get(m[1])
    : db.prepare('SELECT * FROM projects WHERE slug = ? AND anonymous = 0 AND private_view = 0 AND published = 1').get(req.params.slug);
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
  sendMail({
    subject: `New message from ${clean(name)}`,
    text: `Name: ${name}\nEmail: ${email}\n\n${message}\n\nReply directly to this email, or read it in the admin under Messages.`,
    replyTo: email,
  });
  res.status(201).json({ ok: true });
});

// ---- Booking calendar ----
router.get('/slots', (_req, res) => {
  const cfg = getAvailability(db);
  const taken = new Set(db.prepare("SELECT slot_start FROM bookings WHERE status <> 'cancelled'").all().map((r) => r.slot_start));
  res.json({ tz: cfg.tz, slots: computeSlots(cfg).filter((s) => !taken.has(s)) });
});

const bookLimiter = rateLimit({ windowMs: 60 * 60 * 1000, limit: 6, message: { error: 'Too many requests. Try again later.' } });

router.post('/bookings', bookLimiter, (req, res) => {
  if (req.body?.website) return res.json({ ok: true }); // honeypot
  const name = String(req.body?.name || '').trim().slice(0, 120);
  const email = String(req.body?.email || '').trim().slice(0, 200);
  const notes = String(req.body?.notes || '').trim().slice(0, 2000);
  const slot = String(req.body?.slot || '');
  if (!name || !/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ error: 'Enter your name and a valid email.' });
  const cfg = getAvailability(db);
  if (!computeSlots(cfg).includes(slot)) return res.status(400).json({ error: 'That time is no longer available. Please pick another.' });
  try {
    db.prepare('INSERT INTO bookings (name, email, notes, slot_start) VALUES (?, ?, ?, ?)').run(name, email, notes, slot);
  } catch (e) {
    if (String(e.code).startsWith('SQLITE_CONSTRAINT')) return res.status(409).json({ error: 'Someone just took that time. Please pick another.' });
    throw e;
  }
  const when = new Date(slot).toLocaleString('en-GB', { timeZone: cfg.tz, dateStyle: 'full', timeStyle: 'short' });
  sendMail({
    subject: `New demo booking: ${when}`,
    text: [`${name} (${email}) requested a demo.`, `When: ${when} (${cfg.tz})`, notes ? `\nNotes:\n${notes}` : '', '\nConfirm or cancel it in the admin, under Bookings.'].join('\n'),
    replyTo: email,
  });
  res.status(201).json({ ok: true });
});

// ---- Privacy-friendly page counter: stores only day, path and a count. No cookies, no IPs. ----
const hitLimiter = rateLimit({ windowMs: 60 * 1000, limit: 120 });
router.post('/hit', hitLimiter, (req, res) => {
  const path = String(req.body?.path || '');
  if (!/^\/[A-Za-z0-9\-_/]*$/.test(path) || path.length > 120 || path.startsWith('/admin')) return res.json({ ok: true });
  const day = new Date().toISOString().slice(0, 10);
  db.prepare('INSERT INTO page_views (day, path, count) VALUES (?, ?, 1) ON CONFLICT(day, path) DO UPDATE SET count = count + 1').run(day, path);
  res.json({ ok: true });
});

export default router;
