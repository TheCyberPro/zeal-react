// Sends a plain-text notification to the studio owner.
// Option A (recommended): Resend, via RESEND_API_KEY. Option B: any SMTP login, via SMTP_HOST/PORT/USER/PASS.
// Failures are logged and never break the visitor's request.
export const clean = (s) => String(s).replace(/[\r\n]+/g, ' ').slice(0, 150);

export async function sendMail({ subject, text, replyTo }) {
  const to = process.env.NOTIFY_TO || process.env.ADMIN_EMAIL;
  if (!to) return false;
  try {
    if (process.env.RESEND_API_KEY) {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        signal: AbortSignal.timeout(8000),
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: process.env.MAIL_FROM || 'ZEAL <onboarding@resend.dev>',
          to: [to], subject: clean(subject), text, reply_to: replyTo,
        }),
      });
      if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
      return true;
    }
    if (process.env.SMTP_HOST) {
      const { default: nodemailer } = await import('nodemailer');
      const transport = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_SECURE === 'true',
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      });
      await transport.sendMail({ from: process.env.MAIL_FROM || process.env.SMTP_USER, to, subject: clean(subject), text, replyTo });
      return true;
    }
    console.warn('Email is not configured (set RESEND_API_KEY or SMTP_HOST); skipping notification.');
  } catch (e) {
    console.error('Email failed:', e.message);
  }
  return false;
}
