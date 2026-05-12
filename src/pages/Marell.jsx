import React, { useEffect, useMemo, useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "./contexts/AuthContext";
import { loadOrders, createOrder, updateOrder } from "./utils/orders";
import MarellCalculator from "./Marell.Calculator"; // ensure this file exists and exports default




/**
 * Marell dashboard (drop-in)
 * - Removed hardcoded recharge account details
 * - Recharge flow directs users to contact/admin (chat)
 * - Admin can send messages (account details or instructions) per order
 * - Admin confirms/marks orders and triggers tawk notifications when available
 *
 * Persistence: localStorage keys: marell_users, marell_orders, marell_portfolio
 * Replace localStorage with backend calls in production.
 */

const PRODUCTS = [
  { id: "A", name: "Marell A", min: 50000, roi: 12 },
  { id: "B", name: "Marell B", min: 100000, roi: 15 },
  { id: "C", name: "Marell C", min: 200000, roi: 18 },
  { id: "V1", name: "Marell V1", min: 1000000, roi: 10 },
];

function fmtNaira(n) {
  if (n == null || isNaN(Number(n))) return "₦0.00";
  return "₦" + Number(n).toLocaleString();
}

export default function Marell() {
  const { user, logout, refreshUser } = useContext(AuthContext);
  const navigate = useNavigate();

  // UI state
  const [active, setActive] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [moreOpen, setMoreOpen] = useState(false);
  const [tIndex, setTIndex] = useState(0);

  // domain state
  const [portfolio, setPortfolio] = useState(() => {
    const raw = localStorage.getItem("marell_portfolio");
    return raw ? JSON.parse(raw) : [];
  });
  const [orders, setOrders] = useState(() => loadOrders());

  // forms
  const [investForm, setInvestForm] = useState({ product: PRODUCTS[0].id, amount: PRODUCTS[0].min });
  const [withdrawForm, setWithdrawForm] = useState({ amount: "", bankName: "", accountName: "", accountNumber: "" });
  const [rechargeForm, setRechargeForm] = useState({ amount: "", method: "bank", reference: "" });

  // admin
  const isAdmin = user?.role === "admin";
  const [adminTab, setAdminTab] = useState("orders");

  // testimonials carousel
  const TESTIMONIALS = useMemo(() => [
    { text: "Marell boosted my ROI by 35% in one year.", author: "Ada, Lagos" },
    { text: "Transparent metrics and easy to use platform.", author: "James, Abuja" },
    { text: "The best investment decision I’ve made.", author: "Ngozi, Port Harcourt" },
  ], []);

  useEffect(() => {
    const id = setInterval(() => setTIndex((p) => (p + 1) % TESTIMONIALS.length), 4500);
    return () => clearInterval(id);
  }, [TESTIMONIALS.length]);

  useEffect(() => {
    localStorage.setItem("marell_portfolio", JSON.stringify(portfolio));
  }, [portfolio]);

  useEffect(() => {
    setOrders(loadOrders());
  }, []);

  // NAV groups
  const primaryNav = ["Dashboard", "Products", "Portfolio", "Quick Calculator"];
  const moreNav = ["Recharge", "Withdraw", "Profile", "My Team", "VIP Center", "Activities", "Settings"];

  // helpers
  function handleLogout() {
    logout();
    navigate("/Marell/login");
  }

  function handleInvest(e) {
    e?.preventDefault();
    const product = PRODUCTS.find(p => p.id === investForm.product);
    const amt = Number(investForm.amount);
    if (!product) return alert("Select a product.");
    if (isNaN(amt) || amt < product.min) return alert(`Minimum for ${product.name} is ${fmtNaira(product.min)}.`);
    const entry = { id: `${product.id}-${Date.now()}`, product: product.name, amount: amt, date: new Date().toISOString().slice(0, 10) };
    setPortfolio(p => [entry, ...p]);
    setActive("Portfolio");
  }

  // create withdraw order
  function submitWithdraw(e) {
    e?.preventDefault();
    const { amount, bankName, accountName, accountNumber } = withdrawForm;
    if (!amount || Number(amount) <= 0) return alert("Enter a valid amount.");
    if (!bankName || !accountName || !accountNumber) return alert("Complete bank details.");
    const order = {
      id: `ord-${Date.now()}`,
      type: "withdraw",
      phone: user?.phone || null,
      amount: Number(amount),
      bankName, accountName, accountNumber,
      method: "bank",
      createdAt: new Date().toISOString(),
      status: inProcessingWindow() ? "Pending" : "Queued",
      userNotified: false,
      adminNote: "",
      processedAt: null,
    };
    createOrder(order);
    setOrders(loadOrders());
    setWithdrawForm({ amount: "", bankName: "", accountName: "", accountNumber: "" });
    setActive("Activities");
  }

  // create recharge order
  function submitRecharge(e) {
    e?.preventDefault();
    const { amount, method, reference } = rechargeForm;
    if (!amount || Number(amount) <= 0) return alert("Enter a valid amount.");
    const order = {
      id: `ord-${Date.now()}`,
      type: "recharge",
      phone: user?.phone || null,
      amount: Number(amount),
      method,
      reference: reference || null,
      createdAt: new Date().toISOString(),
      status: "Awaiting confirmation",
      userNotified: false,
      adminNote: "",
      processedAt: null,
    };
    createOrder(order);
    setOrders(loadOrders());
    setRechargeForm({ amount: "", method: "bank", reference: "" });
    setActive("Activities");
  }

  // admin: send a message (free text) to user for an order (useful to send account details)
  function adminSendMessage(orderId) {
    const ord = orders.find(o => o.id === orderId);
    if (!ord) return alert("Order not found");
    const msg = prompt("Enter message to send to user (account details or instructions):");
    if (!msg) return;
    updateOrder(orderId, { adminNote: msg });
    setOrders(loadOrders());

    // attempt to surface message via tawk (agent + visitor context)
    try {
      if (window.Tawk_API) {
        // attach attributes so agents see context
        window.Tawk_API.setAttributes(
          { lastOrderId: ord.id, lastOrderType: ord.type, lastOrderAmount: String(ord.amount), lastAdminMessage: msg },
          function () {
            if (window.Tawk_API.popup) window.Tawk_API.popup();
          }
        );
        // add event for agent console
        if (window.Tawk_API.addEvent) {
          window.Tawk_API.addEvent("admin_sent_message", { orderId: ord.id, message: msg });
        }
      }
    } catch (err) {
      console.warn("Tawk notify failed", err);
    }

    alert("Message saved to order and agents notified (if tawk is available).");
  }

  // admin confirms recharge (deposit) — only allowed after user acknowledged
  function adminConfirmRecharge(orderId) {
    const ord = orders.find(o => o.id === orderId);
    if (!ord) return alert("Order not found");
    if (!ord.userNotified) return alert("User must acknowledge the order before admin confirms deposit.");

    updateOrder(orderId, { status: "Confirmed", processedAt: new Date().toISOString(), adminNote: (ord.adminNote || "") + " | Confirmed by admin." });

    // deposit to user
    const usersRaw = localStorage.getItem("marell_users");
    if (usersRaw) {
      const users = JSON.parse(usersRaw);
      const idx = users.findIndex(u => u.phone === ord.phone);
      if (idx >= 0) {
        users[idx].balance = (users[idx].balance || 0) + Number(ord.amount);
        localStorage.setItem("marell_users", JSON.stringify(users));
        if (user?.phone === ord.phone && typeof refreshUser === "function") refreshUser();
      }
    }

    // notify user via tawk (attempt)
    try {
      if (window.Tawk_API) {
        window.Tawk_API.setAttributes({ lastOrderId: ord.id, lastOrderStatus: "Confirmed", lastOrderAmount: String(ord.amount) }, function () {
          if (window.Tawk_API.popup) window.Tawk_API.popup();
        });
        if (window.Tawk_API.addEvent) {
          window.Tawk_API.addEvent("recharge_confirmed", { orderId: ord.id, amount: ord.amount });
        }
      }
    } catch (err) {
      console.warn("Tawk notify failed", err);
    }

    setOrders(loadOrders());
    alert("Recharge confirmed and user notified (if tawk available).");
  }

  // admin marks withdrawal processed
  function adminMarkWithdrawProcessed(orderId) {
    updateOrder(orderId, { status: "Processed", processedAt: new Date().toISOString(), adminNote: "Withdrawal processed by admin." });

    // notify user via tawk (attempt)
    try {
      if (window.Tawk_API) {
        window.Tawk_API.setAttributes({ lastOrderId: orderId, lastOrderStatus: "Processed" }, function () {
          if (window.Tawk_API.popup) window.Tawk_API.popup();
        });
        if (window.Tawk_API.addEvent) {
          window.Tawk_API.addEvent("withdrawal_processed", { orderId });
        }
      }
    } catch (err) {
      console.warn("Tawk notify failed", err);
    }

    setOrders(loadOrders());
    alert("Withdrawal marked processed and user notified (if tawk available).");
  }

  // user acknowledges order
  function userAcknowledge(orderId) {
    updateOrder(orderId, { userNotified: true });
    setOrders(loadOrders());
  }

  // small helpers
  function inProcessingWindow(date = new Date()) {
    const h = date.getHours();
    return h >= 10 && h < 17;
  }

  // layout renderers
  function Sidebar() {
    return (
      <aside className={`sidebar panel`} style={{ width: sidebarOpen ? 260 : 72 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Link to="/" className="brand-link" style={{ color: "var(--accent)", fontWeight: 800 }}>Marell</Link>
          <button className="btn btn-ghost" onClick={() => setSidebarOpen(s => !s)} aria-label="Toggle sidebar">{sidebarOpen ? "◀" : "▶"}</button>
        </div>

        <nav style={{ marginTop: 12 }}>
          {primaryNav.map(n => (
            <button key={n} className={`nav-item ${n === active ? "active" : ""}`} onClick={() => { setActive(n); setMoreOpen(false); }} style={{ display: "block", width: "100%", textAlign: "left", marginBottom: 6 }}>
              {sidebarOpen ? n : n[0]}
            </button>
          ))}

          <div style={{ marginTop: 8 }}>
            <button className="nav-item" onClick={() => setMoreOpen(o => !o)} style={{ display: "block", width: "100%", textAlign: "left" }}>
              {sidebarOpen ? "More ▾" : "M"}
            </button>
            {moreOpen && (
              <div style={{ marginTop: 6 }}>
                {moreNav.map(m => (
                  <button key={m} className={`nav-item ${m === active ? "active" : ""}`} onClick={() => setActive(m)} style={{ display: "block", width: "100%", textAlign: "left", marginBottom: 6 }}>
                    {sidebarOpen ? m : m[0]}
                  </button>
                ))}
              </div>
            )}
          </div>
        </nav>

        <div style={{ marginTop: "auto" }}>
          <div className="muted small">Signed in as</div>
          <div style={{ marginTop: 6 }} className="phone-badge">{user?.phone || "—"}</div>
          <div style={{ marginTop: 8 }}>
            <button className="btn btn-ghost" onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <div className="marell-root">
      <style>{`
:root { --bg:#07070a; --panel:#0f1115; --muted:#bfc3c8; --accent:#c9a84c; }
.marell-root { min-height:100vh; background:var(--bg); color:#fff; font-family:Inter, system-ui, -apple-system, "Segoe UI", Roboto, Arial; }
.topbar { display:flex; justify-content:space-between; align-items:center; padding:12px 20px; border-bottom:1px solid rgba(255,255,255,0.03); position:sticky; top:0; background:linear-gradient(90deg, rgba(255,255,255,0.01), transparent); z-index:10; }
.layout { display:flex; gap:18px; max-width:1200px; margin:18px auto; padding:0 12px; align-items:flex-start; }
.panel { background:var(--panel); padding:16px; border-radius:10px; border:1px solid rgba(255,255,255,0.02); box-shadow:0 8px 30px rgba(2,6,23,0.45); }
.testimonials { padding:12px; border-radius:10px; background:linear-gradient(180deg, rgba(201,168,76,0.03), transparent); display:flex; justify-content:space-between; align-items:center; gap:12px; }
.muted { color:var(--muted); }
.phone-badge { background:var(--accent); color:#071018; padding:6px 8px; border-radius:6px; font-weight:700; display:inline-block; }
.nav-item { background:transparent; border:none; color:#dfe6ea; padding:10px; border-radius:8px; cursor:pointer; width:100%; text-align:left; }
.nav-item.active { background:linear-gradient(90deg, rgba(201,168,76,0.08), rgba(201,168,76,0.03)); color:var(--accent); font-weight:700; }
.btn { padding:8px 12px; border-radius:8px; cursor:pointer; border:none; }
.btn-primary { background:var(--accent); color:#071018; font-weight:700; }
.btn-ghost { background:transparent; border:1px solid rgba(255,255,255,0.04); color:#fff; }
.portfolio-table { width:100%; border-collapse:collapse; margin-top:12px; }
.portfolio-table th, .portfolio-table td { text-align:left; padding:8px; border-bottom:1px dashed rgba(255,255,255,0.02); }
.form-error { color:#ffb4b4; background: rgba(255,180,180,0.04); padding:8px; border-radius:8px; }
.form-success { color:#dff3d9; background: rgba(34,77,45,0.12); padding:8px; border-radius:8px; }
@media (max-width:980px) { .layout { flex-direction:column; padding:0 12px; } .sidebar { width:100% !important; } }
      `}</style>

      <header className="topbar">
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{ fontWeight: 800, color: "var(--accent)" }}>Marell</div>
          <div className="muted">Transparent returns · VIP support</div>
        </div>

        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {isAdmin && <div style={{ background: "#0b3", color: "#071018", padding: "4px 8px", borderRadius: 6, fontWeight: 700 }}>Admin</div>}
          <div className="muted small">Signed in as {user?.phone || "—"}</div>
        </div>
      </header>

      <div className="layout">
        <Sidebar />

        <main style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Testimonials / Overview */}
          <section className="panel testimonials" aria-label="Testimonials and overview">
            <div style={{ flex: 1 }}>
              <div style={{ fontStyle: "italic", fontSize: 16 }}>“{TESTIMONIALS[tIndex].text}”</div>
              <div className="muted" style={{ marginTop: 6 }}>— {TESTIMONIALS[tIndex].author}</div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 220 }}>
              <div className="muted small">Balance</div>
              <div style={{ fontWeight: 800 }}>{fmtNaira(user?.balance || 0)}</div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-primary" onClick={() => setActive("Products")}>Recharge / Invest</button>
                <button className="btn btn-ghost" onClick={() => setActive("Activities")}>Activities</button>
              </div>
            </div>
          </section>

          {/* Main content */}
          <section>
            {/* Dashboard */}
            {active === "Dashboard" && (
              <div className="panel">
                <h2>Dashboard</h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginTop: 12 }}>
                  <div style={{ padding: 12, borderRadius: 8, background: "rgba(255,255,255,0.01)" }}>
                    <div className="muted">Total Invested</div>
                    <div style={{ fontWeight: 800, marginTop: 6 }}>{fmtNaira(portfolio.reduce((s, p) => s + Number(p.amount || 0), 0))}</div>
                  </div>
                  <div style={{ padding: 12, borderRadius: 8, background: "rgba(255,255,255,0.01)" }}>
                    <div className="muted">Pending Orders</div>
                    <div style={{ fontWeight: 800, marginTop: 6 }}>{orders.filter(o => o.status !== "Processed" && o.status !== "Confirmed").length}</div>
                  </div>
                  <div style={{ padding: 12, borderRadius: 8, background: "rgba(255,255,255,0.01)" }}>
                    <div className="muted">Recent Activity</div>
                    <div className="muted small" style={{ marginTop: 6 }}>Check Activities for details</div>
                  </div>
                </div>
              </div>
            )}

            {/* Products */}
            {active === "Products" && (
              <div className="panel">
                <h2>Products</h2>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 12 }}>
                  {PRODUCTS.map(p => (
                    <div key={p.id} style={{ width: 260 }} className="product panel">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <div style={{ fontWeight: 800 }}>{p.name}</div>
                          <div className="muted">Min {fmtNaira(p.min)} · ROI {p.roi}% p.a.</div>
                        </div>
                        <div>
                          <button className="btn btn-primary" onClick={() => { setInvestForm({ product: p.id, amount: p.min }); setActive("Portfolio"); }}>Invest</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Portfolio */}
            {active === "Portfolio" && (
              <div className="panel">
                <h2>My Portfolio</h2>
                {portfolio.length === 0 ? <div className="muted">No investments yet.</div> : (
                  <table className="portfolio-table">
                    <thead><tr><th>Product</th><th>Amount</th><th>Date</th></tr></thead>
                    <tbody>
                      {portfolio.map(it => (
                        <tr key={it.id}><td>{it.product}</td><td>{fmtNaira(it.amount)}</td><td>{it.date}</td></tr>
                      ))}
                    </tbody>
                  </table>
                )}
                <div style={{ marginTop: 12 }}>
                  <h4>Quick invest</h4>
                  <form onSubmit={handleInvest} style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 8 }}>
                    <select value={investForm.product} onChange={(e) => setInvestForm(f => ({ ...f, product: e.target.value }))}>
                      {PRODUCTS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    <input type="number" value={investForm.amount} onChange={(e) => setInvestForm(f => ({ ...f, amount: e.target.value }))} />
                    <button className="btn btn-primary" type="submit">Invest</button>
                  </form>
                </div>
              </div>
            )}

            {/* Quick Calculator link (opens sticky) */}
            {active === "Quick Calculator" && (
              <div className="panel">
                <h2>ROI Calculator</h2>
                <div className="muted">Use the sticky ROI calculator (bottom-right) or open the full calculator page.</div>
                <div style={{ marginTop: 8 }}>
                  <Link to="/Marell/calculator" className="btn btn-primary">Open full calculator</Link>
                </div>
              </div>
            )}

            {/* Recharge (no hardcoded account details) */}
            {active === "Recharge" && (
              <div className="panel">
                <h2>Recharge</h2>
                <div className="muted">
                  To recharge your wallet, please contact an admin through support chat. The admin will provide the correct account details and instructions.
                </div>

                <div style={{ marginTop: 12 }}>
                  <button className="btn btn-primary" onClick={() => setActive("Activities")}>View my orders</button>
                  <Link to="/contact" className="btn btn-ghost" style={{ marginLeft: 8 }}>Talk to support</Link>
                </div>

                <div style={{ marginTop: 12 }}>
                  <h4>Create a recharge order</h4>
                  <form onSubmit={submitRecharge} style={{ marginTop: 8, display: "grid", gap: 8 }}>
                    <label>Amount (₦)<input type="number" value={rechargeForm.amount} onChange={(e) => setRechargeForm(f => ({ ...f, amount: e.target.value }))} /></label>
                    <label>Method
                      <select value={rechargeForm.method} onChange={(e) => setRechargeForm(f => ({ ...f, method: e.target.value }))}>
                        <option value="bank">Bank transfer</option>
                        <option value="card">Card</option>
                        <option value="ussd">USSD</option>
                      </select>
                    </label>
                    <label>Reference (optional)<input value={rechargeForm.reference} onChange={(e) => setRechargeForm(f => ({ ...f, reference: e.target.value }))} /></label>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button className="btn btn-primary" type="submit">Create recharge order</button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Withdraw */}
            {active === "Withdraw" && (
              <div className="panel">
                <h2>Withdraw</h2>
                <div className="muted">Withdrawals processed 10:00–17:00 local time. Estimated 1–24 hours.</div>

                <form onSubmit={submitWithdraw} style={{ marginTop: 12, display: "grid", gap: 8 }}>
                  <label>Amount (₦)<input type="number" value={withdrawForm.amount} onChange={(e) => setWithdrawForm(f => ({ ...f, amount: e.target.value }))} /></label>
                  <label>Bank name<input value={withdrawForm.bankName} onChange={(e) => setWithdrawForm(f => ({ ...f, bankName: e.target.value }))} /></label>
                  <label>Account name<input value={withdrawForm.accountName} onChange={(e) => setWithdrawForm(f => ({ ...f, accountName: e.target.value }))} /></label>
                  <label>Account number<input value={withdrawForm.accountNumber} onChange={(e) => setWithdrawForm(f => ({ ...f, accountNumber: e.target.value }))} /></label>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn btn-primary" type="submit">Create withdrawal order</button>
                  </div>
                </form>
              </div>
            )}

            {/* Profile */}
            {active === "Profile" && (
              <div className="panel">
                <h2>Profile</h2>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <div className="muted">Phone</div>
                    <div style={{ fontWeight: 800 }}>{user?.phone || "—"}</div>
                    <div className="muted" style={{ marginTop: 8 }}>Balance</div>
                    <div style={{ fontWeight: 800 }}>{fmtNaira(user?.balance || 0)}</div>
                  </div>
                  <div>
                    <div className="muted">Member since</div>
                    <div>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}</div>
                    <div style={{ marginTop: 8 }}>
                      <button className="btn btn-ghost">Edit profile</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Activities / Orders list */}
            {active === "Activities" && (
              <div className="panel">
                <h2>Orders & Activities</h2>
                <div style={{ marginTop: 12 }}>
                  <h4>Your orders</h4>
                  {orders.filter(o => o.phone === user?.phone).length === 0 ? <div className="muted">No orders yet.</div> : (
                    <ul style={{ listStyle: "none", padding: 0 }}>
                      {orders.filter(o => o.phone === user?.phone).map(o => (
                        <li key={o.id} style={{ padding: 10, borderRadius: 8, background: "rgba(255,255,255,0.01)", marginBottom: 8 }}>
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <div>
                              <div style={{ fontWeight: 700 }}>{o.id} · {o.type.toUpperCase()} · {fmtNaira(o.amount)}</div>
                              <div className="muted small">{o.method || o.bankName || ""}</div>
                              {o.adminNote && <div style={{ marginTop: 6, color: "#dfe6ea" }}><strong>Admin:</strong> {o.adminNote}</div>}
                            </div>
                            <div style={{ textAlign: "right" }}>
                              <div className="muted small">{o.status}</div>
                              <div className="muted small">{o.userNotified ? "You acknowledged" : "Awaiting your acknowledgement"}</div>
                            </div>
                          </div>

                          <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                            {!o.userNotified && <button className="btn btn-ghost" onClick={() => { userAcknowledge(o.id); }}>I saw this</button>}
                            <div className="muted small">{new Date(o.createdAt).toLocaleString()}</div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}

            {/* Settings */}
            {active === "Settings" && (
              <div className="panel">
                <h2>Settings</h2>
                <button className="btn btn-ghost">Change password</button>
              </div>
            )}

            {/* Admin console */}
            {isAdmin && (
              <div className="panel">
                <h2>Admin Console</h2>
                <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                  <button className={`btn ${adminTab === "orders" ? "btn-primary" : "btn-ghost"}`} onClick={() => setAdminTab("orders")}>Orders</button>
                  <button className={`btn ${adminTab === "users" ? "btn-primary" : "btn-ghost"}`} onClick={() => setAdminTab("users")}>Users</button>
                </div>

                {adminTab === "orders" && (
                  <div>
                    <h4>Pending orders</h4>
                    {orders.length === 0 ? <div className="muted">No orders</div> : orders.map(o => (
                      <div key={o.id} style={{ padding: 10, borderRadius: 8, background: "rgba(255,255,255,0.01)", marginBottom: 8 }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <div>
                            <div style={{ fontWeight: 700 }}>{o.id} · {o.type.toUpperCase()} · {fmtNaira(o.amount)}</div>
                            <div className="muted small">{o.phone} · {o.method || o.bankName || ""}</div>
                            <div className="muted small">User acknowledged: {o.userNotified ? "Yes" : "No"}</div>
                            {o.adminNote && <div style={{ marginTop: 6, color: "#dfe6ea" }}><strong>Last admin note:</strong> {o.adminNote}</div>}
                          </div>

                          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            <button className="btn btn-ghost" onClick={() => adminSendMessage(o.id)}>Send message</button>
                            {o.type === "recharge" && <button className="btn btn-primary" disabled={!o.userNotified} onClick={() => adminConfirmRecharge(o.id)}>Confirm & deposit</button>}
                            {o.type === "withdraw" && <button className="btn btn-primary" disabled={!o.userNotified} onClick={() => adminMarkWithdrawProcessed(o.id)}>Mark processed</button>}
                            <div className="muted small">{o.status}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {adminTab === "users" && (
                  <div>
                    <h4>Users</h4>
                    <AdminUsersList refresh={() => setOrders(loadOrders())} />
                  </div>
                )}
              </div>
            )}
          </section>
        </main>
      </div>

      {/* Sticky calculator (single instance) */}
      <StickyCalculator />
    </div>
  );
}

/* --- Admin users list subcomponent --- */
function AdminUsersList({ refresh }) {
  const [users, setUsers] = useState(() => {
    const raw = localStorage.getItem("marell_users");
    return raw ? JSON.parse(raw) : [];
  });

  function refreshList() {
    const raw = localStorage.getItem("marell_users");
    setUsers(raw ? JSON.parse(raw) : []);
  }

  function depositToUser(phone) {
    const amt = prompt("Amount to deposit (₦):");
    if (!amt || Number(amt) <= 0) return;
    const raw = localStorage.getItem("marell_users");
    if (!raw) return alert("No users found");
    const arr = JSON.parse(raw);
    const idx = arr.findIndex(u => u.phone === phone);
    if (idx < 0) return alert("User not found");
    arr[idx].balance = (arr[idx].balance || 0) + Number(amt);
    localStorage.setItem("marell_users", JSON.stringify(arr));
    refreshList();
    if (typeof refresh === "function") refresh();
    alert(`Deposited ${fmtNaira(amt)} to ${phone}`);
  }

  return (
    <div>
      {users.length === 0 ? <div className="muted">No users</div> : users.map(u => (
        <div key={u.phone} style={{ padding: 10, borderRadius: 8, background: "rgba(255,255,255,0.01)", marginBottom: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontWeight: 700 }}>{u.phone}</div>
              <div className="muted small">Balance: {fmtNaira(u.balance || 0)}</div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn btn-ghost" onClick={() => depositToUser(u.phone)}>Deposit</button>
            </div>
          </div>
        </div>
      ))}
      <div style={{ marginTop: 8 }}>
        <button className="btn btn-ghost" onClick={refreshList}>Refresh</button>
      </div>
    </div>
  );
}
