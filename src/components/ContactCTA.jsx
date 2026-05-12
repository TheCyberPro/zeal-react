import React, { useEffect, useState, useRef } from "react";

/**
 * ContactCTA (luxury, refined + HD SVG Visual)
 *
 * - Preserves original props and behavior.
 * - Replaces the plain box with a high-pixel, intricate SVG dashboard graphic.
 * - Improves layout, accessibility, focus states, reduced-motion handling, and visual polish.
 * - All visible text is unchanged.
 */

export default function ContactCTA({
  user = {},
  webhook = "https://hook.us2.make.com/bi6g60kje4lbqd4a25929gike5ug2rzu",
  tawkUrl = "https://tawk.to/chat/68bbc67ef58c911925a715fd/1j4enuoig",
  onBookDemo,
  onTalkAdmin
}) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [animKey, setAnimKey] = useState(0);
  const adminEmail = "zeal.io@outlook.com";
  const mounted = useRef(true);
  const rootRef = useRef(null);

  useEffect(() => {
    return () => { mounted.current = false; };
  }, []);

  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  async function notifyMake(payload) {
    try {
      await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        keepalive: true
      });
    } catch (err) {
      console.warn("Make webhook error", err);
    }
  }

  function ensureTawkLoadedAndOpen(visitor = {}) {
    try {
      if (!window.Tawk_API) {
        const s = document.createElement("script");
        s.async = true;
        s.src = tawkUrl;
        s.charset = "UTF-8";
        s.setAttribute("crossorigin", "*");
        document.head.appendChild(s);
        s.onload = () => {
          try {
            if (window.Tawk_API && typeof window.Tawk_API.setAttributes === "function") {
              window.Tawk_API.setAttributes(visitor, () => {});
            }
            if (window.Tawk_API && typeof window.Tawk_API.popup === "function") {
              window.Tawk_API.popup();
            }
          } catch (e) {}
        };
        return;
      }

      if (window.Tawk_API && typeof window.Tawk_API.setAttributes === "function") {
        window.Tawk_API.setAttributes(visitor, () => {});
      }
      if (window.Tawk_API && typeof window.Tawk_API.popup === "function") {
        window.Tawk_API.popup();
      } else if (window.Tawk_API && typeof window.Tawk_API.toggle === "function") {
        window.Tawk_API.toggle();
      }
    } catch (e) {
      console.warn("Tawk open error", e);
    }
  }

  function openEmail(subject = "Request from site", body = "") {
    const href = `mailto:${encodeURIComponent(adminEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = href;
  }

  async function handleAction(action, details = {}) {
    setLoading(true);
    setStatus(null);
    setAnimKey(k => k + 1);

    const payload = {
      action,
      userId: user.id || user.phone || "anonymous",
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      details,
      createdAt: new Date().toISOString(),
      source: "ContactCTA"
    };

    notifyMake(payload);

    ensureTawkLoadedAndOpen({
      name: payload.name || payload.userId,
      email: payload.email,
      phone: payload.phone,
      lastAction: action,
      lastDetails: JSON.stringify(details).slice(0, 200)
    });

    try {
      await new Promise(res => setTimeout(res, 700));
      if (!mounted.current) return;
      setStatus("success");
      try { window.dataLayer = window.dataLayer || []; window.dataLayer.push({ event: "contactcta", action }); } catch (e) {}
    } catch (e) {
      if (!mounted.current) return;
      setStatus("error");
    } finally {
      if (mounted.current) setLoading(false);
      setTimeout(() => { if (mounted.current) setStatus(null); }, 2800);
    }
  }

  const handleBookDemo = (e) => {
    if (e) e.preventDefault();
    if (typeof onBookDemo === "function") return onBookDemo();
    return handleAction("book_demo", { page: window.location.pathname });
  };

  const handleTalkAdmin = (e) => {
    if (e) e.preventDefault();
    if (typeof onTalkAdmin === "function") return onTalkAdmin();
    return handleAction("talk_admin", { page: window.location.pathname });
  };

  const handleEmail = (e) => {
    if (e) e.preventDefault();
    const subject = "Request from site";
    const body = `User: ${user.name || user.phone || "anonymous"}\nAction: contact\nPage: ${window.location.pathname}\n\nPlease respond.`;
    openEmail(subject, body);
  };

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    if (prefersReducedMotion) {
      el.dataset.visible = "true";
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          el.dataset.visible = "true";
          io.disconnect();
        }
      });
    }, { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, [prefersReducedMotion]);

  return (
    <>
      <style>{`
        :root {
          --cta-bg: #040508;
          --cta-surface: rgba(255, 255, 255, 0.035);
          --cta-border: rgba(255, 255, 255, 0.08);
          --cta-highlight: rgba(255, 255, 255, 0.15);
          --cta-gold: #d4af37;
          --cta-gold-bright: #f5d76e;
          --cta-glow: rgba(212, 175, 55, 0.25);
          --cta-text-primary: #f8f9fa;
          --cta-text-secondary: #9ca3af;
          --cta-ease: cubic-bezier(0.25, 0.46, 0.45, 0.94);
          --cta-trans: 0.6s var(--cta-ease);
        }

        .contact-cta-lux {
          position: relative;
          padding: clamp(4rem, 8vw, 6rem) 1.5rem 0;
          background: radial-gradient(ellipse 140% 80% at 60% 20%, #0c0e14 0%, var(--cta-bg) 65%);
          overflow: visible;
          isolation: isolate;
          font-family: system-ui, -apple-system, 'Inter', 'Segoe UI', Roboto, sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        .contact-cta-lux::before {
          content: "";
          position: absolute;
          inset: 0;
          background-image: url("image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
          background-size: 180px;
          pointer-events: none;
          z-index: 0;
          mix-blend-mode: overlay;
        }

        .cta-ambient {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 1;
          overflow: hidden;
        }
        .cta-ambient span {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          animation: aura-drift 22s ease-in-out infinite alternate;
        }
        .cta-ambient span:nth-child(1) {
          top: -25%; right: -10%; width: 55vw; height: 55vw;
          background: radial-gradient(circle, var(--cta-glow) 0%, transparent 60%);
        }
        .cta-ambient span:nth-child(2) {
          bottom: -35%; left: -15%; width: 60vw; height: 60vw;
          background: radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, transparent 60%);
          animation-delay: -11s;
          animation-direction: reverse;
        }
        @keyframes aura-drift {
          0% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(25px, -20px) scale(1.04); }
          100% { transform: translate(-15px, 25px) scale(0.98); }
        }

        .cta-inner {
          position: relative;
          z-index: 2;
          max-width: 1140px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: clamp(2.5rem, 5vw, 4.5rem);
          align-items: center;
          transition: opacity var(--cta-trans), transform var(--cta-trans);
          transform: translateY(24px);
          opacity: 0;
          padding-bottom: 4rem;
        }

        .contact-cta-lux[data-visible="true"] .cta-inner {
          transform: translateY(0);
          opacity: 1;
        }

        .cta-copy { z-index: 2; }

        .cta-eyebrow {
          margin: 0 0 0.75rem 0;
          color: var(--cta-gold);
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          font-size: 0.75rem;
          opacity: 0.95;
        }

        .cta-title {
          margin: 0 0 1rem 0;
          font-size: clamp(2rem, 4.5vw, 3.2rem);
          font-weight: 300;
          color: var(--cta-text-primary);
          line-height: 1.1;
          letter-spacing: -0.03em;
          background: linear-gradient(135deg, #ffffff 0%, #a0a0a0 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .cta-desc {
          margin: 0 0 2rem 0;
          color: var(--cta-text-secondary);
          line-height: 1.75;
          font-size: clamp(1rem, 2vw, 1.15rem);
          font-weight: 300;
          max-width: 58ch;
        }

        .cta-actions {
          display: flex;
          gap: 0.85rem;
          flex-wrap: wrap;
          align-items: center;
          margin-bottom: 1rem;
        }

        .cta-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.6rem;
          padding: 0.95rem 1.6rem;
          border-radius: 12px;
          font-weight: 600;
          font-size: 0.88rem;
          cursor: pointer;
          border: 1px solid transparent;
          text-decoration: none;
          transition: all 0.35s var(--cta-ease);
          letter-spacing: 0.04em;
          overflow: hidden;
          position: relative;
        }
        .cta-btn:disabled { opacity: 0.6; cursor: wait; transform: none !important; box-shadow: none !important; }
        .cta-btn:active:not(:disabled) { transform: scale(0.98) !important; }

        .cta-btn-primary {
          background: linear-gradient(145deg, var(--cta-gold), #b8941f);
          color: #05060a;
          box-shadow: 0 10px 28px -6px var(--cta-glow), inset 0 1px 0 rgba(255,255,255,0.35);
        }
        .cta-btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 16px 38px -8px var(--cta-glow), inset 0 1px 0 rgba(255,255,255,0.45);
        }
        .cta-btn-primary::before {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
          transform: translateX(-100%);
          transition: transform 0.7s var(--cta-ease);
        }
        .cta-btn-primary:hover:not(:disabled)::before { transform: translateX(100%); }

        .cta-btn-ghost {
          background: rgba(255, 255, 255, 0.04);
          color: var(--cta-text-primary);
          border: 1px solid var(--cta-border);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }
        .cta-btn-ghost:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.08);
          border-color: var(--cta-highlight);
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.3);
        }

        .cta-btn-outline {
          background: transparent;
          color: var(--cta-text-secondary);
          border: none;
          text-decoration: underline;
          text-decoration-color: rgba(156, 163, 175, 0.35);
          text-underline-offset: 4px;
          padding: 0.95rem 0.6rem;
        }
        .cta-btn-outline:hover:not(:disabled) {
          color: var(--cta-text-primary);
          text-decoration-color: var(--cta-gold-bright);
          transform: translateY(-1px);
        }

        .cta-btn:focus-visible {
          outline: 2px solid var(--cta-gold-bright);
          outline-offset: 4px;
        }

        .spinner {
          width: 15px;
          height: 15px;
          border-radius: 50%;
          border: 2px solid rgba(5, 6, 10, 0.15);
          border-top-color: rgba(5, 6, 10, 0.9);
          animation: spin 0.8s linear infinite;
          flex-shrink: 0;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .cta-status {
          margin-top: 1rem;
          min-height: 1.4rem;
          font-size: 0.95rem;
          font-weight: 500;
          transition: opacity 0.3s ease;
        }
        .cta-status.success { color: #4ade80; }
        .cta-status.error { color: #f87171; }

        .cta-visual {
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1;
          perspective: 1200px;
        }

        .device-mock {
          width: 100%;
          max-width: 420px;
          aspect-ratio: 4 / 3;
          border-radius: 24px;
          background: linear-gradient(165deg, var(--cta-surface), #06070b);
          border: 1px solid var(--cta-border);
          box-shadow:
            0 32px 70px -12px rgba(0, 0, 0, 0.85),
            inset 0 1px 0 var(--cta-highlight);
          position: relative;
          overflow: hidden;
          transform: perspective(800px) rotateY(-4deg) rotateX(3deg);
          transition: transform 0.6s var(--cta-ease);
          animation: float-mock 12s ease-in-out infinite alternate;
        }

        .device-mock svg {
          width: 100%;
          height: 100%;
          display: block;
          filter: drop-shadow(0 10px 20px rgba(0,0,0,0.4));
        }

        .device-mock::before {
          content: "";
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 80% 10%, rgba(255, 255, 255, 0.1), transparent 50%);
          mix-blend-mode: overlay;
          pointer-events: none;
        }

        .cta-visual:hover .device-mock {
          transform: perspective(800px) rotateY(-1deg) rotateX(1deg);
        }
        @keyframes float-mock {
          0% { transform: perspective(800px) rotateY(-4deg) rotateX(3deg); }
          100% { transform: perspective(800px) rotateY(-1deg) rotateX(1deg) translateY(-10px); }
        }

        .cta-divider-wrapper {
          position: relative;
          z-index: 2;
          max-width: 1140px;
          margin: 0 auto;
          padding-bottom: clamp(2rem, 5vw, 3.5rem);
        }

        .cta-divider-line {
          position: relative;
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.05) 8%,
            rgba(212, 175, 55, 0.25) 25%,
            rgba(245, 215, 110, 0.6) 50%,
            rgba(212, 175, 55, 0.25) 75%,
            rgba(255, 255, 255, 0.05) 92%,
            transparent 100%
          );
          width: 100%;
        }

        .cta-divider-line::before {
          content: '';
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: radial-gradient(circle, #f5d76e 0%, rgba(212, 175, 55, 0.4) 60%, transparent 100%);
          box-shadow: 0 0 16px rgba(212, 175, 55, 0.5);
        }

        .cta-footer-bridge {
          position: relative;
          z-index: 2;
          max-width: 1140px;
          margin: 0 auto;
          padding: 0 1rem;
        }

        .footer-bridge-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
          padding-bottom: 1.5rem;
        }

        .footer-bridge-text {
          color: rgba(156, 163, 175, 0.4);
          font-size: 0.75rem;
          letter-spacing: 0.05em;
        }

        .footer-bridge-links {
          display: flex;
          gap: 1.5rem;
        }

        .footer-bridge-link {
          color: rgba(255, 255, 255, 0.25);
          text-decoration: none;
          font-size: 0.75rem;
          letter-spacing: 0.04em;
          transition: color 0.3s ease;
        }

        .footer-bridge-link:hover {
          color: var(--cta-gold);
        }

        @media (max-width: 920px) {
          .cta-inner { grid-template-columns: 1fr; text-align: center; gap: 3rem; }
          .cta-actions { justify-content: center; }
          .cta-desc { margin-left: auto; margin-right: auto; }
          .cta-visual { order: -1; }
          .device-mock { max-width: 360px; }
        }
        @media (max-width: 480px) {
          .contact-cta-lux { padding-top: 3.5rem; }
          .cta-actions { flex-direction: column; width: 100%; }
          .cta-btn { width: 100%; }
          .footer-bridge-content { flex-direction: column; gap: 0.75rem; }
        }

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
            transform: none !important;
          }
          .contact-cta-lux[data-visible="true"] .cta-inner { opacity: 1 !important; }
        }
      `}</style>

      <section
        ref={rootRef}
        className="contact-cta-lux"
        role="region"
        aria-label="Contact call to action"
        data-visible="false"
      >
        <div className="cta-ambient" aria-hidden="true">
          <span></span>
          <span></span>
        </div>

        <div className="cta-inner">
          <div className="cta-copy">
            <p className="cta-eyebrow">Premium product design & engineering</p>
            <h3 className="cta-title">Build your next digital platform</h3>
            <p className="cta-desc">Book a demo and let us turn your website or app into your hardest‑working salesperson.</p>

            <div className="cta-actions" role="group" aria-label="Contact actions">
              <button
                className="cta-btn cta-btn-primary"
                onClick={handleBookDemo}
                disabled={loading}
                aria-busy={loading}
                aria-label="Book a demo"
              >
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                  {loading ? (
                    <span className="spinner" aria-hidden="true" />
                  ) : (
                    <svg className="icon-calendar" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false">
                      <path fill="currentColor" d="M7 10h5v5H7z" />
                      <path fill="currentColor" d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z" />
                    </svg>
                  )}
                  <span>{loading ? "Connecting…" : "Book a Demo"}</span>
                </span>
              </button>

              <button
                className="cta-btn cta-btn-ghost"
                onClick={handleTalkAdmin}
                disabled={loading}
                aria-label="Talk to admin"
              >
                {loading ? "Opening chat…" : "Talk to admin"}
              </button>

              <button
                className="cta-btn cta-btn-outline"
                onClick={handleEmail}
                aria-label="Email admin"
              >
                Email
              </button>
            </div>

            <div
              className={`cta-status ${status || ""}`}
              key={animKey}
              role="status"
              aria-live="polite"
              aria-atomic="true"
              style={{ opacity: status ? 1 : 0 }}
            >
              {status === "success" && <span className="status-success">✓ Request sent — admin notified</span>}
              {status === "error" && <span className="status-error">⚠ Unable to contact admin. Try email.</span>}
            </div>
          </div>

          <div className="cta-visual" aria-hidden="true">
            <div className="device-mock">
              <svg viewBox="0 0 520 390" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f5d76e" />
                    <stop offset="100%" stopColor="#c9a84c" />
                  </linearGradient>
                  <linearGradient id="glass-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.08" />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity="0.01" />
                  </linearGradient>
                  <linearGradient id="chart-area" x1="0" y1="140" x2="0" y2="310" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#c9a84c" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#c9a84c" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="sidebar-grad" x1="0" y1="0" x2="100" y2="400" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="rgba(255,255,255,0.04)" />
                    <stop offset="100%" stopColor="rgba(255,255,255,0.01)" />
                  </linearGradient>
                  <filter id="drop-glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="8" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                  <filter id="card-shadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#000" floodOpacity="0.5" />
                  </filter>
                  <pattern id="micro-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M40 0 L0 0 0 40" fill="none" stroke="rgba(255,255,255,0.025)" stroke-width="0.5" />
                  </pattern>
                </defs>

                <rect x="24" y="24" width="472" height="342" rx="20" stroke="rgba(255,255,255,0.1)" stroke-width="1" fill="url(#glass-grad)" />

                <rect x="24" y="24" width="472" height="342" rx="20" fill="url(#micro-grid)" />

                <rect x="40" y="48" width="80" height="32" rx="8" fill="url(#sidebar-grad)" stroke="rgba(255,255,255,0.06)" />
                <circle cx="58" cy="64" r="4" fill="#c9a84c" />
                <text x="68" y="67" fill="#e4e4e7" font-family="system-ui, sans-serif" font-size="11" font-weight="600" letter-spacing="1">ZEAL</text>

                <rect x="130" y="52" width="340" height="28" rx="6" fill="#06070b" stroke="rgba(255,255,255,0.04)" />
                <rect x="145" y="60" width="180" height="5" rx="2.5" fill="#27272a" />

                <circle cx="450" cy="64" r="3" fill="#f87171" />
                <circle cx="434" cy="64" r="3" fill="#fbbf24" />
                <circle cx="418" cy="64" r="3" fill="#4ade80" />

                <rect x="40" y="100" width="120" height="160" rx="12" fill="#0a0b10" stroke="rgba(255,255,255,0.06)" stroke-width="1" />
                <text x="55" y="125" fill="#a0a0a8" font-family="system-ui, sans-serif" font-size="9" font-weight="600" letter-spacing="0.05em">ACTIVITY</text>
                <rect x="55" y="140" width="90" height="6" rx="3" fill="#27272a" />
                <rect x="55" y="152" width="75" height="6" rx="3" fill="#3f3f46" />
                <rect x="55" y="164" width="82" height="6" rx="3" fill="#27272a" />
                <rect x="55" y="176" width="65" height="6" rx="3" fill="#1f2937" />
                <rect x="55" y="200" width="90" height="30" rx="6" fill="rgba(212, 175, 55, 0.12)" stroke="rgba(212, 175, 55, 0.2)" />
                <text x="65" y="218" fill="#d4af37" font-family="system-ui, sans-serif" font-size="8" font-weight="600">+142% GROWTH</text>

                <rect x="180" y="100" width="270" height="120" rx="14" fill="#0a0b10" stroke="rgba(255,255,255,0.06)" stroke-width="1" />
                <path d="M 200 190 C 230 190, 250 160, 280 165 C 310 170, 330 140, 360 150 C 390 160, 410 120, 440 110"
                      stroke="url(#gold-grad)" stroke-width="2.5" fill="none" filter="url(#drop-glow)" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M 200 190 C 230 190, 250 160, 280 165 C 310 170, 330 140, 360 150 C 390 160, 410 120, 440 110 L 440 210 L 200 210 Z"
                      fill="url(#chart-area)" />
                <circle cx="280" cy="165" r="5" fill="#0b0d14" stroke="#f5d76e" stroke-width="2" />
                <circle cx="360" cy="150" r="5" fill="#0b0d14" stroke="#f5d76e" stroke-width="2" />
                <circle cx="440" cy="110" r="5" fill="#d4af37" stroke="#fff" stroke-width="1.5" />
                <path d="M 200 190 L 440 110" stroke="rgba(212, 175, 55, 0.15)" stroke-width="1" stroke-dasharray="4 4" />

                <rect x="180" y="240" width="130" height="90" rx="12" fill="#0a0b10" stroke="rgba(255,255,255,0.06)" stroke-width="1" />
                <text x="195" y="260" fill="#9ca3af" font-family="system-ui, sans-serif" font-size="9" font-weight="600" letter-spacing="0.04em">USERS</text>
                <text x="195" y="285" fill="#fff" font-family="system-ui, sans-serif" font-size="20" font-weight="700">24.5K</text>
                <rect x="195" y="298" width="100" height="4" rx="2" fill="#1f2937" />
                <rect x="195" y="298" width="70" height="4" rx="2" fill="url(#gold-grad)" />

                <rect x="330" y="240" width="120" height="90" rx="12" fill="#0a0b10" stroke="rgba(255,255,255,0.06)" stroke-width="1" />
                <text x="345" y="260" fill="#4ade80" font-family="system-ui, sans-serif" font-size="9" font-weight="600" letter-spacing="0.04em">CONVERSION</text>
                <text x="345" y="285" fill="#fff" font-family="system-ui, sans-serif" font-size="18" font-weight="700">8.4%</text>
                <path d="M 400 260 L 410 270 L 420 250" stroke="#4ade80" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </div>
          </div>
        </div>

        <div className="cta-divider-wrapper">
          <div className="cta-divider-line" />
        </div>

        <div className="cta-footer-bridge">
          <div className="footer-bridge-content">

            <nav className="footer-bridge-links" aria-label="Footer quick links">

            </nav>
          </div>
        </div>
      </section>
    </>
  );
}
