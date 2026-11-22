import { Router } from 'express';
import bcrypt from 'bcryptjs';
import db from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

const slugify = (s) =>
  String(s).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);

// Only whitelisted columns are ever interpolated into SQL; values are always bound.
function pick(body, fields) {
  const out = {};
  for (const f of fields) {
    if (body?.[f] === undefined) continue;
    const v = body[f];
    out[f] = typeof v === 'boolean' ? Number(v) : typeof v === 'string' ? v.trim() : v;
  }
  return out;
}

function crud(table, fields, { order = 'id DESC', prepare } = {}) {
  const r = Router();

  r.get('/', (_req, res) => res.json(db.prepare(`SELECT * FROM ${table} ORDER BY ${order}`).all()));

  r.post('/', (req, res) => {
    const data = pick(req.body, fields);
    if (prepare) prepare(data, true);
    if (!data.title) return res.status(400).json({ error: 'Title is required' });
    const cols = Object.keys(data);
    try {
      const info = db
        .prepare(`INSERT INTO ${table} (${cols.join(',')}) VALUES (${cols.map((c) => '@' + c).join(',')})`)
        .run(data);
      res.status(201).json(db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(info.lastInsertRowid));
    } catch (e) {
      if (String(e.code).startsWith('SQLITE_CONSTRAINT')) return res.status(409).json({ error: 'That slug is already in use' });
      throw e;
    }
  });

  r.put('/:id', (req, res) => {
    const data = pick(req.body, fields);
    if (prepare) prepare(data, false);
    const cols = Object.keys(data);
    if (!cols.length) return res.status(400).json({ error: 'Nothing to update' });
    try {
      const info = db
        .prepare(`UPDATE ${table} SET ${cols.map((c) => `${c} = @${c}`).join(',')} WHERE id = @id`)
        .run({ ...data, id: req.params.id });
      if (!info.changes) return res.status(404).json({ error: 'Not found' });
      res.json(db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(req.params.id));
    } catch (e) {
      if (String(e.code).startsWith('SQLITE_CONSTRAINT')) return res.status(409).json({ error: 'That slug is already in use' });
      throw e;
    }
  });

  r.delete('/:id', (req, res) => {
    const info = db.prepare(`DELETE FROM ${table} WHERE id = ?`).run(req.params.id);
    if (!info.changes) return res.status(404).json({ error: 'Not found' });
    res.json({ ok: true });
  });

  return r;
}

router.use(
  '/posts',
  crud('posts', ['title', 'slug', 'excerpt', 'body', 'published'], {
    prepare(data, creating) {
      if (data.slug !== undefined || creating) data.slug = slugify(data.slug || data.title || '');
    },
  })
);
router.use('/services', crud('services', ['title', 'description', 'icon', 'sort_order'], { order: 'sort_order, id' }));

// Messages: list, mark read/unread, delete
router.get('/messages', (_req, res) => res.json(db.prepare('SELECT * FROM messages ORDER BY created_at DESC').all()));
router.patch('/messages/:id', (req, res) => {
  db.prepare('UPDATE messages SET is_read = ? WHERE id = ?').run(req.body?.is_read ? 1 : 0, req.params.id);
  res.json({ ok: true });
});
router.delete('/messages/:id', (req, res) => {
  db.prepare('DELETE FROM messages WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

router.get('/stats', (_req, res) => {
  const count = (sql) => db.prepare(sql).get().n;
  res.json({
    posts: count('SELECT COUNT(*) n FROM posts'),
    published: count('SELECT COUNT(*) n FROM posts WHERE published = 1'),
    services: count('SELECT COUNT(*) n FROM services'),
    unread: count('SELECT COUNT(*) n FROM messages WHERE is_read = 0'),
  });
});

router.post('/password', (req, res) => {
  const { current, next } = req.body || {};
  if (!next || String(next).length < 10) return res.status(400).json({ error: 'New password must be at least 10 characters' });
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.sub);
  if (!user || !bcrypt.compareSync(String(current || ''), user.password_hash)) {
    return res.status(400).json({ error: 'Current password is incorrect' });
  }
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(bcrypt.hashSync(String(next), 12), user.id);
  res.json({ ok: true });
});

export default router;
