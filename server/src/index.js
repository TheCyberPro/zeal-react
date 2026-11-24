import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'change-me') {
  console.error('JWT_SECRET is missing or still "change-me". Set a long random value in server/.env.');
  process.exit(1);
}

// Imported after the env check so db.js and auth.js see the final env.
const { default: authRoutes } = await import('./routes/auth.js');
const { default: publicRoutes } = await import('./routes/public.js');
const { default: adminRoutes } = await import('./routes/admin.js');
const { publicChat } = await import('./chat.js');

const app = express();
app.set('trust proxy', 1);
app.use(helmet());

const origins = (process.env.CLIENT_ORIGIN || '').split(',').map((s) => s.trim()).filter(Boolean);
if (origins.length) app.use('/api', cors({ origin: origins }));

app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', publicRoutes);
app.use('/api/chat', publicChat);
app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found' }));

// If the client has been built, serve it from this same server (single-host deploy).
const here = path.dirname(fileURLToPath(import.meta.url));
const dist = path.resolve(here, '../../client/dist');
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get('*', (_req, res) => res.sendFile(path.join(dist, 'index.html')));
}

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong on the server' });
});

const port = process.env.PORT || 4000;

// Serve the built client from the same server (single-host deploy)
const __path = (await import('node:path')).default;
const __url = await import('node:url');
const __dist = __path.resolve(__path.dirname(__url.fileURLToPath(import.meta.url)), '../../client/dist');
if ((await import('node:fs')).default.existsSync(__dist)) {
  const __express = (await import('express')).default;
  app.use(__express.static(__dist));
  app.get(/^\/(?!api\/).*/, (req, res) => res.sendFile(__path.join(__dist, 'index.html')));
}

app.listen(port, () => console.log(`API listening on :${port}`));
