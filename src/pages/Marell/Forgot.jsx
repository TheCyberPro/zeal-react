// src/pages/Marell/Forgot.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

/**
 * Forgot password flow (demo)
 * - Step 1: Request reset by phone
 * - Step 2: Enter OTP (simulated) and verify
 * - Step 3: Set new password
 *
 * Notes:
 * - Replace localStorage operations with secure server endpoints in production.
 * - tawk.to notifications are attempted when available (window.Tawk_API).
 */

function randomOtp() {
  return String(Math.floor(100000 + Math.random() * 900000)); // 6-digit
}

export default function MarellForgot() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1=request, 2=verify, 3=reset
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(null);
  const [otpInput, setOtpInput] = useState("");
  const [otpError, setOtpError] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);

  // Demo: store OTPs in localStorage under key 'marell_otps' as { phone: otp, expiresAt }
  function saveOtp(phone, otp) {
    const raw = localStorage.getItem("marell_otps");
    const arr = raw ? JSON.parse(raw) : [];
    const expiresAt = Date.now() + 1000 * 60 * 10; // 10 minutes
    const filtered = arr.filter((r) => r.phone !== phone);
    filtered.unshift({ phone, otp, expiresAt });
    localStorage.setItem("marell_otps", JSON.stringify(filtered));
  }

  function readOtp(phone) {
    const raw = localStorage.getItem("marell_otps");
    if (!raw) return null;
    const arr = JSON.parse(raw);
    const rec = arr.find((r) => r.phone === phone);
    if (!rec) return null;
    if (Date.now() > rec.expiresAt) return null;
    return rec.otp;
  }

  function clearOtp(phone) {
    const raw = localStorage.getItem("marell_otps");
    if (!raw) return;
    const arr = JSON.parse(raw).filter((r) => r.phone !== phone);
    localStorage.setItem("marell_otps", JSON.stringify(arr));
  }

  function notifyTawk(eventName, payload) {
    try {
      if (typeof window !== "undefined" && window.Tawk_API) {
        if (window.Tawk_API.setAttributes) {
          window.Tawk_API.setAttributes(payload, () => {
            if (window.Tawk_API.popup) window.Tawk_API.popup();
          });
        }
        if (window.Tawk_API.addEvent) {
          window.Tawk_API.addEvent(eventName, payload);
        }
      }
    } catch (err) {
      // silent
      // console.warn("Tawk notify failed", err);
    }
  }

  async function handleRequest(e) {
    e?.preventDefault();
    setMessage(null);
    setOtpError("");
    if (!phone || phone.trim().length < 7) {
      setOtpError("Enter a valid phone number.");
      return;
    }

    setBusy(true);
    // simulate server: check user exists in marell_users
    const usersRaw = localStorage.getItem("marell_users");
    const users = usersRaw ? JSON.parse(usersRaw) : [];
    const user = users.find((u) => u.phone === phone.trim());

    // For privacy, do not reveal whether phone exists; still proceed with OTP flow.
    const otp = randomOtp();
    saveOtp(phone.trim(), otp);
    setOtpSent(true);
    setStep(2);
    setMessage("A one‑time code has been sent to your phone (demo).");

    // notify admin/agents via tawk with context
    notifyTawk("password_reset_requested", { phone: phone.trim(), note: "User requested password reset" });

    // For demo convenience, show OTP in UI console (remove in production)
    // eslint-disable-next-line no-console
    console.info(`[demo] OTP for ${phone.trim()}: ${otp}`);

    setBusy(false);
  }

  function handleVerify(e) {
    e?.preventDefault();
    setOtpError("");
    const expected = readOtp(phone.trim());
    if (!expected) {
      setOtpError("No valid code found or code expired. Request a new code.");
      return;
    }
    if (otpInput.trim() !== expected) {
      setOtpError("Invalid code. Check and try again.");
      return;
    }
    // success
    clearOtp(phone.trim());
    setStep(3);
    setMessage("Code verified. Set your new password.");
  }

  function handleReset(e) {
    e?.preventDefault();
    setMessage(null);
    if (!newPassword || newPassword.length < 6) {
      setMessage({ type: "error", text: "Password must be at least 6 characters." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match." });
      return;
    }

    // update user in localStorage (demo)
    const usersRaw = localStorage.getItem("marell_users");
    const users = usersRaw ? JSON.parse(usersRaw) : [];
    const idx = users.findIndex((u) => u.phone === phone.trim());
    if (idx >= 0) {
      users[idx].password = newPassword; // demo only; do not store plaintext in production
      localStorage.setItem("marell_users", JSON.stringify(users));
    } else {
      // If user not found, create a minimal record so login can work in demo
      users.unshift({ phone: phone.trim(), password: newPassword, balance: 0, createdAt: new Date().toISOString() });
      localStorage.setItem("marell_users", JSON.stringify(users));
    }

    // notify admin and tawk
    notifyTawk("password_reset_completed", { phone: phone.trim(), note: "User completed password reset" });

    setMessage({ type: "success", text: "Password updated. You can now sign in." });
    setTimeout(() => {
      navigate("/marell/login");
    }, 1200);
  }

  function handleResend() {
    // resend OTP
    const otp = randomOtp();
    saveOtp(phone.trim(), otp);
    setOtpInput("");
    setOtpError("");
    setMessage("A new code has been sent (demo).");
    // eslint-disable-next-line no-console
    console.info(`[demo] Resent OTP for ${phone.trim()}: ${otp}`);
    notifyTawk("password_reset_resent", { phone: phone.trim() });
  }

  return (
    <div style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ width: 520, maxWidth: "100%" }} aria-live="polite">
        <div style={{ marginBottom: 12 }}>
          <h1 style={{ margin: 0 }}>Reset your password</h1>
          <p className="muted" style={{ marginTop: 6 }}>Enter your phone number to receive a one‑time code.</p>
        </div>

        {message && typeof message === "string" && <div role="status" style={{ marginBottom: 8, color: "#dff3d9" }}>{message}</div>}
        {message && typeof message === "object" && message.type === "error" && <div role="alert" style={{ marginBottom: 8, color: "#ffb4b4" }}>{message.text}</div>}
        {message && typeof message === "object" && message.type === "success" && <div role="status" style={{ marginBottom: 8, color: "#dff3d9" }}>{message.text}</div>}

        {step === 1 && (
          <form onSubmit={handleRequest} aria-label="Request password reset">
            <label style={{ display: "block", marginBottom: 8 }}>
              Phone number
              <input
                type="tel"
                inputMode="numeric"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 08012345678"
                required
                aria-label="Phone number"
                style={{ width: "100%", padding: 10, marginTop: 6, borderRadius: 8, border: "1px solid rgba(255,255,255,0.06)", background: "transparent", color: "#fff" }}
              />
            </label>

            {otpError && <div role="alert" style={{ color: "#ffb4b4", marginBottom: 8 }}>{otpError}</div>}

            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn btn-primary" type="submit" disabled={busy}>{busy ? "Sending…" : "Send code"}</button>
              <Link to="/marell/login" className="btn btn-ghost" style={{ alignSelf: "center" }}>Back to sign in</Link>
            </div>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerify} aria-label="Verify code" style={{ marginTop: 8 }}>
            <div style={{ marginBottom: 8 }}>
              <div className="muted">We sent a 6‑digit code to the phone number you provided.</div>
            </div>

            <label style={{ display: "block", marginBottom: 8 }}>
              One‑time code
              <input
                type="text"
                inputMode="numeric"
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value)}
                placeholder="Enter code"
                required
                aria-label="One-time code"
                style={{ width: "100%", padding: 10, marginTop: 6, borderRadius: 8, border: "1px solid rgba(255,255,255,0.06)", background: "transparent", color: "#fff" }}
              />
            </label>

            {otpError && <div role="alert" style={{ color: "#ffb4b4", marginBottom: 8 }}>{otpError}</div>}

            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn btn-primary" type="submit">Verify code</button>
              <button type="button" className="btn btn-ghost" onClick={handleResend}>Resend code</button>
              <button type="button" className="btn btn-ghost" onClick={() => { setStep(1); setOtpSent(false); }}>Use different number</button>
            </div>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleReset} aria-label="Set new password" style={{ marginTop: 8 }}>
            <label style={{ display: "block", marginBottom: 8 }}>
              New password
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Choose a strong password"
                required
                aria-label="New password"
                style={{ width: "100%", padding: 10, marginTop: 6, borderRadius: 8, border: "1px solid rgba(255,255,255,0.06)", background: "transparent", color: "#fff" }}
              />
            </label>

            <label style={{ display: "block", marginBottom: 8 }}>
              Confirm password
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                required
                aria-label="Confirm password"
                style={{ width: "100%", padding: 10, marginTop: 6, borderRadius: 8, border: "1px solid rgba(255,255,255,0.06)", background: "transparent", color: "#fff" }}
              />
            </label>

            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn btn-primary" type="submit">Set new password</button>
              <button type="button" className="btn btn-ghost" onClick={() => { setStep(1); setOtpSent(false); }}>Cancel</button>
            </div>
          </form>
        )}

        <div style={{ marginTop: 12, color: "var(--muted)" }}>
          <div>Need help? <Link to="/contact" style={{ color: "var(--accent)" }}>Contact support</Link></div>
        </div>
      </div>
    </div>
  );
}

