// src/pages/Marell/Terms.jsx
import React from "react";
import { Link } from "react-router-dom";

/**
 * Drop-in Terms of Service page
 * - Lightweight, readable, and mobile-friendly
 * - Matches Marell visual style (self-contained inline styles)
 * - Replace or move styles to global CSS if preferred
 */

export default function Terms() {
  return (
    <main className="marell-terms-root" style={{ padding: 28, minHeight: "100vh", boxSizing: "border-box", background: "linear-gradient(180deg,#07070a 0%, #0b0b0f 100%)", color: "#e8e8ea", fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, Arial' }}>
      <style>{`
        .terms-card {
          max-width: 980px;
          margin: 0 auto;
          background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01));
          border: 1px solid rgba(255,255,255,0.03);
          padding: 28px;
          border-radius: 12px;
          box-shadow: 0 12px 36px rgba(2,6,23,0.55);
        }
        .terms-h { font-size: 1.5rem; margin: 0 0 8px 0; color: #fff; font-weight: 800; }
        .terms-sub { color: #bfc3c8; margin-bottom: 18px; }
        .terms-section { margin-top: 18px; }
        .terms-section h3 { margin: 0 0 8px 0; color: #fff; font-size: 1.05rem; }
        .terms-section p, .terms-section li { color: #dfe6ea; line-height: 1.6; font-size: 0.98rem; }
        .terms-list { margin-left: 1rem; }
        .back-link { display:inline-block; margin-top: 18px; color: #c9a84c; text-decoration: none; font-weight:700; }
        @media (max-width: 980px) {
          .terms-card { padding: 18px; margin: 12px; }
        }
      `}</style>

      <div className="terms-card" role="article" aria-labelledby="terms-heading">
        <header>
          <h1 id="terms-heading" className="terms-h">Terms of Service</h1>
          <div className="terms-sub">Effective date: <strong>{new Date().toISOString().slice(0,10)}</strong></div>
        </header>

        <section className="terms-section" aria-labelledby="terms-1">
          <h3 id="terms-1">1. Acceptance</h3>
          <p>By using Marell (the "Platform"), you agree to these Terms of Service. If you do not agree, do not use the Platform.</p>
        </section>

        <section className="terms-section" aria-labelledby="terms-2">
          <h3 id="terms-2">2. Account and Registration</h3>
          <p>You must provide accurate information when registering. You are responsible for maintaining the confidentiality of your account credentials and for all activity under your account.</p>
        </section>

        <section className="terms-section" aria-labelledby="terms-3">
          <h3 id="terms-3">3. Services and Risk</h3>
          <p>The Platform provides investment product information and tools. Any investment involves risk. Past performance is not a guarantee of future results. You should evaluate risks and consult professionals as needed.</p>
        </section>

        <section className="terms-section" aria-labelledby="terms-4">
          <h3 id="terms-4">4. Prohibited Conduct</h3>
          <ul className="terms-list">
            <li>Do not use the Platform for unlawful activities.</li>
            <li>Do not attempt to reverse-engineer or interfere with Platform operations.</li>
            <li>Do not share account credentials or impersonate others.</li>
          </ul>
        </section>

        <section className="terms-section" aria-labelledby="terms-5">
          <h3 id="terms-5">5. Intellectual Property</h3>
          <p>All content, trademarks, and materials on the Platform are the property of Marell or its licensors. You may not reproduce or distribute Platform content without permission.</p>
        </section>

        <section className="terms-section" aria-labelledby="terms-6">
          <h3 id="terms-6">6. Limitation of Liability</h3>
          <p>To the fullest extent permitted by law, Marell is not liable for indirect, incidental, or consequential damages arising from your use of the Platform.</p>
        </section>

        <section className="terms-section" aria-labelledby="terms-7">
          <h3 id="terms-7">7. Changes</h3>
          <p>We may update these Terms. Continued use after changes constitutes acceptance. We will post the effective date at the top of this page.</p>
        </section>

        <section className="terms-section" aria-labelledby="terms-8">
          <h3 id="terms-8">8. Contact</h3>
          <p>For questions about these Terms, contact support via the Platform or <Link to="/contact" style={{ color: "#c9a84c", textDecoration: "none" }}>Contact</Link>.</p>
        </section>

        <Link to="/marell" className="back-link">← Back to Marell</Link>
      </div>
    </main>
  );
}
