// src/pages/Marell/AdminInbox.jsx
import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

/**
 * Simple admin inbox to view orders (recharge/withdrawal) and process them.
 * - Demo-only: reads/writes localStorage 'marell_orders' and 'marell_portfolio'
 * - Admin can mark processed, reject, or credit user (for recharges)
 */

export default function AdminInbox() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [note, setNote] = useState("");

  useEffect(() => {
    const raw = localStorage.getItem("marell_orders");
    setOrders(raw ? JSON.parse(raw) : []);
  }, []);

  function refresh() {
    const raw = localStorage.getItem("marell_orders");
    setOrders(raw ? JSON.parse(raw) : []);
  }

  function saveOrders(next) {
    localStorage.setItem("marell_orders", JSON.stringify(next));
    setOrders(next);
  }

  function markProcessed(id, creditAmount = 0) {
    const next = orders.map((o) => (o.id === id ? { ...o, status: "Processed", processedAt: new Date().toISOString(), adminNote: note } : o));
    saveOrders(next);
    // if recharge, credit portfolio
    const order = next.find((o) => o.id === id);
    if (order && order.type === "recharge") {
      const rawP = localStorage.getItem("marell_portfolio");
      const port = rawP ? JSON.parse(rawP) : [];
      const credit = creditAmount || order.payload.amount || 0;
      const entry = { id: `CREDIT-${Date.now()}`, product: "Manual Credit", amount: credit, date: new Date().toISOString().slice(0, 10) };
      localStorage.setItem("marell_portfolio", JSON.stringify([entry, ...port]));
    }
    setNote("");
    refresh();
  }

  function rejectOrder(id) {
    const next = orders.map((o) => (o.id === id ? { ...o, status: "Rejected", processedAt: new Date().toISOString(), adminNote: note } : o));
    saveOrders(next);
    setNote("");
    refresh();
  }

  if (!user?.isAdmin) {
    return (
      <div style={{ padding: 24 }}>
        <h2>Admin Inbox</h2>
        <p className="muted">Access denied. Admins only.</p>
        <button className="btn btn-ghost" onClick={() => navigate("/marell")}>Back</button>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <h2>Admin Inbox</h2>
      <p className="muted">Orders are stored in localStorage (demo). Process recharges and withdrawals here.</p>

      <div style={{ marginTop: 12 }}>
        {orders.length === 0 && <div className="muted">No orders yet.</div>}
        {orders.map((o) => (
          <div key={o.id} style={{ padding: 12, borderRadius: 8, background: "rgba(255,255,255,0.01)", marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontWeight: 700 }}>{o.id} · {o.type}</div>
                <div className="muted">{o.payload?.amount ? `Amount: ₦${Number(o.payload.amount).toLocaleString()}` : ""}</div>
                <div className="muted">{o.payload?.userPhone ? `User: ${o.payload.userPhone}` : ""}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ color: o.status === "Processed" ? "#8bd3a8" : o.status === "Rejected" ? "#ff9b9b" : "#c9a84c", fontWeight: 700 }}>{o.status}</div>
                <div className="muted" style={{ fontSize: 12 }}>{new Date(o.createdAt).toLocaleString()}</div>
              </div>
            </div>

            <div style={{ marginTop: 8 }}>
              <textarea placeholder="Admin note (optional)" value={note} onChange={(e) => setNote(e.target.value)} style={{ width: "100%", minHeight: 60 }} />
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <button className="btn btn-primary" onClick={() => markProcessed(o.id)}>Mark processed</button>
                <button className="btn btn-ghost" onClick={() => rejectOrder(o.id)}>Reject</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
