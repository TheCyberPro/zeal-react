import express from 'express';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();
const here = path.dirname(fileURLToPath(import.meta.url));
const DIR = path.resolve(here, '../../data/private');
const FILE = path.join(DIR, 'catalogue.pdf');
const REQUESTS = path.join(DIR, 'catalogue-requests.jsonl');
const DAY = 86400000;
const HOUR = 3600000;

const sign = (payload) =>
  crypto.createHmac('sha256', `${process.env.JWT_SECRET}:catalogue`).update(payload).digest('base64url');

function makeLink(email, days) {
  const payload = Buffer.from(JSON.stringify({ e: email, x: Date.now() + days * DAY })).toString('base64url');
  return `/api/catalogue/download?t=${payload}.${sign(payload)}`;
}

function verify(token) {
  const [payload, sig] = String(token || '').split('.');
  if (!payload || !sig) return null;
  const good = Buffer.from(sign(payload));
  const given = Buffer.from(sig);
  if (good.length !== given.length || !crypto.timingSafeEqual(good, given)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString());
    return data.x > Date.now() ? data : null;
  } catch {
    return null;
  }
}

// ---------- public: someone who really wants it asks for it ----------
const perEmail = new Map();
let allHits = [];

router.post('/request', (req, res) => {
  const b = req.body || {};
  if (b.website) return res.json({ ok: true }); // honeypot field filled in: a bot. Pretend all is well.
  const name = String(b.name || '').trim().slice(0, 120);
  const email = String(b.email || '').trim().toLowerCase().slice(0, 200);
  const note = String(b.note || '').trim().slice(0, 500);
  if (name.length < 2) return res.status(400).json({ error: 'Please tell us your name.' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return res.status(400).json({ error: 'Please enter a valid email address.' });
  if (!fs.existsSync(FILE)) return res.status(503).json({ error: 'The catalogue is being updated. Please try again shortly.' });

  const now = Date.now();
  allHits = allHits.filter((t) => now - t < HOUR);
  const mine = (perEmail.get(email) || []).filter((t) => now - t < HOUR);
  if (allHits.length >= 60 || mine.length >= 5) {
    return res.status(429).json({ error: 'Too many requests right now. Please try again later.' });
  }
  mine.push(now);
  perEmail.set(email, mine);
  allHits.push(now);
  if (perEmail.size > 1000) for (const [k, v] of perEmail) if (!v.some((t) => now - t < HOUR)) perEmail.delete(k);

  fs.mkdirSync(DIR, { recursive: true });
  fs.appendFileSync(REQUESTS, JSON.stringify({ at: new Date().toISOString(), name, email, note }) + '\n');
  res.json({ ok: true, url: makeLink(email, 3) });
});

// ---------- public: the download itself, only with a valid link ----------
router.get('/download', (req, res) => {
  const data = verify(req.query.t);
  if (!data) return res.status(403).send('This link is invalid or has expired. Please request the catalogue again.');
  if (!fs.existsSync(FILE)) return res.status(404).send('The catalogue is not available right now.');
  res.set({ 'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex' });
  res.download(FILE, 'ZEAL-Catalogue.pdf');
});

// ---------- admin only ----------
router.put('/file', requireAuth, express.raw({ type: () => true, limit: '40mb' }), (req, res) => {
  const buf = req.body;
  if (!Buffer.isBuffer(buf) || buf.length < 1000 || buf.subarray(0, 4).toString() !== '%PDF') {
    return res.status(400).json({ error: 'Send a PDF file as the request body' });
  }
  fs.mkdirSync(DIR, { recursive: true });
  fs.writeFileSync(FILE, buf);
  res.json({ ok: true, bytes: buf.length });
});

router.post('/link', requireAuth, (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const days = Math.min(Math.max(parseInt(req.body?.days, 10) || 7, 1), 30);
  if (!email.includes('@')) return res.status(400).json({ error: 'A valid email is required' });
  if (!fs.existsSync(FILE)) return res.status(409).json({ error: 'Upload the catalogue PDF first' });
  res.json({ url: `${req.protocol}://${req.get('host')}${makeLink(email, days)}`, for: email, days });
});

router.get('/requests', requireAuth, (_req, res) => {
  if (!fs.existsSync(REQUESTS)) return res.json([]);
  const rows = fs.readFileSync(REQUESTS, 'utf8').split('\n').filter(Boolean).map((l) => {
    try { return JSON.parse(l); } catch { return null; }
  }).filter(Boolean);
  res.json(rows.slice(-200).reverse());
});

export default router;
