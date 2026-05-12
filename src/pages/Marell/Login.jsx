






import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";

/**
 * Full drop-in Login page (luxurious inline styles)
 * - Uses AuthContext.login({ phone, password }) and handles errors
 * - Preserves remember logic and all UI/styling from original file
 * - Keeps all existing UI, accessibility, and behavior intact
 */

export default function Login() {
  const { login } = useContext(AuthContext);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const normalizedPhone = (phone || "").replace(/\D/g, "");
    if (!/^\d{7,15}$/.test(normalizedPhone)) {
      setError("Please enter a valid phone number (digits only).");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    try {
      // Use AuthContext.login which expects { phone, password }
      await login({ phone: normalizedPhone, password });

      // preserve remember preference
      if (remember) {
        localStorage.setItem("marell_auth_remember", "true");
      } else {
        localStorage.removeItem("marell_auth_remember");
      }

      // AuthContext.login handles navigation (to /marell or /marell?admin=1).
      // Keep a safe fallback in case it doesn't navigate.
      navigate("/marell");
    } catch (err) {
      setError(err?.message || "Invalid phone or password. New users: please register.");
    }
  }

  return (
    <div className="marell-login-root" role="main">
      <style>{`
:root{
--bg-1:#06070a;
--bg-2:#0f1316;
--panel:#0f1418;
--muted:#bfc3c8;
--accent:#d4b45a;
--accent-2:#c9a84c;
--glass: rgba(255,255,255,0.03);
--radius-lg:18px;
--radius-md:12px;
--shadow-lg: 0 18px 50px rgba(2,6,23,0.7);
--shadow-md: 0 8px 30px rgba(2,6,23,0.55);
--max-width:1100px;
font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, Arial;
}

/* Page container */
.marell-login-root{
min-height:100vh;
display:flex;
align-items:center;
justify-content:center;
padding:36px;
box-sizing:border-box;
background:
radial-gradient(800px 400px at 10% 10%, rgba(212,180,90,0.04), transparent 6%),
linear-gradient(180deg, var(--bg-1) 0%, var(--bg-2) 100%);
color:#e8e8ea;
}

/* Center card */
.marell-login-wrap{
width:100%;
max-width:var(--max-width);
display:grid;
grid-template-columns: 1fr 420px;
gap:28px;
padding:28px;
border-radius:var(--radius-lg);
background: linear-gradient(180deg, rgba(255,255,255,0.01), rgba(255,255,255,0.005));
box-shadow: var(--shadow-lg);
border: 1px solid rgba(255,255,255,0.03);
overflow:hidden;
}

/* Promo column */
.promo {
padding:36px;
border-radius:12px;
background: linear-gradient(180deg, rgba(212,180,90,0.02), rgba(255,255,255,0.005));
display:flex;
flex-direction:column;
gap:16px;
justify-content:center;
min-height:360px;
box-shadow: var(--shadow-md);
}

.brand {
display:flex;
gap:14px;
align-items:center;
}

.brand-mark {
width:64px;
height:64px;
border-radius:14px;
background: linear-gradient(135deg, var(--accent), #b98f3a);
display:flex;
align-items:center;
justify-content:center;
color:#071018;
font-weight:800;
font-size:1.25rem;
box-shadow: 0 8px 30px rgba(212,180,90,0.12);
}

.brand-title {
font-size:1.6rem;
font-weight:800;
letter-spacing:-0.02em;
color:#fff;
}

.brand-sub {
color:var(--muted);
margin-top:6px;
line-height:1.45;
max-width:60ch;
}

/* CTA */
.promo-cta { margin-top:18px; display:flex; gap:12px; align-items:center; }

.btn { padding:12px 14px; border-radius:12px; cursor:pointer; border:none; font-weight:700; }

.btn-primary {
background: linear-gradient(90deg, var(--accent-2), #b98f3a);
color:#071018;
box-shadow: 0 12px 36px rgba(212,180,90,0.12);
}

.btn-ghost {
background: transparent;
border: 1px solid rgba(255,255,255,0.04);
color:#fff;
}

/* Auth card */
.auth-card {
background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01));
padding:26px;
border-radius:14px;
border: 1px solid rgba(255,255,255,0.04);
box-shadow: 0 16px 48px rgba(2,6,23,0.6);
min-width:320px;
}

.auth-head { display:flex; justify-content:space-between; align-items:center; gap:12px; margin-bottom:14px; }

.auth-title { font-size:1.25rem; font-weight:800; color:#fff; margin:0; }

.auth-sub { color:var(--muted); margin:0; font-size:0.95rem; }

/* Shared input style (unique to login) */
.login-input {
padding:12px 14px;
border-radius:10px;
border:1px solid rgba(255,255,255,0.04);
background: rgba(255,255,255,0.01);
color:#fff;
outline:none;
transition: box-shadow .18s ease, transform .08s ease, border-color .12s ease;
}

.login-input:focus {
box-shadow: 0 10px 30px rgba(212,180,90,0.12);
transform: translateY(-1px);
border-color: rgba(212,180,90,0.18);
}

/* Password row */
.password-row { position:relative; display:flex; gap:8px; align-items:center; }

.pw-toggle {
position:absolute;
right:10px;
top:50%;
transform:translateY(-50%);
background:transparent;
border:none;
color:var(--muted);
cursor:pointer;
padding:6px;
border-radius:8px;
}

/* Remember checkbox (styled) */
.remember-wrap {
display:flex;
align-items:center;
gap:10px;
background: rgba(255,255,255,0.01);
padding:8px 10px;
border-radius:10px;
border: 1px solid rgba(255,255,255,0.03);
}

.remember-wrap input[type="checkbox"] {
width:18px;
height:18px;
accent-color: var(--accent-2);
border-radius:4px;
cursor:pointer;
}

/* Forgot link styled as subtle button */
.forgot-link {
background: transparent;
border: 1px solid rgba(255,255,255,0.04);
color: var(--accent-2);
padding:8px 10px;
border-radius:10px;
text-decoration:none;
font-weight:700;
display:inline-flex;
align-items:center;
gap:8px;
}

.forgot-link:hover { background: rgba(201,168,76,0.03); color: #fff; border-color: rgba(201,168,76,0.12); }

/* Actions */
.auth-actions { display:flex; gap:12px; margin-top:12px; }

.auth-error { margin-top:8px; color:#ffb4b4; background: rgba(255,180,180,0.04); padding:10px; border-radius:8px; }

/* Footer */
.auth-footer { margin-top:14px; display:flex; justify-content:space-between; align-items:center; gap:12px; color:var(--muted); font-size:0.95rem; }
/* login brand */
.marell-login-wrap .brand { display:flex; gap:12px; align-items:center; }
.marell-login-wrap .brand-mark { flex:0 0 auto; display:flex; align-items:center; justify-content:center; }
.marell-login-wrap .brand-title { font-size:1.6rem; font-weight:900; margin:0; }
.marell-login-wrap .brand-sub { color:#bfc3c8; font-size:0.95rem; margin-top:6px; max-width:360px; }

/* ensure Neo font applied */
.marell-login-wrap .brand-title { font-family: var(--brand-font, "NeoFG", Inter, system-ui, -apple-system, "Segoe UI", Roboto, Arial); }

/* smaller screens */
@media (max-width:720px) {
  .marell-login-wrap .brand-title { font-size:1.25rem; }
  .marell-login-wrap .brand-sub { font-size:0.9rem; }
}




/* Responsive */
@media (max-width:980px){
.marell-login-wrap { grid-template-columns: 1fr; padding:18px; gap:18px; }
.promo { order:2; padding:20px; }
.auth-card { order:1; }
.brand-title { font-size:1.35rem; }
}

/* Accessibility focus */
.login-input:focus, .pw-toggle:focus, .btn:focus, .forgot-link:focus { outline: 3px solid rgba(212,180,90,0.12); outline-offset: 2px; }
      `}</style>

{/* --- Login page main wrapper (replace the broken block) --- */}
<div className="marell-login-wrap" aria-labelledby="login-heading">
  {/* Left promo */}
  <aside className="promo" aria-hidden="false">
    <div className="brand" aria-hidden="false">
      <div className="brand-mark" aria-hidden="true" title="Marell">
        {/* simple SVG mark — replace or remove if you prefer */}
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <rect x="1" y="4" width="22" height="12" rx="3" fill="#ffd36b" />
          <path d="M4 16c0 1.1.9 2 2 2h12" stroke="#071018" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          <text x="12" y="13.5" textAnchor="middle" fontWeight="800" fontSize="9" fill="#071018">M</text>
        </svg>
      </div>

      <div>
        <div className="brand-title marell-brand">Marell</div>
        <div className="brand-sub">Premium investment experience — transparent returns, curated products, and VIP support.</div>
      </div>
    </div>

    <ul className="promo-features" aria-hidden="false" style={{ marginTop: 8 }}>
      <li>• <strong>Fast onboarding</strong> — register with your phone</li>
      <li>• <strong>Daily compounding</strong> — clear projected returns</li>
      <li>• <strong>Secure</strong> — wallet & bank integrations</li>
    </ul>

    <div className="promo-cta">
      <Link to="/marell/register" className="btn btn-primary" aria-label="Create account">Create account</Link>
      <Link to="/marell/calculator" className="btn btn-ghost" aria-label="Try ROI Calculator">Try ROI Calculator</Link>
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
              <div style={{ color: "var(--muted)", fontSize: 13 }}>Not a member?</div>
              <Link to="/marell/register" className="btn btn-ghost" style={{ marginTop: 8 }}>Create account</Link>
            </div>
          </div>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <label>
              Phone number
              <input
                className="login-input"
                type="tel"
                inputMode="numeric"
                placeholder="e.g. 08012345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                aria-label="Phone number"
                required
              />
            </label>

            <label style={{ position: "relative" }}>
              Password
              <div className="password-row">
                <input
                  className="login-input"
                  type={showPassword ? "text" : "password"}
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-label="Password"
                  required
                  style={{ width: "100%" }}
                />
                <button
                  type="button"
                  className="pw-toggle"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-pressed={showPassword}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </label>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
              <label className="remember-wrap" style={{ margin: 0 }}>
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  aria-label="Remember me"
                />
                <span style={{ color: "#dfe6ea", fontWeight: 600 }}>Remember me</span>
              </label>

              <Link to="/marell/forgot" className="forgot-link" aria-label="Forgot password">Forgot password?</Link>
            </div>

            <div className="auth-actions" style={{ marginTop: 12 }}>
              <button type="submit" className="btn btn-primary" aria-label="Sign in">Sign in</button>
              <Link to="/" className="btn btn-ghost" style={{ alignSelf: "center" }}>Back to Zeal</Link>
            </div>

            {error && <div className="auth-error" role="alert">{error}</div>}
          </form>

          <div className="auth-footer" style={{ marginTop: 16 }}>
            <div style={{ color: "var(--muted)" }}>
              Need help? <Link to="/contact" style={{ color: "var(--accent-2)", textDecoration: "none" }}>Contact support</Link>
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <Link to="/terms" style={{ color: "var(--muted)", textDecoration: "none" }}>Terms</Link>
              <Link to="/privacy" style={{ color: "var(--muted)", textDecoration: "none" }}>Privacy</Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

