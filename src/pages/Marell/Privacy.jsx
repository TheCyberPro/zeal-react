// src/pages/Marell/Privacy.jsx
import React from "react";
import { Link } from "react-router-dom";

/**
 * Drop-in Privacy Policy page
 * - Clear, concise, and user-friendly
 * - Inline styles to match Marell look-and-feel
 * - Keep this as a starting policy; adapt for legal compliance in your jurisdiction
 */

export default function Privacy() {
  return (
    <main className="marell-privacy-root" style={{ padding: 28, minHeight: "100vh", boxSizing: "border-box", background: "linear-gradient(180deg,#07070a 0%, #0b0b0f 100%)", color: "#e8e8ea", fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, Arial' }}>
      <style>{`
        .privacy-card {
          max-width: 980px;
          margin: 0 auto;
          background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01));
          border: 1px solid rgba(255,255,255,0.03);
          padding: 28px;
          border-radius: 12px;
          box-shadow: 0 12px 36px rgba(2,6,23,0.55);
        }
        .privacy-h { font-size: 1.5rem; margin: 0 0 8px 0; color: #fff; font-weight: 800; }
        .privacy-sub { color: #bfc3c8; margin-bottom: 18px; }
        .privacy-section { margin-top: 18px; }
        .privacy-section h3 { margin: 0 0 8px 0; color: #fff; font-size: 1.05rem; }
        .privacy-section p, .privacy-section li { color: #dfe6ea; line-height: 1.6; font-size: 0.98rem; }
        .privacy-list { margin-left: 1rem; }
        .back-link { display:inline-block; margin-top: 18px; color: #c9a84c; text-decoration: none; font-weight:700; }
        @media (max-width: 980px) {
          .privacy-card { padding: 18px; margin: 12px; }
        }
      `}</style>

      <div className="privacy-card" role="article" aria-labelledby="privacy-heading">
        <header>
          <h1 id="privacy-heading" className="privacy-h">Privacy Policy</h1>
          <div className="privacy-sub">Effective date: <strong>{new Date().toISOString().slice(0,10)}</strong></div>
        </header>

        <section className="privacy-section" aria-labelledby="privacy-1">
          <h3 id="privacy-1">1. Information We Collect</h3>
          <p>We collect information you provide directly (phone, email, password for demo), usage data, and device information. For demo purposes, credentials may be stored locally; in production, credentials must be handled securely on a server.</p>
        </section>

        <section className="privacy-section" aria-labelledby="privacy-2">
          <h3 id="privacy-2">2. How We Use Information</h3>
          <ul className="privacy-list">
            <li>To create and manage your account.</li>
            <li>To provide and improve Platform features.</li>
            <li>To communicate important notices and support messages.</li>
          </ul>
        </section>

        <section className="privacy-section" aria-labelledby="privacy-3">
          <h3 id="privacy-3">3. Data Storage and Security</h3>
          <p>For this demo, data may be stored in your browser (localStorage). In production, data should be stored on secure servers with encryption and best-practice access controls. Do not store sensitive credentials in plaintext in production.</p>
        </section>

        <section className="privacy-section" aria-labelledby="privacy-4">
          <h3 id="privacy-4">4. Sharing and Third Parties</h3>
          <p>We do not sell personal data. We may share data with service providers who help operate the Platform under confidentiality obligations.</p>
        </section>

        <section className="privacy-section" aria-labelledby="privacy-5">
          <h3 id="privacy-5">5. Your Choices</h3>
          <p>You can update or delete your account data where supported. For demo accounts stored locally, clearing browser storage will remove demo data.</p>
        </section>

        <section className="privacy-section" aria-labelledby="privacy-6">
          <h3 id="privacy-6">6. Contact</h3>
          <p>Questions about privacy can be directed to support via the Platform or <Link to="/contact" style={{ color: "#c9a84c", textDecoration: "none" }}>Contact</Link>.</p>
        </section>

        <Link to="/marell" className="back-link">← Back to Marell</Link>
      </div>
    </main>
  );
}
