# Zeal

React + Vite frontend (`client/`) and Express + SQLite API with an admin panel (`server/`).

## Run locally
```bash
npm install                          # root (installs concurrently)
npm run install:all                  # server + client deps
cp server/.env.example server/.env   # then set JWT_SECRET and ADMIN_* values
npm run dev                          # API on :4000, site on http://localhost:5173
```
Admin: http://localhost:5173/admin. The account is created from `ADMIN_EMAIL` / `ADMIN_PASSWORD` on first start.

## Deploy option A: one host (simplest)
Render, Railway, or Fly.io with a persistent disk.
- Build command: `npm install && npm run build`
- Start command: `npm start`
- Env: `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `DB_PATH=/data/zeal.db` (mount the disk at `/data`)

Express serves the built client and the API from the same origin, so no CORS setup is needed.

## Deploy option B: client on Vercel, API elsewhere
1. Deploy the API as in option A.
2. On Vercel set **Root Directory** to `client` and add `VITE_API_URL=https://your-api-host`.
3. On the API host set `CLIENT_ORIGIN=https://www.zealweb.xyz`.

## Notes
- The SQLite file lives at `DB_PATH` (default `server/data/zeal.db`). Back it up.
- Do not run the API on Vercel serverless: the filesystem is ephemeral and the database would be lost.
