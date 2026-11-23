// Booking availability: weekly hours in the studio's time zone, turned into bookable UTC instants.
const DEFAULTS = { tz: 'UTC', days: [1, 2, 3, 4, 5], start: 9, end: 17, slot: 30, notice: 12, horizon: 21 };

const validTz = (tz) => { try { new Intl.DateTimeFormat('en-US', { timeZone: tz }); return true; } catch { return false; } };

export function getAvailability(db) {
  const row = db.prepare("SELECT value FROM settings WHERE key = 'availability'").get();
  let saved = {};
  try { saved = row ? JSON.parse(row.value) : {}; } catch { /* use defaults */ }
  const cfg = { ...DEFAULTS, ...saved };
  if (!validTz(cfg.tz)) cfg.tz = 'UTC';
  return cfg;
}

export function saveAvailability(db, input) {
  const int = (v, lo, hi, name) => {
    const n = Number(v);
    if (!Number.isInteger(n) || n < lo || n > hi) throw new Error(`${name} must be a whole number from ${lo} to ${hi}`);
    return n;
  };
  const tz = String(input.tz || '').trim();
  if (!validTz(tz)) throw new Error('Time zone not recognised. Use a name like Europe/Amsterdam or America/New_York.');
  const days = [...new Set((input.days || []).map(Number))].filter((d) => d >= 0 && d <= 6).sort();
  if (!days.length) throw new Error('Choose at least one day');
  const start = int(input.start, 0, 23, 'Start hour');
  const end = int(input.end, 1, 24, 'End hour');
  if (end <= start) throw new Error('End hour must be after the start hour');
  const slot = int(input.slot, 15, 180, 'Slot length');
  const cfg = { tz, days, start, end, slot, notice: int(input.notice, 0, 168, 'Notice'), horizon: int(input.horizon, 1, 60, 'Days ahead') };
  db.prepare("INSERT INTO settings (key, value) VALUES ('availability', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value").run(JSON.stringify(cfg));
  return cfg;
}

function parts(ms, tz) {
  const f = new Intl.DateTimeFormat('en-US', { timeZone: tz, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' });
  const o = {};
  for (const p of f.formatToParts(new Date(ms))) o[p.type] = Number(p.value);
  return o;
}
const offset = (ms, tz) => { const p = parts(ms, tz); return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) - Math.floor(ms / 1000) * 1000; };
function zonedToUtc(y, m, d, hh, mm, tz) {
  const guess = Date.UTC(y, m - 1, d, hh, mm);
  let utc = guess - offset(guess, tz);
  utc = guess - offset(utc, tz); // second pass handles daylight-saving changes
  return utc;
}

export function computeSlots(cfg, now = Date.now()) {
  const out = [];
  const t = parts(now, cfg.tz);
  for (let i = 0; i <= cfg.horizon; i++) {
    const base = new Date(Date.UTC(t.year, t.month - 1, t.day + i));
    if (!cfg.days.includes(base.getUTCDay())) continue;
    for (let mins = cfg.start * 60; mins + cfg.slot <= cfg.end * 60; mins += cfg.slot) {
      const utc = zonedToUtc(base.getUTCFullYear(), base.getUTCMonth() + 1, base.getUTCDate(), Math.floor(mins / 60), mins % 60, cfg.tz);
      if (utc >= now + cfg.notice * 3600000) out.push(new Date(utc).toISOString());
    }
  }
  return [...new Set(out)];
}
