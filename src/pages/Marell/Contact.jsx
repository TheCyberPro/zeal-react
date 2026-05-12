// src/pages/Marell/Contact.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

/**
 * Contact page (drop-in)
 * - Support email: zeal.io@outlook.com
 * - tawk.to chat embedded at runtime using the provided embed script
 * - Saves messages to localStorage under "marell_contacts" (demo)
 *
 * NOTE: This is a demo contact page. Replace localStorage usage with a secure backend in production.
 */

const SUPPORT_EMAIL = "zeal.io@outlook.com";
const DEFAULT_COUNTRY = "+234";

function onlyDigits(s = "") {
  return (s || "").replace(/\D/g, "");
}

function normalizePhone(raw) {
  if (!raw) return "";
  const t = raw.trim();
  if (t.startsWith("+")) return "+" + onlyDigits(t);
  if (t.startsWith("00")) return "+" + onlyDigits(t.slice(2));
  const digits = onlyDigits(t);
  if (!digits) return "";
  if (digits.startsWith("0")) return DEFAULT_COUNTRY + digits.slice(1);
  if (digits.length >= 7 && digits.length <= 15) {
    const def = DEFAULT_COUNTRY.replace("+", "");
    if (digits.startsWith(def)) return "+" + digits;
    return DEFAULT_COUNTRY + digits;
  }
  return DEFAULT_COUNTRY + digits;
}

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneRaw, setPhoneRaw] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [method, setMethod] = useState("inbox"); // inbox | mailto
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setPhone(normalizePhone(phoneRaw));
  }, [phoneRaw]);

  useEffect(() => {
    // Inject the exact tawk.to embed script provided by the user.
    // The script will be added only once and only if not already present.
    if (typeof window === "undefined") return;

    const existing = document.querySelector('script[src*="embed.tawk.to/68bbc67ef58c911925a715fd/1j4enuoig"]');
    if (existing || window.Tawk_API) return;

    try {
      var s1 = document.createElement("script");
      var s0 = document.getElementsByTagName("script")[0];
      s1.async = true;
      s1.src = "https://embed.tawk.to/68bbc67ef58c911925a715fd/1j4enuoig";
      s1.charset = "UTF-8";
      s1.setAttribute("crossorigin", "*");
      if (s0 && s0.parentNode) s0.parentNode.insertBefore(s1, s0);
      else document.head.appendChild(s1);
    } catch (err) {
      // fail silently; widget is optional
      // eslint-disable-next-line no-console
      console.error("Failed to inject tawk.to script", err);
    }
    // keep script loaded across navigation; no cleanup to preserve session
  }, []);

  function isValidEmail(e) {
    if (!e) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());
  }

  function handleSubmit(e) {
    e?.preventDefault();
    setError("");
    setSuccess("");

    if (!name.trim()) return setError("Please enter your name.");
    if (!message.trim()) return setError("Please enter a message.");
    if (email && !isValidEmail(email)) return setError("Please enter a valid email or leave blank.");
    if (phone && !/^\+\d{7,15}$/.test(phone)) return setError("Please enter a valid phone number (we auto-add country code).");

    setBusy(true);

    try {
      const contactsRaw = localStorage.getItem("marell_contacts");
      const contacts = contactsRaw ? JSON.parse(contactsRaw) : [];

      const entry = {
        id: `c-${Date.now()}`,
        name: name.trim(),
        email: email ? email.trim().toLowerCase() : "",
        phone: phone || "",
        subject: subject.trim(),
        message: message.trim(),
        method,
        createdAt: new Date().toISOString(),
      };

      contacts.unshift(entry);
      localStorage.setItem("marell_contacts", JSON.stringify(contacts));

      setSuccess("Message saved. Our support team will get back to you (demo).");
      setName(""); setEmail(""); setPhoneRaw(""); setPhone(""); setSubject(""); setMessage("");
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      setError("Unable to save message. Try again.");
    } finally {
      setBusy(false);
    }
  }

  function copyEmail() {
    navigator.clipboard?.writeText(SUPPORT_EMAIL).then(() => {
      setSuccess("Support email copied to clipboard.");
      setTimeout(() => setSuccess(""), 2500);
    }).catch(() => setError("Unable to copy. Please copy manually: " + SUPPORT_EMAIL));
  }

  const whatsappNumber = phone || DEFAULT_COUNTRY + "8000000000";
  const whatsappLink = `https://wa.me/${onlyDigits(whatsappNumber)}`;
  const telegramLink = `https://t.me/marell_support`;

  return (
    <main
      className="marell-contact-root"
      style={{
        padding: 28,
        minHeight: "100vh",
        boxSizing: "border-box",
        background: "linear-gradient(180deg,#07070a 0%, #0b0b0f 100%)",
        color: "#e8e8ea",
        fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, Arial',
      }}
    >
      <style>{`
        .contact-card { max-width:1100px; margin:0 auto; display:grid; grid-template-columns:1fr 380px; gap:22px; background:linear-gradient(180deg, rgba(255,255,255,0.01), rgba(255,255,255,0.005)); border:1px solid rgba(255,255,255,0.03); padding:22px; border-radius:12px; box-shadow:0 12px 36px rgba(2,6,23,0.55); }
        .contact-hero { padding:18px; }
        .contact-h { font-size:1.4rem; margin:0 0 6px 0; color:#fff; font-weight:800; }
        .contact-sub { color:#bfc3c8; margin-bottom:12px; }
        .contact-form { display:flex; flex-direction:column; gap:10px; }
        .login-input { padding:12px 14px; border-radius:10px; border:1px solid rgba(255,255,255,0.04); background: rgba(255,255,255,0.01); color:#fff; outline:none; }
        .login-input:focus { box-shadow:0 10px 30px rgba(201,168,76,0.12); transform:translateY(-1px); border-color:rgba(201,168,76,0.18); }
        .contact-actions { display:flex; gap:10px; margin-top:8px; flex-wrap:wrap; }
        .btn { padding:10px 12px; border-radius:10px; cursor:pointer; border:none; font-weight:700; }
        .btn-primary { background: linear-gradient(90deg,#c9a84c,#b98f3a); color:#071018; box-shadow:0 10px 30px rgba(201,168,76,0.12); }
        .btn-ghost { background:transparent; border:1px solid rgba(255,255,255,0.04); color:#fff; }
        .panel { background: rgba(255,255,255,0.01); padding:14px; border-radius:10px; border:1px solid rgba(255,255,255,0.02); }
        .muted { color:#bfc3c8; font-size:0.95rem; }
        .contact-side { display:flex; flex-direction:column; gap:12px; }
        .quick-item { display:flex; gap:12px; align-items:center; }
        .quick-icon { width:44px; height:44px; border-radius:10px; background: linear-gradient(135deg,#c9a84c,#b98f3a); display:flex; align-items:center; justify-content:center; color:#071018; font-weight:800; }
        .form-error { color:#ffb4b4; background: rgba(255,180,180,0.04); padding:8px; border-radius:8px; }
        .form-success { color:#dff3d9; background: rgba(34,77,45,0.12); padding:8px; border-radius:8px; }
        @media (max-width:980px) { .contact-card { grid-template-columns:1fr; padding:16px; } }
      `}</style>

      <div className="contact-card" role="region" aria-labelledby="contact-heading">
        <section className="contact-hero">
          <h1 id="contact-heading" className="contact-h">Contact support</h1>
          <p className="contact-sub">We’re here to help. Send a message, or use one of the quick contact options on the right.</p>

          <form className="contact-form" onSubmit={handleSubmit} noValidate>
            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span className="muted">Full name</span>
              <input className="login-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" required />
            </label>

            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span className="muted">Email (optional)</span>
              <input className="login-input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" type="email" />
            </label>

            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span className="muted">Phone (optional)</span>
              <input className="login-input" value={phoneRaw} onChange={(e) => setPhoneRaw(e.target.value)} placeholder="e.g. 08012345678 or +2348012345678" />
              <small className="muted">Normalized: <strong style={{ color: "#fff" }}>{phone || "—"}</strong></small>
            </label>

            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span className="muted">Subject</span>
              <input className="login-input" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Short subject (optional)" />
            </label>

            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span className="muted">Message</span>
              <textarea className="login-input" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="How can we help?" rows={6} style={{ resize: "vertical" }} required />
            </label>

            <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 6 }}>
              <label style={{ display: "flex", gap: 8, alignItems: "center", background: "rgba(255,255,255,0.01)", padding: "8px 10px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.03)" }}>
                <input type="radio" name="method" checked={method === "inbox"} onChange={() => setMethod("inbox")} aria-label="Send to inbox" />
                <span className="muted">Save to inbox (demo)</span>
              </label>

              <label style={{ display: "flex", gap: 8, alignItems: "center", background: "rgba(255,255,255,0.01)", padding: "8px 10px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.03)" }}>
                <input type="radio" name="method" checked={method === "mailto"} onChange={() => setMethod("mailto")} aria-label="Send via email" />
                <span className="muted">Open email client</span>
              </label>
            </div>

            <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
              <button type="submit" className="btn btn-primary" disabled={busy}>
                {busy ? "Sending…" : (method === "mailto" ? "Open email client" : "Send message")}
              </button>

              {method === "mailto" ? (
                <a
                  className="btn btn-ghost"
                  href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject || "Support request")}&body=${encodeURIComponent(`Name: ${name}\nPhone: ${phone}\n\n${message}`)}`}
                >
                  Compose email
                </a>
              ) : (
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => {
                    setName(""); setEmail(""); setPhoneRaw(""); setPhone(""); setSubject(""); setMessage("");
                    setSuccess("Form cleared.");
                    setTimeout(() => setSuccess(""), 2000);
                  }}
                >
                  Clear
                </button>
              )}
            </div>

            {error && <div className="form-error" role="alert" style={{ marginTop: 10 }}>{error}</div>}
            {success && <div className="form-success" role="status" style={{ marginTop: 10 }}>{success}</div>}
          </form>
        </section>

        <aside className="contact-side panel" aria-label="Quick contact">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontWeight: 800, color: "#fff" }}>Quick contact</div>
              <div className="muted" style={{ marginTop: 6 }}>Choose a fast way to reach support</div>
            </div>
            <div style={{ fontSize: 12 }}><Link to="/marell" style={{ color: "#c9a84c", textDecoration: "none" }}>Back</Link></div>
          </div>

          <div className="quick-item">
            <div className="quick-icon">E</div>
            <div>
              <div style={{ fontWeight: 700 }}>Email</div>
              <div className="muted" style={{ fontSize: 13 }}>{SUPPORT_EMAIL}</div>
              <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                <a className="btn btn-ghost" href={`mailto:${SUPPORT_EMAIL}`} aria-label="Email support">Email</a>
                <button className="btn btn-ghost" onClick={copyEmail} aria-label="Copy email">Copy</button>
              </div>
            </div>
          </div>

          <div className="quick-item">
            <div className="quick-icon">W</div>
            <div>
              <div style={{ fontWeight: 700 }}>WhatsApp</div>
              <div className="muted" style={{ fontSize: 13 }}>{onlyDigits(whatsappNumber)}</div>
              <div style={{ marginTop: 8 }}>
                <a className="btn btn-primary" href={whatsappLink} target="_blank" rel="noreferrer" aria-label="Open WhatsApp">Chat</a>
              </div>
            </div>
          </div>

          <div className="quick-item">
            <div className="quick-icon">T</div>
            <div>
              <div style={{ fontWeight: 700 }}>Telegram</div>
              <div className="muted" style={{ fontSize: 13 }}>@marell_support</div>
              <div style={{ marginTop: 8 }}>
                <a className="btn btn-ghost" href={telegramLink} target="_blank" rel="noreferrer" aria-label="Open Telegram">Open</a>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 8 }}>
            <div className="muted" style={{ fontSize: 13 }}>Saved messages (demo)</div>
            <Link to="/marell/support/inbox" className="btn btn-ghost" style={{ marginTop: 8, display: "inline-block" }}>View inbox</Link>
          </div>
        </aside>
      </div>
    </main>
  );
}
