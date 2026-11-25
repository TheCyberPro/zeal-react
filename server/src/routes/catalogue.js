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
const sign = (payload) =>
  crypto.createHmac('sha256', `${process.env.JWT_SECRET}:catalogue`).update(payload).digest('base64url');

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

// Admin only: upload or replace the PDF
router.put('/file', requireAuth, express.raw({ type: () => true, limit: '40mb' }), (req, res) => {
  const buf = req.body;
  if (!Buffer.isBuffer(buf) || buf.length < 1000 || buf.subarray(0, 4).toString() !== '%PDF') {
    return res.status(400).json({ error: 'Send a PDF file as the request body' });
  }
  fs.mkdirSync(DIR, { recursive: true });
  fs.writeFileSync(FILE, buf);
  res.json({ ok: true, bytes: buf.length });
});

// Admin only: make a personal, expiring link for one person
router.post('/link', requireAuth, (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const days = Math.min(Math.max(parseInt(req.body?.days, 10) || 7, 1), 30);
  if (!email.includes('@')) return res.status(400).json({ error: 'A valid email is required' });
  if (!fs.existsSync(FILE)) return res.status(409).json({ error: 'Upload the catalogue PDF first' });
  const payload = Buffer.from(JSON.stringify({ e: email, x: Date.now() + days * 86400000 })).toString('base64url');
  const base = `${req.protocol}://${req.get('host')}`;
  res.json({ url: `${base}/api/catalogue/download?t=${payload}.${sign(payload)}`, for: email, days });
});

// Public: only works with a valid, unexpired link
router.get('/download', (req, res) => {
  const data = verify(req.query.t);
  if (!data) return res.status(403).send('This link is invalid or has expired. Please request a new one.');
  if (!fs.existsSync(FILE)) return res.status(404).send('The catalogue is not available right now.');
  console.log(`catalogue downloaded via link for ${data.e}`);
  res.set({ 'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex' });
  res.download(FILE, 'ZEAL-Catalogue.pdf');
});

export default router;
