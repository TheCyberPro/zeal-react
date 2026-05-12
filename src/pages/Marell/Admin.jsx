// src/pages/Marell/Admin.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

/**
 * Admin inbox: view orders (recharge & withdrawal), mark processed, deposit to user
 * - Reads/writes localStorage keys: marell_orders, marell_withdrawals, marell_portfolio, marell_users
 * - In production, this would be protected and backed by server APIs
 */

export default function Admin() {
  const [orders, setOrders] = useState(() => JSON.parse(localStorage.getItem("marell_orders") || "[]"));
  const [withdrawals, setWithdrawals] = useState(() => JSON.parse(localStorage.getItem("marell_withdrawals") || "[]"));
  const [users, setUsers] = useState(() => JSON.parse(localStorage.getItem("marell_users") || "[]"));
  const [message, setMessage] = useState("");

  useEffect(() => localStorage.setItem("marell_orders", JSON.stringify(orders)), [orders]);
  useEffect(() => localStorage.setItem("marell_withdrawals", JSON.stringify(withdrawals)), [withdrawals]);
  useEffect(() => localStorage.setItem("marell_users", JSON.stringify(users)), [users]);

  function markProcessed(orderId) {
    setOrders((o) => o.map(x => x.id === orderId ? { ...x, status: "Processed", processedAt: new Date().toISOString() } : x));
    setMessage(`Order ${orderId} marked processed.`);
    setTimeout(() => setMessage(""), 3000);
  }

  function depositToUser(phone, amount) {
    const amt = Number(amount);
    if (isNaN(amt) || amt <= 0) { setMessage("Enter a valid amount."); return; }
    const idx = users.findIndex(u => u.phone === phone);
    if (idx === -1) { setMessage("User not found."); return; }
    // For demo: add a deposit record to user's portfolio
    const portfolio = JSON.parse(localStorage.getItem("marell_portfolio") || "[]");
    const entry = { id: `DEP-${Date.now()}`, product: "Manual Deposit", amount: amt, date: new Date().toISOString().slice(0,10) };
    portfolio.unshift(entry);
    localStorage.setItem("marell_portfolio", JSON.stringify(portfolio));
    setMessage(`Deposited ${amt} to ${phone} (portfolio updated).`);
    setTimeout(() => setMessage(""), 3000);
  }

  function removeOrder(id) {
    setOrders((o) => o.filter(x => x.id !== id));
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Admin Inbox</h2>
      <div style={{ display: "flex", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <h3>Orders</h3>
          {orders.length === 0 && <div className="muted">No orders</div>}
          <ul style={{ listStyle: "none", padding: 0 }}>
            {orders.map(o => (
              <li key={o.id} style={{ padding: 10, borderRadius: 8, background: "rgba(255,255,255,0.02)", marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{o.id} · {o.type}</div>
                    <div className="muted">{o.phone} · {o.status}</div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn btn-primary" onClick={() => markProcessed(o.id)}>Mark processed</button>
                    <button className="btn btn-ghost" onClick={() => removeOrder(o.id)}>Remove</button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div style={{ width: 360 }}>
          <h3>Manual deposit</h3>
          <p className="muted">Deposit funds to a user's portfolio after verifying payment.</p>
          <ManualDeposit onDeposit={depositToUser} />
          {message && <div className="form-success" style={{ marginTop: 8 }}>{message}</div>}
        </div>
      </div>

      <div style={{ marginTop: 20 }}>
        <Link to="/marell" className="btn btn-ghost">Back to Marell</Link>
      </div>

      <style>{`
        .muted{color:#bfc3c8}
        .btn{padding:8px 12px;border-radius:8px;border:none;cursor:pointer;background:transparent;color:#fff}
        .btn-primary{background:#c9a84c;color:#071018}
        .btn-ghost{border:1px solid rgba(255,255,255,0.04)}
        .form-success{color:#dff3d9;background:rgba(34,77,45,0.12);padding:8px;border-radius:8px}
      `}</style>
    </div>
  );
}

function ManualDeposit({ onDeposit }) {
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  return (
    <form onSubmit={(e) => { e.preventDefault(); onDeposit(phone, amount); setPhone(""); setAmount(""); }}>
      <label style={{ display: "block", marginBottom: 8 }}>
        User phone
        <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. +2348012345678" />
      </label>
      <label style={{ display: "block", marginBottom: 8 }}>
        Amount
        <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount in Naira" />
      </label>
      <button className="btn btn-primary" type="submit">Deposit</button>
    </form>
  );
}
