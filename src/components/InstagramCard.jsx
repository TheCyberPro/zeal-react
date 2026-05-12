// src/components/InstagramCard.jsx
import React from "react";

/**
 * InstagramCard - elevated, luxurious showcase
 * - No visible section title (aria-label used for screen readers)
 * - "Get Catalogue" downloads public/catalogue/zeal-catalogue.pdf
 * - "View Services" scrolls to #work (preserves previous behavior)
 */
export default function InstagramCard() {
  const catalogueUrl = "/catalogue/zeal-catalogue.pdf";

  const viewServices = () => {
    const el = document.getElementById("work");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <style>{`
        .lux-ig {
          --lux-bg-deep: #040509;
          --lux-bg-mid: #0b0d14;
          --lux-surface: rgba(255, 255, 255, 0.03);
          --lux-border: rgba(255, 255, 255, 0.07);
          --lux-border-hover: rgba(255, 255, 255, 0.15);
          --lux-gold: #d4af37;
          --lux-gold-bright: #f5d76e;
          --lux-glow: rgba(212, 175, 55, 0.22);
          --lux-text-primary: #f8f9fa;
          --lux-text-secondary: #9ca3af;
          --lux-ease: cubic-bezier(0.25, 0.46, 0.45, 0.94);
          --lux-trans: 0.5s var(--lux-ease);
          
          position: relative;
          padding: clamp(5rem, 8vw, 8rem) 1.5rem;
          background: radial-gradient(ellipse 140% 90% at 30% 50%, var(--lux-bg-mid) 0%, var(--lux-bg-deep) 65%);
          overflow: hidden;
          isolation: isolate;
          font-family: system-ui, -apple-system, 'Inter', 'Segoe UI', Roboto, sans-serif;
          -webkit-font-smoothing: antialiased;
        }

        .lux-ig::before {
          content: "";
          position: absolute;
          inset: 0;
          background-image: url("image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
          background-size: 180px;
          pointer-events: none;
          z-index: 0;
          mix-blend-mode: overlay;
        }

        .lux-ambient {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 1;
          overflow: hidden;
        }
        .lux-ambient span {
          position: absolute;
          border-radius: 50%;
          filter: blur(70px);
          animation: drift-slow 18s ease-in-out infinite alternate;
        }
        .lux-ambient span:nth-child(1) {
          top: -25%; left: 20%; width: 50vw; height: 50vw;
          background: radial-gradient(circle, var(--lux-glow) 0%, transparent 60%);
        }
        .lux-ambient span:nth-child(2) {
          bottom: -30%; right: 15%; width: 55vw; height: 55vw;
          background: radial-gradient(circle, rgba(99, 102, 241, 0.07) 0%, transparent 60%);
          animation-delay: -9s;
          animation-direction: reverse;
        }
        @keyframes drift-slow {
          0% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(30px, -20px) scale(1.04); }
          100% { transform: translate(-20px, 25px) scale(0.98); }
        }

        .lux-container {
          position: relative;
          z-index: 2;
          max-width: 1120px;
          margin: 0 auto;
          display: flex;
          justify-content: center;
          animation: fadeSlideUp 0.9s var(--lux-ease) both;
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .lux-card {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2rem;
          background: var(--lux-surface);
          border: 1px solid var(--lux-border);
          backdrop-filter: blur(32px);
          -webkit-backdrop-filter: blur(32px);
          border-radius: 1.5rem;
          padding: 1.5rem;
          box-shadow: 0 24px 60px -16px rgba(0, 0, 0, 0.75), inset 0 1px 0 rgba(255, 255, 255, 0.08);
          transition: transform var(--lux-trans), box-shadow var(--lux-trans), border-color var(--lux-trans);
          will-change: transform;
        }
        .lux-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 32px 72px -12px rgba(0, 0, 0, 0.85), 0 0 40px -8px var(--lux-glow);
          border-color: var(--lux-border-hover);
        }

        .lux-media {
          position: relative;
          overflow: hidden;
          border-radius: 1rem;
          aspect-ratio: 16 / 10;
        }

        .lux-img {
          width: 100%; height: 100%;
          object-fit: cover;
          transition: transform 0.6s var(--lux-ease);
        }
        .lux-card:hover .lux-img { transform: scale(1.025); }

        .lux-badge {
          position: absolute;
          bottom: 0.85rem; left: 0.85rem;
          padding: 0.4rem 0.9rem;
          background: rgba(5, 6, 10, 0.75);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 999px;
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #f8f9fa;
          pointer-events: none;
        }

        .lux-body {
          display: flex;
          flex-direction: column;
          gap: 1.75rem;
          justify-content: center;
          padding: 0.5rem 0.5rem;
        }

        .lux-lead {
          margin: 0;
          font-size: clamp(1.05rem, 2vw, 1.2rem);
          line-height: 1.7;
          font-weight: 300;
          color: var(--lux-text-secondary);
        }

        .lux-ctas {
          display: flex;
          gap: 0.8rem;
          flex-wrap: wrap;
        }

        .lux-btn {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.95rem 1.8rem;
          font-size: 0.82rem;
          font-weight: 600;
          border-radius: 12px;
          text-decoration: none;
          cursor: pointer;
          border: none;
          transition: all 0.4s var(--lux-ease);
          letter-spacing: 0.06em;
          overflow: hidden;
        }
        .lux-btn:active { transform: scale(0.98) !important; }

        .lux-btn.primary {
          background: linear-gradient(145deg, var(--lux-gold), #b8941f);
          color: #05060a;
          box-shadow: 0 6px 20px -4px var(--lux-glow), inset 0 1px 0 rgba(255,255,255,0.35);
        }
        .lux-btn.primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px -6px var(--lux-glow), inset 0 1px 0 rgba(255,255,255,0.45);
        }
        .lux-btn.primary::before {
          content: "";
          position: absolute;
          top: 0; left: -100%; width: 60%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
          transform: skewX(-20deg);
          transition: left 0.7s var(--lux-ease);
        }
        .lux-btn.primary:hover::before { left: 110%; }

        .lux-btn.outline {
          background: rgba(255, 255, 255, 0.04);
          color: var(--lux-text-primary);
          border: 1px solid var(--lux-border);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
        }
        .lux-btn.outline:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: var(--lux-border-hover);
          transform: translateY(-2px);
          box-shadow: 0 10px 28px rgba(0,0,0,0.35);
        }

        .lux-btn.ghost {
          background: transparent;
          color: var(--lux-gold-bright);
          padding: 0.95rem 0.6rem;
          text-decoration: underline;
          text-underline-offset: 4px;
          text-decoration-color: rgba(245, 215, 110, 0.3);
        }
        .lux-btn.ghost:hover { color: #fff; text-decoration-color: #fff; transform: translateY(-1px); }

        @media (min-width: 840px) {
          .lux-card { grid-template-columns: 42% 1fr; gap: 0; padding: 1rem; }
          .lux-media { margin: 1rem; border-radius: 1.25rem; }
          .lux-body { padding: 1.5rem 2rem 1.5rem 0.5rem; }
          .lux-lead { max-width: 460px; }
        }

        @media (max-width: 600px) {
          .lux-ig { padding: 4rem 1rem; }
          .lux-card { padding: 1rem; border-radius: 1.25rem; }
          .lux-btn { width: 100%; justify-content: center; }
          .lux-ctas { gap: 0.6rem; }
        }

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; transform: none !important; }
        }
      `}</style>

      <section id="instagram" className="lux-ig" aria-label="Instagram showcase">
        <div className="lux-ambient" aria-hidden="true">
          <span></span>
          <span></span>
        </div>
        
        <div className="lux-container">
          <article className="lux-card" tabIndex={0} aria-labelledby="ig-card-title">
            <figure className="lux-media" aria-hidden="true">
              <img
                src="/assets/zeal2.png"
                srcSet="/assets/zeal2-800.png 800w, /assets/zeal2.png 1600w"
                sizes="(max-width:900px) 100vw, 420px"
                alt="Instagram highlight"
                className="lux-img"
                loading="lazy"
              />
              <span className="lux-badge">Reels · Campaigns</span>
            </figure>

            <div className="lux-body">
              <div className="lux-meta">


                <p className="lux-lead">Reels, creative campaigns, and creator partnerships that scale engagement and drive measurable growth.</p>
              </div>

              <div className="lux-ctas">
                <a className="lux-btn primary" href="https://www.instagram.com/zeal_web/" target="_blank" rel="noopener noreferrer">Visit Instagram</a>
                <a className="lux-btn outline" href={catalogueUrl} download="zeal-catalogue.pdf">Get Catalogue</a>


              </div>
            </div>
          </article>
        </div>
      </section>
    </>
  );
}
