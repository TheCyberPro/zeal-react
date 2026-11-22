import { Router } from 'express';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import db from '../db.js';
import { signToken, requireAuth } from '../middleware/auth.js';

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts. Try again in 15 minutes.' },
});

// Pre-computed hash so unknown emails take the same time as wrong passwords.
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 12);

router.post('/login', loginLimiter, (req, res) => {
  const email = String(req.body?.email || '').toLowerCase().trim();
  const password = String(req.body?.password || '');
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  const ok = bcrypt.compareSync(password, user ? user.password_hash : DUMMY_HASH);
  if (!user || !ok) return res.status(401).json({ error: 'Email or password is incorrect' });
  res.json({ token: signToken(user), email: user.email });
});

router.get('/me', requireAuth, (req, res) => res.json({ email: req.user.email }));

export default router;
