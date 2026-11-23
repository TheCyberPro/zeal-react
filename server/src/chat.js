// Live chat: visitors talk to the team while an admin is marked online.
// Messages are kept in SQLite and fetched by short polling, which works on any host.
import { Router } from 'express';
import crypto from 'node:crypto';
import rateLimit from 'express-rate-limit';
import db from './db.js';
import { sendMail, clean } from './mailer.js';

const hash = (t) => crypto.createHash('sha256').update(t).digest('hex');
const getSetting = (k) => db.prepare('SELECT value FROM settings WHERE key = ?').get(k)?.value;
const setSetting = (k, v) =>
  db.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value').run(k, String(v));

// Online = an admin switched chat on AND their dashboard checked in within the last minute.
export const isOnline = () => getSetting('chat_available') === '1' && Date.now() - Number(getSetting('chat_seen') || 0) < 60000;

const text = (v, max) => String(v || '').trim().slice(0, max);

function notifyOwner(t, body) {
  if (Date.now() - t.notified_at < 10 * 60 * 1000) return; // at most one email per chat every 10 minutes
  db.prepare('UPDATE chat_threads SET notified_at = ? WHERE id = ?').run(Date.now(), t.id);
  sendMail({
    subject: `Live chat from ${clean(t.name)}`,
    text: `${t.name}${t.email ? ` <${t.email}>` : ''} wrote:\n\n${body}\n\nReply in the admin under Live chat.`,
    replyTo: t.email || undefined,
  });
}

// ---------------- visitor side ----------------
export const publicChat = Router();

const startLimiter = rateLimit({ windowMs: 60 * 60 * 1000, limit: 5, message: { error: 'Too many chats started. Try again later.' } });
const sendLimiter = rateLimit({ windowMs: 60 * 1000, limit: 40, message: { error: 'Slow down a little.' } });
const pollLimiter = rateLimit({ windowMs: 60 * 1000, limit: 90 });

function threadFor(req) {
  const token = String(req.get('x-chat-token') || '');
  if (!/^[a-f0-9]{48}$/.test(token)) return null;
  return db.prepare('SELECT * FROM chat_threads WHERE token_hash = ?').get(hash(token)) || null;
}

publicChat.get('/status', pollLimiter, (_req, res) => res.json({ online: isOnline() }));

publicChat.post('/start', startLimiter, (req, res) => {
  if (req.body?.website) return res.json({ ok: true }); // honeypot
  if (!isOnline()) return res.status(409).json({ error: 'The team just went offline. Please book a demo or send a message instead.' });
  const name = text(req.body?.name, 80);
  const email = text(req.body?.email, 200);
  const body = text(req.body?.message, 1000);
  if (!name || !body) return res.status(400).json({ error: 'Add your name and a first message.' });
  if (email && !/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ error: 'That email address does not look right.' });
  const token = crypto.randomBytes(24).toString('hex');
  const info = db.prepare('INSERT INTO chat_threads (token_hash, name, email, unread) VALUES (?, ?, ?, 1)').run(hash(token), name, email);
  db.prepare("INSERT INTO chat_messages (thread_id, sender, body) VALUES (?, 'visitor', ?)").run(info.lastInsertRowid, body);
  notifyOwner(db.prepare('SELECT * FROM chat_threads WHERE id = ?').get(info.lastInsertRowid), body);
  res.status(201).json({ token });
});

publicChat.get('/thread', pollLimiter, (req, res) => {
  const t = threadFor(req);
  if (!t) return res.status(404).json({ error: 'Chat not found' });
  const after = Number(req.query.after) || 0;
  const messages = db.prepare('SELECT id, sender, body, created_at FROM chat_messages WHERE thread_id = ? AND id > ? ORDER BY id').all(t.id, after);
  res.json({ online: isOnline(), status: t.status, messages });
});

publicChat.post('/send', sendLimiter, (req, res) => {
  const t = threadFor(req);
  if (!t) return res.status(404).json({ error: 'Chat not found' });
  if (t.status !== 'open') return res.status(409).json({ error: 'This chat has ended.' });
  const body = text(req.body?.body, 1000);
  if (!body) return res.status(400).json({ error: 'Write a message first.' });
  db.prepare("INSERT INTO chat_messages (thread_id, sender, body) VALUES (?, 'visitor', ?)").run(t.id, body);
  db.prepare("UPDATE chat_threads SET unread = unread + 1, last_at = datetime('now') WHERE id = ?").run(t.id);
  notifyOwner(t, body);
  res.status(201).json({ ok: true });
});

// ---------------- admin side (mounted under /api/admin/chat, behind login) ----------------
export const adminChat = Router();

const unreadTotal = () => db.prepare("SELECT COALESCE(SUM(unread), 0) AS n FROM chat_threads WHERE status = 'open'").get().n;
const stripHash = ({ token_hash, ...t }) => t;

adminChat.post('/heartbeat', (_req, res) => {
  setSetting('chat_seen', Date.now());
  res.json({ available: getSetting('chat_available') === '1', online: isOnline(), unread: unreadTotal() });
});

adminChat.put('/available', (req, res) => {
  const on = !!req.body?.available;
  setSetting('chat_available', on ? '1' : '0');
  setSetting('chat_seen', Date.now());
  res.json({ available: on, online: isOnline() });
});

adminChat.get('/threads', (_req, res) => {
  const rows = db.prepare(
    `SELECT t.*, (SELECT body FROM chat_messages m WHERE m.thread_id = t.id ORDER BY m.id DESC LIMIT 1) AS last_body
     FROM chat_threads t ORDER BY (t.status = 'open') DESC, t.last_at DESC LIMIT 100`
  ).all();
  res.json(rows.map(stripHash));
});

adminChat.get('/threads/:id', (req, res) => {
  const t = db.prepare('SELECT * FROM chat_threads WHERE id = ?').get(req.params.id);
  if (!t) return res.status(404).json({ error: 'Not found' });
  db.prepare('UPDATE chat_threads SET unread = 0 WHERE id = ?').run(t.id);
  const messages = db.prepare('SELECT id, sender, body, created_at FROM (SELECT * FROM chat_messages WHERE thread_id = ? ORDER BY id DESC LIMIT 200) ORDER BY id').all(t.id);
  res.json({ thread: stripHash(t), messages });
});

adminChat.post('/threads/:id/messages', (req, res) => {
  const t = db.prepare('SELECT * FROM chat_threads WHERE id = ?').get(req.params.id);
  if (!t) return res.status(404).json({ error: 'Not found' });
  const body = text(req.body?.body, 2000);
  if (!body) return res.status(400).json({ error: 'Write a message first.' });
  db.prepare("INSERT INTO chat_messages (thread_id, sender, body) VALUES (?, 'team', ?)").run(t.id, body);
  db.prepare("UPDATE chat_threads SET last_at = datetime('now'), unread = 0 WHERE id = ?").run(t.id);
  res.status(201).json({ ok: true });
});

adminChat.patch('/threads/:id', (req, res) => {
  const status = req.body?.status;
  if (!['open', 'closed'].includes(status)) return res.status(400).json({ error: 'Invalid status' });
  db.prepare('UPDATE chat_threads SET status = ? WHERE id = ?').run(status, req.params.id);
  res.json({ ok: true });
});

adminChat.delete('/threads/:id', (req, res) => {
  db.prepare('DELETE FROM chat_threads WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});
