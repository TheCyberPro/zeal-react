// src/pages/Marell/Register.jsx
import React, { useContext, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";

/**
 * Register page (drop-in)
 * - Matches the luxurious Login UI (uses .login-input etc.)
 * - Adds email registration (optional), phone normalization with automatic country code handling
 * - Password strength meter + inline hints
 * - Prevents duplicate registration (localStorage "marell_users")
 * - Auto-login after successful registration (mock token)
 *
 * SECURITY NOTE (visible to user): This demo stores credentials in localStorage in plaintext.
 * For production, send registration to a secure backend and never store plaintext passwords client-side.
 */

export default function Register() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [phoneRaw, setPhoneRaw] = useState("");
  const [phone, setPhone] = useState(""); // normalized phone with country code
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [agree, setAgree] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState("");
  const [pwScore, setPwScore] = useState(0);
  const [pwFeedback, setPwFeedback] = useState("");

  // --- Configuration: default country code and formatting rules ---
  // You can change DEFAULT_COUNTRY to your preferred default (e.g., "+234" for Nigeria)
  const DEFAULT_COUNTRY = "+234";

  // --- Helpers ---
  function onlyDigits(s = "") {
    return (s || "").replace(/\D/g, "");
  }

  // Normalize phone to E.164-like format (very simple):
  // - If user enters starting with '+', keep plus and digits
  // - If user enters starting with '00', convert to '+'
  // - If user enters starting with '0' (local), replace with DEFAULT_COUNTRY (drop leading 0)
  // - If user enters plain digits and length matches local length, prefix DEFAULT_COUNTRY
  function normalizePhone(raw) {
    if (!raw) return "";
    const trimmed = raw.trim();
    if (trimmed.startsWith("+")) {
      // keep plus and digits only
      return "+" + onlyDigits(trimmed);
    }
    if (trimmed.startsWith("00")) {
      return "+" + onlyDigits(trimmed.slice(2));
    }
    const digits = onlyDigits(trimmed);
    if (digits.length === 0) return "";
    // If starts with 0, assume local national format
    if (digits.startsWith("0")) {
      // drop leading zero and prefix default country code without plus duplication
      return DEFAULT_COUNTRY + digits.slice(1);
    }
    // If digits already include country code (e.g., 234...), try to detect
    // If digits length looks like it already contains country code (>=10), prefix plus
    if (digits.length >= 10 && digits.length <= 15) {
      // If digits already start with country digits of DEFAULT_COUNTRY (without +), keep it
      const defDigits = DEFAULT_COUNTRY.replace("+", "");
      if (digits.startsWith(defDigits)) return "+" + digits;
      // otherwise assume it's local national number and prefix default country
      return DEFAULT_COUNTRY + digits;
    }
    // fallback: prefix default country
    return DEFAULT_COUNTRY + digits;
  }

  // Basic email validation
  function isValidEmail(e) {
    if (!e) return false;
    // simple regex for demonstration (not exhaustive)
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());
  }

  // Password strength scoring (simple, client-side)
  function scorePassword(pw = "") {
    let score = 0;
    if (!pw) return { score: 0, feedback: "Enter a password" };
    if (pw.length >= 8) score += 1;
    if (pw.length >= 12) score += 1;
    if (/[a-z]/.test(pw)) score += 1;
    if (/[A-Z]/.test(pw)) score += 1;
    if (/[0-9]/.test(pw)) score += 1;
    if (/[^A-Za-z0-9]/.test(pw)) score += 1;
    // normalize to 0..4 for UI
    const normalized = Math.min(4, Math.floor((score / 6) * 4));
    let feedback = "";
    if (normalized <= 1) feedback = "Weak — use 8+ chars, mix letters & numbers.";
    else if (normalized === 2) feedback = "Fair — add uppercase, numbers, or symbols.";
    else if (normalized === 3) feedback = "Good — longer password or add symbols.";
    else feedback = "Strong — good password.";
    return { score: normalized, feedback };
  }

  useEffect(() => {
    // update normalized phone as user types
    setPhone(normalizePhone(phoneRaw));
  }, [phoneRaw]);

  useEffect(() => {
    const { score, feedback } = scorePassword(password);
    setPwScore(score);
    setPwFeedback(feedback);
  }, [password]);

  // --- Submit handler ---
  async function handleSubmit(e) {
    e?.preventDefault();
    setError("");
    setSuccess("");

    const normalized = phone; // already normalized by effect
    if (!normalized || !/^\+\d{7,15}$/.test(normalized)) {
      setError("Please enter a valid phone number with country code (we auto-add it if missing).");
      return;
    }

    if (email && !isValidEmail(email)) {
      setError("Please enter a valid email address or leave it blank.");
      return;
    }

    if (!password) {
      setError("Password is required.");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    const pwCheck = scorePassword(password);
    if (pwCheck.score < 2) {
      setError("Choose a stronger password. " + pwCheck.feedback);
      return;
    }

    if (!agree) {
      setError("You must agree to the Terms to create an account.");
      return;
    }

    setBusy(true);

    try {
      const usersRaw = localStorage.getItem("marell_users");
      const users = usersRaw ? JSON.parse(usersRaw) : [];

      // prevent duplicate phone or email
      if (users.find((u) => u.phone === normalized)) {
        setError("Phone already registered. Please login instead.");
        setBusy(false);
        return;
      }
      if (email && users.find((u) => u.email && u.email.toLowerCase() === email.toLowerCase())) {
        setError("Email already registered. Please login instead.");
        setBusy(false);
        return;
      }

      // create new user record (mock)
      const newUser = {
        phone: normalized,
        email: email ? email.trim().toLowerCase() : "",
        // NOTE: This is a demo. Do NOT store plaintext passwords in production.
        password,
        createdAt: new Date().toISOString(),
      };

      users.push(newUser);
      localStorage.setItem("marell_users", JSON.stringify(users));

      // auto-login (mock token)
      const token = `mock-token-${Date.now()}`;
      login({ phone: normalized, email: newUser.email || null, token });

      setSuccess("Account created. Redirecting to your dashboard…");
      setTimeout(() => navigate("/marell"), 700);
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  // --- UI ---
  return (
    <div
      className="marell-register-root"
      role="main"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 32,
        boxSizing: "border-box",
        background: "linear-gradient(180deg,#07070a 0%, #0b0b0f 100%)",
        color: "#e8e8ea",
        fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, Arial',
      }}
    >
      <style>{`
:root{
  --panel:#0f1418;
  --muted:#bfc3c8;
  --accent-2:#c9a84c;
  --glass: rgba(255,255,255,0.03);
  --radius-md:12px;
  --shadow-md: 0 8px 30px rgba(2,6,23,0.55);
  --max-width:980px;
}

/* container */
.register-wrap {
  width:100%;
  max-width:var(--max-width);
  display:grid;
  grid-template-columns: 1fr 480px;
  gap:28px;
  padding:28px;
  border-radius:18px;
  background: linear-gradient(180deg, rgba(255,255,255,0.01), rgba(255,255,255,0.005));
  box-shadow: var(--shadow-md);
  border: 1px solid rgba(255,255,255,0.03);
}

/* left promo */
.register-promo { padding:28px; border-radius:12px; background: linear-gradient(180deg, rgba(201,168,76,0.03), rgba(255,255,255,0.01)); display:flex; flex-direction:column; gap:12px; justify-content:center; }
.brand-title { font-size:1.5rem; font-weight:800; color:#fff; }
.brand-sub { color:var(--muted); }

/* auth card */
.register-card { background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01)); padding:24px; border-radius:14px; border:1px solid rgba(255,255,255,0.04); box-shadow: 0 12px 36px rgba(2,6,23,0.55); }

/* shared input */
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
  box-shadow: 0 10px 30px rgba(201,168,76,0.12);
  transform: translateY(-1px);
  border-color: rgba(201,168,76,0.18);
}

/* password strength */
.pw-meter { height:8px; border-radius:8px; background: rgba(255,255,255,0.04); overflow:hidden; margin-top:6px; }
.pw-meter > i { display:block; height:100%; width:0%; background: linear-gradient(90deg, #ff6b6b, #ffd166, #8bd3a8); transition: width .25s ease; }

/* checkbox */
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

/* buttons & messages */
.btn { padding:10px 12px; border-radius:10px; cursor:pointer; border:none; font-weight:700; }
.btn-primary { background: linear-gradient(90deg, var(--accent-2), #b98f3a); color:#071018; }
.btn-ghost { background: transparent; border: 1px solid rgba(255,255,255,0.04); color:#fff; }
.form-error { margin-top:12px; color:#ffb4b4; background: rgba(255,180,180,0.04); padding:10px; border-radius:8px; }
.form-success { margin-top:12px; color:#dff3d9; background: rgba(34,77,45,0.12); padding:10px; border-radius:8px; }

/* responsive */
@media (max-width:980px) {
  .register-wrap { grid-template-columns: 1fr; padding:18px; gap:18px; }
}
      `}</style>

      <div className="register-wrap" aria-labelledby="register-heading">
        <aside className="register-promo" aria-hidden="false">
          <div>
            <div className="brand-title">Join Marell</div>
            <div className="brand-sub" style={{ marginTop: 8 }}>
              Create your account to start investing with transparent returns, daily compounding, and VIP support.
            </div>
          </div>

          <ul style={{ marginTop: 12, color: "#e8e8ea" }}>
            <li>• Fast onboarding with phone or email</li>
            <li>• Built-in ROI calculator</li>
            <li>• Secure wallet & bank integrations</li>
          </ul>

          <div style={{ marginTop: 18 }}>
            <Link to="/marell/login" className="btn btn-ghost" style={{ marginRight: 8 }}>Already have an account?</Link>
            <Link to="/marell/calculator" className="btn btn-primary">Try ROI Calculator</Link>
          </div>
        </aside>

        <section className="register-card" aria-labelledby="register-heading">
          <h2 id="register-heading" style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>Create an account</h2>
          <p style={{ color: "var(--muted)", marginTop: 6 }}>Register with phone or email and a secure password.</p>

          <form onSubmit={handleSubmit} style={{ marginTop: 14 }}>
            <label style={{ display: "flex", flexDirection: "column", gap: 8, color: "#e8e8ea", marginBottom: 10 }}>
              Phone number
              <input
                className="login-input"
                type="tel"
                inputMode="numeric"
                placeholder="e.g. 08012345678 or +2348012345678"
                value={phoneRaw}
                onChange={(e) => setPhoneRaw(e.target.value)}
                aria-label="Phone number"
                required
              />
              <small style={{ color: "var(--muted)" }}>We will normalize your number to include country code automatically: <strong style={{ color: "#fff" }}>{phone || "—"}</strong></small>
            </label>

            <label style={{ display: "flex", flexDirection: "column", gap: 8, color: "#e8e8ea", marginBottom: 10 }}>
              Email (optional)
              <input
                className="login-input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-label="Email address"
              />
              <small style={{ color: "var(--muted)" }}>Providing an email lets you recover your account and receive notifications.</small>
            </label>

            <label style={{ display: "flex", flexDirection: "column", gap: 8, color: "#e8e8ea", marginBottom: 6 }}>
              Password
              <input
                className="login-input"
                type="password"
                placeholder="At least 8 characters, include letters and numbers"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-label="Password"
                required
              />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                <small style={{ color: "var(--muted)" }}>{pwFeedback}</small>
                <small style={{ color: "var(--muted)" }}>Strength: <strong style={{ color: "#fff" }}>{["Very weak","Weak","Fair","Good","Strong"][pwScore]}</strong></small>
              </div>
              <div className="pw-meter" aria-hidden="true">
                <i style={{ width: `${(pwScore / 4) * 100}%` }} />
              </div>
            </label>

            <label style={{ display: "flex", flexDirection: "column", gap: 8, color: "#e8e8ea", marginBottom: 10 }}>
              Confirm password
              <input
                className="login-input"
                type="password"
                placeholder="Repeat your password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                aria-label="Confirm password"
                required
              />
            </label>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
              <label className="remember-wrap" style={{ margin: 0 }}>
                <input
                  type="checkbox"
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                  aria-label="Agree to terms"
                />
                <span style={{ color: "#dfe6ea", fontWeight: 600 }}>I agree to the Terms</span>
              </label>

              <div>
                <Link to="/terms" style={{ color: "var(--muted)", textDecoration: "none", marginRight: 12 }}>Terms</Link>
                <Link to="/privacy" style={{ color: "var(--muted)", textDecoration: "none" }}>Privacy</Link>
              </div>
            </div>

            <div style={{ marginTop: 14, display: "flex", gap: 12 }}>
              <button type="submit" className="btn btn-primary" disabled={busy} aria-label="Register">
                {busy ? "Creating…" : "Register"}
              </button>
              <Link to="/marell/login" className="btn btn-ghost" style={{ alignSelf: "center" }}>Back to Login</Link>
            </div>

            {error && <div className="form-error" role="alert">{error}</div>}
            {success && <div className="form-success" role="status">{success}</div>}
          </form>
        </section>
      </div>
    </div>
  );
}
