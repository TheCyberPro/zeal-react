import React from "react";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <>
      <style>{`
        .lux-footer {
          --foot-bg: #040508;
          --foot-gold: #d4af37;
          --foot-gold-bright: #f5d76e;
          --foot-glow: rgba(212, 175, 55, 0.35);
          --foot-text: #9ca3af;
          --ease-luxury: cubic-bezier(0.25, 0.46, 0.45, 0.94);
          --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);

          position: relative;
          background: var(--foot-bg);
          padding: 1.25rem 1.5rem 2rem;
          overflow: hidden;
          font-family: system-ui, -apple-system, 'Inter', sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          color: var(--foot-text);
        }

        /* Seamless top merge with ContactCTA */
        .lux-footer::before {
          content: "";
          position: absolute;
          top: -50px; left: 0; right: 0; height: 90px;
          background: linear-gradient(180deg, var(--foot-bg) 0%, transparent 100%);
          pointer-events: none;
          z-index: 1;
        }

        .lux-footer__inner {
          position: relative;
          z-index: 2;
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.25rem;
          padding-top: 0.25rem;
        }

        .lux-footer__brand {
          font-size: 1.35rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          color: #fff;
          text-decoration: none;
          transition: color 0.4s var(--ease-luxury), text-shadow 0.4s var(--ease-luxury);
        }
        .lux-footer__brand span {
          color: var(--foot-gold);
          text-shadow: 0 0 16px var(--foot-glow);
        }
        .lux-footer__brand:hover {
          color: var(--foot-gold);
          text-shadow: 0 0 20px var(--foot-glow);
        }

        .lux-footer__icons {
          display: flex;
          gap: 1.5rem;
          align-items: center;
        }

        .lux-icon-link {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 46px;
          height: 46px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.06);
          text-decoration: none;
          transition: all 0.4s var(--ease-spring);
          position: relative;
          overflow: hidden;
        }
        .lux-icon-link::before {
          content: "";
          position: absolute;
          inset: 0;
          background: radial-gradient(circle, rgba(212, 175, 55, 0.15) 0%, transparent 70%);
          opacity: 0;
          transition: opacity 0.4s ease;
        }
        .lux-icon-link svg {
          width: 20px;
          height: 20px;
          stroke: var(--foot-text);
          fill: none;
          stroke-width: 1.5;
          stroke-linecap: round;
          stroke-linejoin: round;
          transition: stroke 0.3s ease, transform 0.4s var(--ease-luxury), filter 0.3s ease;
        }

        .lux-icon-link:hover {
          background: rgba(212, 175, 55, 0.08);
          border-color: rgba(212, 175, 55, 0.4);
          box-shadow: 0 6px 20px -6px var(--foot-glow);
          transform: translateY(-3px);
        }
        .lux-icon-link:hover::before { opacity: 1; }
        .lux-icon-link:hover svg {
          stroke: var(--foot-gold-bright);
          transform: scale(1.12);
          filter: drop-shadow(0 0 6px var(--foot-glow));
        }

        .lux-footer__divider {
          width: 100%;
          height: 1px;
          background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 20%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 80%, transparent 100%);
          margin: 0.25rem 0;
        }

        .lux-footer__copy {
          font-size: 0.75rem;
          font-weight: 400;
          letter-spacing: 0.06em;
          opacity: 0.45;
          text-align: center;
          transition: opacity 0.3s ease;
        }
        .lux-footer__copy:hover { opacity: 0.7; }

        .noise-overlay {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background-image: url("image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.025'/%3E%3C/svg%3E");
          background-size: 180px;
          mix-blend-mode: overlay;
          z-index: 1;
          opacity: 0.6;
        }

        @media (max-width: 640px) {
          .lux-footer { padding-top: 1rem; }
          .lux-footer__icons { gap: 1.25rem; }
          .lux-icon-link { width: 42px; height: 42px; }
          .lux-icon-link svg { width: 18px; height: 18px; }
          .lux-footer__brand { font-size: 1.2rem; }
        }

        @media (prefers-reduced-motion: reduce) {
          .lux-icon-link, .lux-icon-link svg, .lux-footer__brand {
            transition-duration: 0.01ms !important;
            transform: none !important;
          }
        }
      `}</style>

      <footer className="lux-footer" role="contentinfo" aria-label="Site footer">
        <div className="noise-overlay" aria-hidden="true" />

        <div className="lux-footer__inner">
          <a href="https://www.zealweb.xyz" className="lux-footer__brand" aria-label="ZEAL Home">
            ZEAL<span>.</span>
          </a>

          <div className="lux-footer__icons">
            {/* Instagram SVG */}
            <a 
              href="https://www.instagram.com/zeal_web?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="lux-icon-link" 
              aria-label="Follow ZEAL on Instagram"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <circle cx="12" cy="12" r="5" />
                <circle cx="17.5" cy="6.5" r="1.5" />
              </svg>
            </a>

            {/* TikTok SVG */}
            <a 
              href="https://www.tiktok.com/@zealweb?_r=1&_t=ZS-965S7KHnYZz" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="lux-icon-link" 
              aria-label="Follow ZEAL on TikTok"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
              </svg>
            </a>

            {/* Web/Globe SVG */}
            <a 
              href="https://www.zealweb.xyz" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="lux-icon-link" 
              aria-label="Visit ZEAL Website"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <circle cx="12" cy="12" r="10" />
                <path d="M2 12h20" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
            </a>
          </div>

          <div className="lux-footer__divider" aria-hidden="true" />

          <p className="lux-footer__copy">
            © {year} ZEAL. Crafted with precision.
          </p>
        </div>
      </footer>
    </>
  );
}
