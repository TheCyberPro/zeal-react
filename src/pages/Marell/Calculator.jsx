import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function Calculator() {
  const [amount, setAmount] = useState(1000);
  const [days, setDays] = useState(1);
  const [result, setResult] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Fixed daily rate at 10%
  const FIXED_DAILY_RATE = 10;

  function calculate(e) {
    e?.preventDefault();
    setIsCalculating(true);

    const P = Number(amount);
    const t = Number(days);

    // Simulation delay for UX
    setTimeout(() => {
      if (isNaN(P) || isNaN(t)) {
        setIsCalculating(false);
        return;
      }
      
      const rDaily = FIXED_DAILY_RATE / 100;
      const future = P * Math.pow(1 + rDaily, t);
      setResult(future.toFixed(2));
      setIsCalculating(false);
    }, 400);
  }

  // Auto-calculate on mount or input change (optional, but good for ROI)
  // The prompt implies a button submit, so we stick to that, 
  // but let's make the inputs feel responsive.
  
  const profit = result ? (Number(result) - Number(amount)).toFixed(2) : null;

  return (
    <main className="calc-page-wrapper">
      <style>{`
        .calc-page-wrapper {
          --calc-gold: #c9a84c;
          --calc-gold-bright: #f5d76e;
          --calc-bg: #0a0a0f;
          --calc-card: #13131a;
          --calc-border: rgba(255,255,255,0.08);
          --calc-text: #f5f5f7;
          --calc-text-muted: #8a8a9a;
          
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: radial-gradient(circle at 50% 0%, #161620 0%, var(--calc-bg) 70%);
          padding: 2rem 1.5rem;
          font-family: system-ui, -apple-system, sans-serif;
          color: var(--calc-text);
        }

        .calc-container {
          width: 100%;
          max-width: 520px;
          animation: fadeInUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1);
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .calc-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .calc-title {
          font-size: 1.8rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          margin: 0;
          background: linear-gradient(135deg, #fff, var(--calc-gold-bright));
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .calc-back-link {
          color: var(--calc-text-muted);
          text-decoration: none;
          font-size: 0.9rem;
          transition: color 0.2s;
        }
        .calc-back-link:hover { color: var(--calc-gold); }

        .calc-card {
          background: var(--calc-card);
          border: 1px solid var(--calc-border);
          border-radius: 20px;
          padding: 2rem;
          box-shadow: 0 20px 60px -20px rgba(0,0,0,0.6);
        }

        .calc-group { margin-bottom: 1.5rem; }
        
        .calc-label {
          display: block;
          margin-bottom: 0.5rem;
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--calc-text-muted);
          letter-spacing: 0.03em;
          text-transform: uppercase;
        }

        .calc-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }
        
        .calc-input-icon {
          position: absolute;
          left: 16px;
          color: var(--calc-gold);
          font-weight: 600;
          font-size: 1rem;
        }

        .calc-input {
          width: 100%;
          padding: 14px 16px 14px 34px;
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--calc-border);
          border-radius: 12px;
          color: #fff;
          font-size: 1.1rem;
          font-family: inherit;
          transition: all 0.2s ease;
          outline: none;
        }
        .calc-input:focus {
          border-color: var(--calc-gold);
          background: rgba(201, 168, 76, 0.03);
          box-shadow: 0 0 0 4px rgba(201, 168, 76, 0.1);
        }
        
        .calc-input[readonly] {
          background: rgba(0,0,0,0.3);
          color: var(--calc-text-muted);
          cursor: not-allowed;
          border-color: transparent;
        }

        .calc-actions {
          display: flex;
          gap: 12px;
          margin-top: 2rem;
        }

        .calc-btn {
          flex: 1;
          padding: 14px;
          border-radius: 12px;
          font-weight: 600;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
          border: none;
        }

        .calc-btn-primary {
          background: linear-gradient(135deg, var(--calc-gold-bright), var(--calc-gold));
          color: #0a0a0f;
          box-shadow: 0 8px 20px rgba(201, 168, 76, 0.2);
        }
        .calc-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 28px rgba(201, 168, 76, 0.3);
        }
        .calc-btn-primary:active { transform: translateY(0); }

        .calc-btn-ghost {
          background: rgba(255,255,255,0.04);
          color: var(--calc-text-muted);
          border: 1px solid var(--calc-border);
        }
        .calc-btn-ghost:hover {
          background: rgba(255,255,255,0.08);
          color: #fff;
        }

        /* Result Area */
        .calc-result-box {
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 1px solid var(--calc-border);
          opacity: 0;
          transform: translateY(10px);
          transition: all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
        }
        .calc-result-box.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .calc-result-label {
          font-size: 0.8rem;
          color: var(--calc-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.5rem;
        }

        .calc-result-amount {
          font-size: 2.2rem;
          font-weight: 800;
          color: var(--calc-gold-bright);
          letter-spacing: -0.02em;
          text-shadow: 0 0 24px rgba(201, 168, 76, 0.2);
        }

        .calc-profit-row {
          margin-top: 0.5rem;
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.9rem;
          color: #4ade80;
          font-weight: 500;
        }

        .calc-profit-badge {
          background: rgba(74, 222, 128, 0.1);
          color: #4ade80;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 0.75rem;
        }

        @media (max-width: 600px) {
          .calc-card { padding: 1.5rem; }
          .calc-title { font-size: 1.5rem; }
          .calc-result-amount { font-size: 1.8rem; }
        }
      `}</style>

      <div className="calc-container">
        <header className="calc-header">
          <h1 className="calc-title">ROI Calculator</h1>
          <Link to="/" className="calc-back-link">← Back Home</Link>
        </header>

        <div className="calc-card">
          <form onSubmit={calculate}>
            <div className="calc-group">
              <label className="calc-label">Investment Amount</label>
              <div className="calc-input-wrapper">
                <span className="calc-input-icon">₦</span>
                <input
                  className="calc-input"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  required
                />
              </div>
            </div>

            <div className="calc-group">
              <label className="calc-label">Daily Interest Rate</label>
              <div className="calc-input-wrapper">
                <input
                  className="calc-input"
                  type="text"
                  value={`${FIXED_DAILY_RATE}% (Fixed)`}
                  readOnly
                />
              </div>
            </div>

            <div className="calc-group">
              <label className="calc-label">Duration (Days)</label>
              <div className="calc-input-wrapper">
                <span className="calc-input-icon" style={{ fontSize: '0.9rem' }}>D</span>
                <input
                  className="calc-input"
                  type="number"
                  value={days}
                  onChange={(e) => setDays(e.target.value)}
                  min="1"
                  required
                />
              </div>
            </div>

            <div className="calc-actions">
              <button
                type="button"
                className="calc-btn calc-btn-ghost"
                onClick={() => { setAmount(1000); setDays(1); setResult(null); }}
              >
                Reset
              </button>
              <button
                type="submit"
                className="calc-btn calc-btn-primary"
                disabled={isCalculating}
              >
                {isCalculating ? "Calculating..." : "Calculate ROI"}
              </button>
            </div>
          </form>

          {result && (
            <div className={`calc-result-box ${result ? 'visible' : ''}`}>
              <div className="calc-result-label">Projected Total Return</div>
              <div className="calc-result-amount">₦{Number(result).toLocaleString()}</div>
              
              {profit > 0 && (
                <div className="calc-profit-row">
                  <span className="calc-profit-badge">+{((profit / amount) * 100).toFixed(1)}%</span>
                  <span>Profit: ₦{Number(profit).toLocaleString()}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
