// src/components/MarellSection.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function MarellSection() {
  return (
    <>
      <style>{`
        .marell-section {
          --bg-deep: #06070b;
          --bg-mid: #0d0f15;
          --accent-gold: #c9a227;
          --accent-gold-bright: #e8cf52;
          --accent-glow: rgba(201, 162, 39, 0.18);
          --text-primary: #f8f9fa;
          --text-muted: #9ca3af;
          --glass-surface: rgba(255, 255, 255, 0.04);
          --glass-border: rgba(255, 255, 255, 0.08);
          --shadow-elevated: 0 12px 40px rgba(0, 0, 0, 0.5);
          --radius-pill: 999px;
          --radius-card: 14px;
          --ease-premium: cubic-bezier(0.25, 0.46, 0.45, 0.94);
          
          position: relative;
          padding: 8rem 1.5rem;
          background: radial-gradient(120% 100% at 50% 0%, var(--bg-mid) 0%, var(--bg-deep) 70%);
          overflow: hidden;
          isolation: isolate;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        .marell-section::before,
        .marell-section::after {
          content: "";
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          opacity: 0.5;
          pointer-events: none;
          animation: floatLuxury 24s ease-in-out infinite alternate;
        }

        .marell-section::before {
          top: -15%; left: 15%;
          width: 600px; height: 600px;
          background: radial-gradient(circle, var(--accent-glow) 0%, transparent 65%);
        }

        .marell-section::after {
          bottom: -20%; right: 10%;
          width: 700px; height: 700px;
          background: radial-gradient(circle, rgba(56, 189, 248, 0.06) 0%, transparent 65%);
          animation-delay: -12s;
        }

        .marell-section .container {
          position: relative;
          z-index: 1;
          max-width: 860px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2.25rem;
          animation: revealUp 1s var(--ease-premium) forwards;
          opacity: 0;
          transform: translateY(28px);
        }

        @keyframes revealUp {
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes floatLuxury {
          0% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(25px, -35px) scale(1.04); }
          100% { transform: translate(-15px, 20px) scale(0.96); }
        }

        .marell-reviews {
          display: inline-flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.6rem 1.25rem;
          background: var(--glass-surface);
          border: 1px solid var(--glass-border);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-radius: var(--radius-pill);
          box-shadow: 0 4px 24px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.06);
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--text-muted);
          letter-spacing: 0.02em;
          animation: scaleIn 0.7s 0.15s var(--ease-premium) both;
        }

        .marell-reviews span {
          color: var(--accent-gold-bright);
          font-size: 1rem;
          letter-spacing: 3px;
          text-shadow: 0 2px 12px var(--accent-glow);
        }

        .marell-reviews p { margin: 0; }

        .marell-section h2 {
          margin: 0;
          font-size: clamp(2.4rem, 5.5vw, 3.8rem);
          font-weight: 200;
          line-height: 1.08;
          letter-spacing: -0.035em;
          color: transparent;
          background: linear-gradient(180deg, #ffffff 0%, #cbd5e1 100%);
          -webkit-background-clip: text;
          background-clip: text;
          text-align: center;
          animation: fadeSlide 0.9s 0.25s var(--ease-premium) both;
        }

        .marell-section > .container > p {
          margin: 0;
          max-width: 620px;
          font-size: clamp(1.05rem, 2.2vw, 1.2rem);
          line-height: 1.75;
          font-weight: 300;
          color: var(--text-muted);
          text-align: center;
          animation: fadeSlide 0.9s 0.4s var(--ease-premium) both;
        }

        .marell-actions {
          display: flex;
          gap: 1.2rem;
          flex-wrap: wrap;
          justify-content: center;
          margin-top: 0.5rem;
          animation: fadeSlide 0.9s 0.55s var(--ease-premium) both;
        }

        .btn {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 1.05rem 2.4rem;
          font-size: 0.85rem;
          font-weight: 600;
          border-radius: var(--radius-card);
          text-decoration: none;
          transition: all 0.4s var(--ease-premium);
          cursor: pointer;
          border: none;
          outline: none;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          overflow: hidden;
          isolation: isolate;
        }

        .btn::before {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.25) 50%, transparent 60%);
          transform: translateX(-100%);
          transition: transform 0.6s var(--ease-premium);
          z-index: 1;
        }

        .btn:hover::before { transform: translateX(100%); }
        .btn:active { transform: scale(0.98) !important; }

        .btn-primary {
          background: linear-gradient(145deg, var(--accent-gold) 0%, #a8881e 100%);
          color: #08090d;
          box-shadow: 0 8px 28px rgba(201, 162, 39, 0.28), 0 0 0 1px rgba(255,255,255,0.15) inset;
        }

        .btn-primary:hover {
          transform: translateY(-3px);
          box-shadow: 0 14px 38px rgba(201, 162, 39, 0.45), 0 0 0 1px rgba(255,255,255,0.2) inset;
          background: linear-gradient(145deg, #d9b32c 0%, #b8941f 100%);
        }

        .btn-ghost {
          background: rgba(255, 255, 255, 0.03);
          color: var(--text-primary);
          border: 1px solid rgba(255, 255, 255, 0.12);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }

        .btn-ghost:hover {
          background: rgba(255, 255, 255, 0.07);
          border-color: rgba(255, 255, 255, 0.25);
          transform: translateY(-3px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }

        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.92); }
          to { opacity: 1; transform: scale(1); }
        }

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
            transform: none !important;
          }
        }
      `}</style>

      <section className="marell-section" aria-labelledby="marell-heading">
        <div className="container">
          <div className="marell-reviews" role="img" aria-label="5 star rating">
            <span aria-hidden="true">★★★★★</span>
            <p>Rated 4.8/5 by investors worldwide</p>
          </div>

          <h2 id="marell-heading">Explore Marell Investment Platform</h2>
          <p>
            Smart ROI calculations, transparent performance metrics, and trusted
            reviews — all in one place.
          </p>

          <div className="marell-actions">
            <Link to="/marell/login" className="btn btn-primary">Go to Marell Platform</Link>
            <Link to="/marell/calculator" className="btn btn-ghost">Try ROI Calculator</Link>
          </div>
        </div>
      </section>
    </>
  );
}
