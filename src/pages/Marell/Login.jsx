import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";

/*
 * Full drop-in Login page (luxurious inline styles)
 * - Fixed navigation to /Marell dashboard
 * - Added loading state & form protection
 * - Preserves all original UI, accessibility, and styling
 */

export default function Login() {
  const { login } = useContext(AuthContext);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const normalizedPhone = (phone || "").replace(/\D/g, "");
    if (!/^\d{7,15}$/.test(normalizedPhone)) {
      setError("Please enter a valid phone number (7-15 digits).");
      setIsLoading(false);
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      setIsLoading(false);
      return;
    }

    try {
      // AuthContext.login handles validation, persistence, and state updates
      await login({ phone: normalizedPhone, password });

      if (remember) {
        localStorage.setItem("marell_auth_remember", "true");
      } else {
        localStorage.removeItem("marell_auth_remember");
      }

      // Redirect to Marell dashboard (replace prevents back-button to login)
      navigate("/Marell", { replace: true });
    } catch (err) {
      console.warn("Login failed:", err);
      setError(err?.message || "Invalid credentials. Please register if you're new.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="marell-login-root" role="main">
      <style>{`
:root {
  --bg-1: #06070a;
  --bg-2: #0f1316;
  --panel: #0f1418;
  --muted: #bfc3c8;
  --accent: #d4b45a;
  --accent-2: #c9a84c;
  --glass: rgba(255,255,255,0.03);
  --radius-lg: 18px;
  --radius-md: 12px;
  --shadow-lg: 0 18px 50px rgba(2,6,23,0.7);
  --shadow-md: 0 8px 30px rgba(2,6,23,0.55);
  --max-width: 1100px;
  font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, Arial;
}

.marell-login-root {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  box-sizing: border-box;
  background:
    radial-gradient(800px 400px at 10% 10%, rgba(212,180,90,0.04), transparent 6%),
    linear-gradient(180deg, var(--bg-1) 0%, var(--bg-2) 100%);
  color: #e8e8ea;
}

.marell-login-wrap {
  width: 100%;
  max-width: var(--max-width);
  display: grid;
  grid-template-columns: 1fr 420px;
  gap: 28px;
  padding: 28px;
  border-radius: var(--radius-lg);
  background: linear-gradient(180deg, rgba(255,255,255,0.01), rgba(255,255,255,0.005));
  box-shadow: var(--shadow-lg);
  border: 1px solid rgba(255,255,255,0.03);
  overflow: hidden;
}

.promo {
  padding: 36px;
  border-radius: 12px;
  background: linear-gradient(180deg, rgba(212,180,90,0.02), rgba(255,255,255,0.005));
  display: flex;
  flex-direction: column;
  gap: 16px;
  justify-content: center;
  min-height: 360px;
  box-shadow: var(--shadow-md);
}

.brand { display: flex; gap: 14px; align-items: center; }
.brand-mark {
  width: 64px; height: 64px; border-radius: 14px;
  background: linear-gradient(135deg, var(--accent), #b98f3a);
  display: flex; align-items: center; justify-content: center;
  color: #071018; font-weight: 800; font-size: 1.25rem;
  box-shadow: 0 8px 30px rgba(212,180,90,0.12);
}
.brand-title { font-size: 1.6rem; font-weight: 800; letter-spacing: -0.02em; color: #fff; }
.brand-sub { color: var(--muted); margin-top: 6px; line-height: 1.45; max-width: 60ch; }

.promo-features { list-style: none; padding: 0; margin: 8px 0 18px; color: #dfe6ea; font-size: 0.95rem; line-height: 1.6; }
.promo-features li { margin-bottom: 4px; }
.promo-features strong { color: var(--accent); }

.promo-cta { margin-top: 12px; display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }

.btn {
  padding: 12px 14px; border-radius: 12px; cursor: pointer; border: none;
  font-weight: 700; text-decoration: none; display: inline-flex; align-items: center; justify-content: center;
  transition: transform 0.1s ease, box-shadow 0.2s ease, opacity 0.2s;
}
.btn:hover { transform: translateY(-1px); }
.btn:active { transform: translateY(0); }
.btn[disabled] { opacity: 0.6; cursor: not-allowed; transform: none; }

.btn-primary {
  background: linear-gradient(90deg, var(--accent-2), #b98f3a);
  color: #071018; box-shadow: 0 12px 36px rgba(212,180,90,0.12);
}
.btn-ghost { background: transparent; border: 1px solid rgba(255,255,255,0.08); color: #fff; }

.auth-card {
  background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01));
  padding: 26px; border-radius: 14px; border: 1px solid rgba(255,255,255,0.04);
  box-shadow: 0 16px 48px rgba(2,6,23,0.6); min-width: 320px;
  display: flex; flex-direction: column; justify-content: center;
}

.auth-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; margin-bottom: 20px; }
.auth-title { font-size: 1.35rem; font-weight: 800; color: #fff; margin: 0; }
.auth-sub { color: var(--muted); margin: 4px 0 0; font-size: 0.9rem; }

.login-input {
  width: 100%; box-sizing: border-box; padding: 12px 14px; border-radius: 10px;
  border: 1px solid rgba(255,255,255,0.06); background: rgba(255,255,255,0.02);
  color: #fff; outline: none; font-size: 0.95rem;
  transition: box-shadow 0.18s ease, border-color 0.12s ease, transform 0.08s ease;
  margin-top: 6px; margin-bottom: 14px;
}
.login-input:focus {
  box-shadow: 0 10px 30px rgba(212,180,90,0.12); transform: translateY(-1px);
  border-color: rgba(212,180,90,0.25);
}
.login-input::placeholder { color: rgba(255,255,255,0.35); }

label { display: block; color: #dfe6ea; font-weight: 500; font-size: 0.9rem; margin-bottom: 4px; }
.label-hint { font-weight: 400; color: var(--muted); font-size: 0.8rem; margin-top: -4px; display: block; margin-bottom: 10px; }

.password-row { position: relative; display: flex; gap: 8px; align-items: center; }
.pw-toggle {
  position: absolute; right: 8px; top: 50%; transform: translateY(-50%);
  background: transparent; border: none; color: var(--muted); cursor: pointer;
  padding: 6px; border-radius: 6px; font-size: 0.8rem; margin-top: 14px;
}
.pw-toggle:hover { color: #fff; background: rgba(255,255,255,0.05); }

.remember-wrap {
  display: flex; align-items: center; gap: 10px;
  background: rgba(255,255,255,0.02); padding: 8px 12px; border-radius: 10px;
  border: 1px solid rgba(255,255,255,0.03); cursor: pointer; width: fit-content;
}
.remember-wrap input[type="checkbox"] {
  width: 16px; height: 16px; accent-color: var(--accent-2); border-radius: 4px; cursor: pointer;
}

.forgot-link {
  background: transparent; border: 1px solid rgba(255,255,255,0.05); color: var(--accent-2);
  padding: 8px 10px; border-radius: 10px; text-decoration: none; font-weight: 600;
  font-size: 0.85rem; display: inline-flex; align-items: center;
}
.forgot-link:hover { background: rgba(201,168,76,0.08); color: #fff; border-color: rgba(201,168,76,0.15); }

.auth-actions { display: flex; gap: 12px; margin-top: 16px; align-items: center; }
.auth-actions .btn { flex: 1; }

.auth-error {
  margin-top: 12px; color: #ffb4b4; background: rgba(255,180,180,0.06);
  padding: 10px 12px; border-radius: 8px; font-size: 0.9rem; border: 1px solid rgba(255,180,180,0.1);
}

.auth-footer { margin-top: 18px; display: flex; justify-content: space-between; align-items: center; gap: 12px; color: var(--muted); font-size: 0.85rem; flex-wrap: wrap; }
.auth-footer a { color: var(--accent-2); text-decoration: none; font-weight: 500; }
.auth-footer a:hover { text-decoration: underline; }

@media (max-width: 980px) {
  .marell-login-wrap { grid-template-columns: 1fr; padding: 18px; gap: 18px; }
  .promo { order: 2; padding: 24px; min-height: auto; }
  .auth-card { order: 1; padding: 22px; }
  .brand-title { font-size: 1.35rem; }
  .promo-features { display: none; }
}

.login-input:focus, .pw-toggle:focus, .btn:focus, .forgot-link:focus, .remember-wrap:focus {
  outline: 3px solid rgba(212,180,90,0.15); outline-offset: 2px;
}
      `}</style>

      <div className="marell-login-wrap" aria-labelledby="login-heading">
        {/* Left promo */}
        <aside className="promo">
          <div className="brand">
            <div className="brand-mark" title="Marell">
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <rect x="1" y="4" width="22" height="12" rx="3" fill="#ffd36b" />
                <path d="M4 16c0 1.1.9 2 2 2h12" stroke="#071018" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                <text x="12" y="13.5" textAnchor="middle" fontWeight="800" fontSize="9" fill="#071018">M</text>
              </svg>
            </div>
            <div>
              <div className="brand-title">Marell</div>
              <div className="brand-sub">Premium investment experience — transparent returns, curated products, and VIP support.</div>
            </div>
          </div>

          <ul className="promo-features">
            <li>• <strong>Fast onboarding</strong> — register with your phone</li>
            <li>• <strong>Daily compounding</strong> — clear projected returns</li>
            <li>• <strong>Secure</strong> — wallet & bank integrations</li>
          </ul>

          <div className="promo-cta">
            <Link to="/Marell/register" className="btn btn-primary">Create account</Link>
            <Link to="/Marell/calculator" className="btn btn-ghost">ROI Calculator</Link>
          </div>
        </aside>

        {/* Right login card */}
        <section className="auth-card" aria-labelledby="login-heading">
          <div className="auth-head">
            <div>
              <h1 id="login-heading" className="auth-title">Welcome back</h1>
              <p className="auth-sub">Sign in to access your Marell dashboard</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ color: "var(--muted)", fontSize: "0.8rem" }}>Not a member?</div>
              <Link to="/Marell/register" className="btn btn-ghost" style={{ marginTop: 6, padding: "8px 12px", fontSize: "0.85rem" }}>Create account</Link>
            </div>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <label htmlFor="phone-input">Phone number</label>
            <input
              id="phone-input"
              className="login-input"
              type="tel"
              inputMode="numeric"
              placeholder="e.g. 08012345678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              autoComplete="tel"
            />

            <label htmlFor="password-input">Password</label>
            <div className="password-row">
              <input
                id="password-input"
                className="login-input"
                type={showPassword ? "text" : "password"}
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="pw-toggle"
                onClick={() => setShowPassword((s) => !s)}
                aria-pressed={showPassword}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6, gap: 8, flexWrap: "wrap" }}>
              <label className="remember-wrap">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                <span style={{ color: "#dfe6ea", fontWeight: 500, fontSize: "0.85rem" }}>Remember me</span>
              </label>
              <Link to="/Marell/forgot" className="forgot-link">Forgot password?</Link>
            </div>

            <div className="auth-actions">
              <button type="submit" className="btn btn-primary" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign in"}
              </button>
              <Link to="/" className="btn btn-ghost" style={{ alignSelf: "center" }}>Back to Zeal</Link>
            </div>

            {error && <div className="auth-error" role="alert">{error}</div>}
          </form>

          <div className="auth-footer">
            <div>Need help? <Link to="/contact">Contact support</Link></div>
            <div style={{ display: "flex", gap: 14 }}>
              <Link to="/terms">Terms</Link>
              <Link to="/privacy">Privacy</Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
