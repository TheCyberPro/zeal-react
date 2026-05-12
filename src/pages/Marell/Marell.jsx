import React, { useEffect, useState, useContext, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import { loadOrders, createOrder, updateOrder } from "../../utils/orders";




export default function Marell() {
  const { user, openSupportChat, refreshUser, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  // UI State
  const [active, setActive] = useState("Dashboard");
  const [menuOpen, setMenuOpen] = useState(false);
  const [orders, setOrders] = useState(() => loadOrders());
  
  // Forms
  const [withdrawForm, setWithdrawForm] = useState({ amount: "", bankName: "", accountName: "", accountNumber: "" });
  const [rechargeForm, setRechargeForm] = useState({ amount: "", method: "bank", reference: "" });

  // Admin State
  const isAdmin = user?.role === "admin";
  const [adminTab, setAdminTab] = useState("orders");
  const [adminNotifications, setAdminNotifications] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);

  // Plans
  const [planIndex, setPlanIndex] = useState(0);

  const TESTIMONIALS = [
    { text: "Marell boosted my ROI by 35% in one year.", author: "Ada, Lagos" },
    { text: "Transparent metrics and easy to use platform.", author: "James, Abuja" },
    { text: "The best investment decision I’ve made.", author: "Ngozi, Port Harcourt" },
  ];

  const PLANS = [
    { id: "A", name: "Marell A", min: 50000, dailyPct: 10, days: 60, bonus: 1000, color: "#FFB86B" },
    { id: "B", name: "Marell B", min: 100000, dailyPct: 10, days: 60, bonus: 2000, color: "#7BE495" },
    { id: "C", name: "Marell C", min: 200000, dailyPct: 10, days: 60, bonus: 3000, color: "#7CC6FF" },
    { id: "D", name: "Marell D", min: 500000, dailyPct: 10, days: 60, bonus: 4000, color: "#D39BFF" },
    { id: "E", name: "Marell E", min: 1000000, dailyPct: 12, days: 60, bonus: 5000, color: "#FF7A7A" },
    { id: "F", name: "Marell F", min: 2000000, dailyPct: 22, days: 60, bonus: 6000, color: "#FFD36B" },
  ];

  // Constants
  const WITHDRAW_MIN = 1200;
  const WITHDRAW_FEE_PERCENT = 10;
  const WITHDRAW_START_HOUR = 10;
  const WITHDRAW_END_HOUR = 18;
  const WITHDRAW_DAILY_LIMIT = 10;

  // Effects
  useEffect(() => {
    setOrders(loadOrders());
  }, []);

  // Admin Notifications Logic
  useEffect(() => {
    if (isAdmin) {
      const all = loadOrders();
      const pending = all.filter(o => 
        o.status !== "Successful" && 
        o.status !== "Processed" && 
        o.status !== "Declined" &&
        (o.type === "recharge" || o.type === "withdraw")
      );
      setAdminNotifications(pending);
    }
  }, [isAdmin, orders]);

  // Cross-tab sync
  useEffect(() => {
    function onStorage(e) {
      if (e.key === "marell_orders" || e.key === "marell_order_created") {
        setOrders(loadOrders());
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    if (isAuthenticated && typeof refreshUser === "function") refreshUser();
  }, [orders, isAuthenticated, refreshUser]);

  useEffect(() => {
    const q = new URLSearchParams(location.search);
    if (q.get("admin") === "1" && isAdmin) {
      setActive("Admin");
      setAdminTab("orders");
    }
  }, [location.search, isAdmin]);

  // Helpers
  function fmtNaira(n) {
    if (n == null || isNaN(Number(n))) return "₦0.00";
    return "₦" + Number(n).toLocaleString();
  }

  function inWithdrawWindow(date = new Date()) {
    const h = date.getHours();
    return h >= WITHDRAW_START_HOUR && h < WITHDRAW_END_HOUR;
  }

  function handleOpenChat(context = {}) {
    if (typeof openSupportChat === "function") {
      openSupportChat({ ...context, from: "marell_dashboard" });
      return;
    }
    try {
      if (window.Tawk_API) {
        window.Tawk_API.setAttributes({ visitorPhone: user?.phone || "", ...context }, function () {
          if (window.Tawk_API.popup) window.Tawk_API.popup();
        });
      } else {
        navigate("/contact");
      }
    } catch {
      navigate("/contact");
    }
  }

  // Actions
  function submitWithdraw(e) {
    e?.preventDefault();
    const { amount, bankName, accountName, accountNumber } = withdrawForm;
    const amt = Number(amount);
    if (!amt || isNaN(amt) || amt < WITHDRAW_MIN) return alert(`Minimum withdrawal is ${fmtNaira(WITHDRAW_MIN)}.`);
    if (!bankName || !accountName || !accountNumber) return alert("Complete bank details.");
    
    const today = new Date().toISOString().slice(0, 10);
    const userWithdrawsToday = orders.filter(o => o.type === "withdraw" && o.phone === user?.phone && o.createdAt.slice(0, 10) === today).length;
    if (userWithdrawsToday >= WITHDRAW_DAILY_LIMIT) return alert(`Daily withdrawal limit reached (${WITHDRAW_DAILY_LIMIT}).`);
    
    const fee = Math.round((WITHDRAW_FEE_PERCENT / 100) * amt);
    const actual = amt - fee;
    const order = {
      id: `ord-${Date.now()}`,
      type: "withdraw",
      phone: user?.phone || null,
      amount: amt,
      fee,
      actualAmount: actual,
      bankName, accountName, accountNumber,
      method: "bank",
      createdAt: new Date().toISOString(),
      status: inWithdrawWindow() ? "Pending" : "Queued",
      userNotified: false,
      adminNote: "",
      processedAt: null,
    };
    createOrder(order);
    setOrders(loadOrders());
    setWithdrawForm({ amount: "", bankName: "", accountName: "", accountNumber: "" });
    setActive("Activities");
  }

  function submitRecharge(e) {
    e?.preventDefault();
    const { amount, method, reference } = rechargeForm;
    const amt = Number(amount);
    if (!amt || isNaN(amt) || amt <= 0) return alert("Enter a valid amount.");
    
    const order = {
      id: `ord-${Date.now()}`,
      type: "recharge",
      phone: user?.phone || null,
      amount: amt,
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

  function adminSendMessage(orderId) {
    const ord = orders.find(o => o.id === orderId);
    if (!ord) return alert("Order not found");
    const msg = prompt("Enter message to send to user:");
    if (!msg) return;
    updateOrder(orderId, { adminNote: msg });
    setOrders(loadOrders());
    alert("Message saved.");
  }

  function adminUpdateOrderStatus(orderId, newStatus, adminNote = "") {
    const ord = orders.find(o => o.id === orderId);
    if (!ord) return alert("Order not found");
    const note = adminNote ? `${ord.adminNote || ""} | ${adminNote}` : ord.adminNote || "";
    updateOrder(orderId, { status: newStatus, processedAt: new Date().toISOString(), adminNote: note });

    if (ord.type === "recharge" && newStatus === "Successful") {
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
    }
    setOrders(loadOrders());
  }

  function userAcknowledge(orderId) {
    updateOrder(orderId, { userNotified: true });
    setOrders(loadOrders());
  }

  function nextPlan() { setPlanIndex((i) => (i + 1) % PLANS.length); }
  function prevPlan() { setPlanIndex((i) => (i - 1 + PLANS.length) % PLANS.length); }

  if (!isAuthenticated) {
    return (
      <div style={{ padding: 24, color: "#fff", textAlign: "center", minHeight: "60vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
        <h2 style={{ marginBottom: "0.5rem" }}>Marell</h2>
        <p style={{ color: "#9ca3af" }}>Please <Link to="/marell/login" style={{ color: "#d4af37", textDecoration: "underline" }}>sign in</Link> to access your dashboard.</p>
      </div>
    );
  }

  return (
    <div className="marell-root">
      <style>{`
        :root {
          --marell-bg: radial-gradient(ellipse 100% 80% at 50% 0%, #0a0c14 0%, #030408 100%);
          --marell-panel: rgba(255, 255, 255, 0.03);
          --marell-panel-border: rgba(255, 255, 255, 0.08);
          --marell-gold: #d4af37;
          --marell-gold-bright: #f5d76e;
          --marell-glow: rgba(212, 175, 55, 0.3);
          --marell-text: #f8f9fa;
          --marell-text-muted: #9ca3af;
          --marell-font: 'Inter', system-ui, -apple-system, sans-serif;
          --marell-radius: 12px;
        }

        .marell-root {
          min-height: 100vh;
          background: var(--marell-bg);
          color: var(--marell-text);
          font-family: var(--marell-font);
          -webkit-font-smoothing: antialiased;
        }

        /* Topbar */
        .marell-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          padding: 0.8rem 1.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          background: rgba(3, 4, 8, 0.85);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .marell-brand {
          font-size: 1.3rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          background: linear-gradient(135deg, var(--marell-gold-bright), var(--marell-gold));
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          text-shadow: 0 0 15px rgba(212, 175, 55, 0.2);
          cursor: default;
        }

        .marell-topbar-right {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .marell-phone {
          color: var(--marell-text-muted);
          font-size: 0.85rem;
          font-weight: 500;
        }

        /* Buttons */
        .marell-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.5rem 1rem;
          font-size: 0.85rem;
          font-weight: 600;
          border-radius: 8px;
          border: 1px solid transparent;
          cursor: pointer;
          transition: all 0.3s ease;
          text-decoration: none;
          gap: 0.4rem;
          font-family: inherit;
        }
        .marell-btn:active { transform: scale(0.98); }

        .marell-btn-ghost {
          background: rgba(255, 255, 255, 0.04);
          border-color: var(--marell-panel-border);
          color: var(--marell-text);
        }
        .marell-btn-ghost:hover { background: rgba(255, 255, 255, 0.08); }

        .marell-btn-primary {
          background: linear-gradient(145deg, var(--marell-gold-bright), var(--marell-gold));
          color: #030408;
          box-shadow: 0 4px 12px -2px var(--marell-glow);
        }
        .marell-btn-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 20px -2px var(--marell-glow);
        }

        /* Notifications */
        .notif-wrap { position: relative; }
        .notif-badge {
          position: absolute; top: -4px; right: -4px;
          width: 16px; height: 16px;
          background: #ef4444; color: #fff;
          font-size: 10px; font-weight: 800;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          border: 2px solid #030408;
        }
        .notif-dropdown {
          position: absolute; right: 0; top: 110%;
          width: 320px; max-height: 400px;
          background: #0c0e14;
          border: 1px solid var(--marell-panel-border);
          border-radius: 12px;
          box-shadow: 0 12px 40px rgba(0,0,0,0.6);
          overflow-y: auto;
          z-index: 200;
        }
        .notif-item {
          padding: 0.8rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          display: flex; flex-direction: column; gap: 0.5rem;
        }
        .notif-item:last-child { border-bottom: none; }
        .notif-id { font-weight: 700; font-size: 0.9rem; color: var(--marell-gold); }
        .notif-meta { font-size: 0.8rem; color: var(--marell-text-muted); }
        .notif-actions { display: flex; gap: 0.4rem; flex-wrap: wrap; }

        /* Navigation */
        .marell-nav {
          position: relative;
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem 1.5rem;
        }
        .marell-menu-dropdown {
          position: absolute;
          top: 100%; left: 0;
          min-width: 200px;
          background: #0f1116;
          border: 1px solid var(--marell-panel-border);
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
          padding: 0.5rem;
          z-index: 50;
          margin-top: 0.5rem;
        }
        .marell-menu-item {
          display: block; width: 100%;
          padding: 0.6rem 0.8rem;
          background: transparent; border: none;
          color: var(--marell-text-muted);
          font-size: 0.9rem;
          cursor: pointer;
          text-align: left;
          border-radius: 8px;
          transition: all 0.2s ease;
          font-family: inherit;
        }
        .marell-menu-item:hover { background: rgba(255,255,255,0.05); color: #fff; }
        
        /* Content Panel */
        .marell-panel {
          margin: 0 1.5rem 3rem;
          padding: 1.5rem;
          background: var(--marell-panel);
          border: 1px solid var(--marell-panel-border);
          border-radius: var(--marell-radius);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }
        
        /* Dashboard Items */
        .marell-balance-card {
          margin-bottom: 1.5rem;
          padding: 1.25rem;
          background: linear-gradient(135deg, rgba(212, 175, 55, 0.08), rgba(255, 255, 255, 0.02));
          border: 1px solid rgba(212, 175, 55, 0.2);
          border-radius: var(--marell-radius);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .balance-label { font-size: 0.85rem; color: var(--marell-text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.25rem; }
        .balance-amount { font-size: 1.8rem; font-weight: 800; color: #fff; }

        /* Marquee */
        .marell-marquee-wrap {
          overflow: hidden;
          border-radius: 8px;
          background: rgba(0, 0, 0, 0.2);
          margin-bottom: 1.5rem;
          padding: 0.5rem 0;
          border: 1px solid rgba(255, 255, 255, 0.03);
        }
        .marell-marquee-track {
          display: flex;
          gap: 2rem;
          width: max-content;
          animation: marquee 20s linear infinite;
        }
        .marell-marquee-wrap:hover .marell-marquee-track { animation-play-state: paused; }
        .marell-t-item {
          padding: 0.5rem 1rem;
          background: rgba(255,255,255,0.03);
          border-radius: 20px;
          white-space: nowrap;
          font-size: 0.9rem;
        }
        .marell-t-text { color: #e2e8f0; font-style: italic; }
        .marell-t-author { color: var(--marell-gold); font-weight: 600; margin-left: 0.5rem; }
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }

        /* Plan Carousel */
        .marell-plan-card {
          padding: 1.5rem;
          border-radius: var(--marell-radius);
          background: linear-gradient(180deg, rgba(255,255,255,0.04), rgba(0,0,0,0.2));
          border: 1px solid rgba(255,255,255,0.08);
          border-left: 4px solid var(--plan-color);
          position: relative;
          overflow: hidden;
        }
        .marell-plan-header { display: flex; justify-content: space-between; margin-bottom: 1rem; }
        .marell-plan-title { font-size: 1.25rem; font-weight: 700; }
        .marell-plan-earn { text-align: right; }
        .marell-plan-amount { font-size: 1.4rem; font-weight: 800; color: var(--marell-gold-bright); }

        /* Train Animation */
        .marell-train-wrap {
          height: 80px; margin-top: 1.5rem; position: relative; overflow: hidden;
          border-top: 1px dashed rgba(255,255,255,0.1);
        }
        .marell-train-svg { width: 100%; height: 100%; }
        .train-car { animation: train-move 6s ease-in-out infinite alternate; }
        @keyframes train-move { 
          0% { transform: translateX(10%); } 
          100% { transform: translateX(60%); } 
        }

        /* Carousel Dots */
        .marell-dots { display: flex; gap: 0.5rem; justify-content: center; margin-top: 1.5rem; }
        .marell-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: rgba(255,255,255,0.2); cursor: pointer;
          transition: all 0.3s ease;
        }
        .marell-dot.active { background: var(--marell-gold); box-shadow: 0 0 8px var(--marell-glow); transform: scale(1.2); }

        /* Forms & Inputs */
        .marell-input, .marell-select {
          width: 100%; padding: 0.75rem;
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: #fff;
          font-family: inherit;
          margin-top: 0.4rem;
          appearance: none;
        }
        .marell-select {
          background-image: url("image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%239ca3af' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 0.75rem center;
        }
        .marell-input:focus, .marell-select:focus { outline: none; border-color: var(--marell-gold); }
        .marell-label { font-size: 0.85rem; font-weight: 500; color: var(--marell-text-muted); display: block; margin-top: 1rem; }
        .marell-label:first-child { margin-top: 0; }

        /* Admin/Activities */
        .marell-order-row {
          padding: 1rem;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 10px;
          margin-bottom: 0.8rem;
        }
        .marell-order-id { font-weight: 700; color: var(--marell-gold); }

        /* Tabs */
        .marell-tab-btn {
          padding: 0.5rem 1rem;
          background: transparent; border: 1px solid rgba(255,255,255,0.1);
          color: var(--marell-text-muted);
          border-radius: 8px; cursor: pointer;
          font-weight: 600;
          transition: all 0.2s;
          font-family: inherit;
        }
        .marell-tab-btn.active { background: var(--marell-gold); color: #000; border-color: var(--marell-gold); }

        /* Responsive */
        @media (max-width: 640px) {
          .marell-topbar { padding: 0.6rem 1rem; }
          .marell-nav { padding: 1rem; }
          .marell-panel { margin: 0 1rem 2rem; padding: 1rem; }
          .marell-balance-card { flex-direction: column; align-items: flex-start; gap: 0.5rem; }
          .marell-plan-card { padding: 1rem; }
          .notif-dropdown { width: calc(100vw - 2rem); right: 1rem; }
        }
      `}</style>

      {/* Header */}
      <header className="marell-topbar">
        <div className="marell-brand">Marell</div>
        <div className="marell-topbar-right">
          {isAdmin && (
            <div className="notif-wrap">
              <button className="marell-btn marell-btn-ghost" onClick={() => setNotifOpen(s => !s)} aria-label="Notifications">
                <span style={{ fontSize: "1.1rem" }}>🔔</span>
                {adminNotifications.length > 0 && <div className="notif-badge">{adminNotifications.length}</div>}
              </button>
              
              {notifOpen && (
                <div className="notif-dropdown">
                  <div style={{ padding: "0.8rem", borderBottom: "1px solid rgba(255,255,255,0.05)", fontWeight: 700 }}>
                    Pending Orders
                  </div>
                  {adminNotifications.length === 0 ? (
                    <div style={{ padding: "1rem", color: "#666", textAlign: "center" }}>No pending orders</div>
                  ) : (
                    adminNotifications.map(n => (
                      <div key={n.id} className="notif-item">
                        <div>
                          <div className="notif-id">{n.id}</div>
                          <div className="notif-meta">{n.type} · {fmtNaira(n.amount)}</div>
                        </div>
                        <div className="notif-actions">
                          <button className="marell-btn marell-btn-primary" style={{ fontSize: "0.75rem", padding: "0.3rem 0.6rem" }} onClick={() => adminUpdateOrderStatus(n.id, "Successful", "Approved")}>Approve</button>
                          <button className="marell-btn marell-btn-ghost" style={{ fontSize: "0.75rem", padding: "0.3rem 0.6rem" }} onClick={() => adminUpdateOrderStatus(n.id, "Declined", "Declined")}>Decline</button>
                        </div>
                      </div>
                    ))
                  )}
                  <div style={{ padding: "0.8rem", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                    <button className="marell-btn marell-btn-ghost" style={{ width: "100%" }} onClick={() => { setNotifOpen(false); setActive("Admin"); }}>View All in Admin</button>
                  </div>
                </div>
              )}
            </div>
          )}
          
          <button className="marell-btn marell-btn-ghost" onClick={() => handleOpenChat()}>
            💬 Chat
          </button>
          
          <span className="marell-phone">{user?.phone || "—"}</span>
        </div>
      </header>

      {/* Navigation */}
      <nav className="marell-nav">
        <div style={{ position: "relative" }}>
          <button className="marell-btn marell-btn-ghost" onClick={() => setMenuOpen(s => !s)}>
            ☰ Menu
          </button>
          {menuOpen && (
            <div className="marell-menu-dropdown">
              {[
                { id: "Dashboard", label: "Dashboard" },
                { id: "Products", label: "Products" },
                { id: "Portfolio", label: "Portfolio" },
                { id: "Recharge", label: "Recharge" },
                { id: "Withdraw", label: "Withdraw" },
                { id: "Activities", label: "Activities" },
                ...(isAdmin ? [{ id: "Admin", label: "Admin Console" }] : [])
              ].map(item => (
                <button key={item.id} className="marell-menu-item" onClick={() => { setActive(item.id); setMenuOpen(false); }}>
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button className="marell-btn marell-btn-ghost" onClick={() => setActive("Activities")}>My Orders</button>
        </div>
      </nav>

      {/* Content */}
      <main className="marell-panel">
        {/* Dashboard */}
        {active === "Dashboard" && (
          <>
            {/* Testimonials */}
            <div className="marell-marquee-wrap">
              <div className="marell-marquee-track">
                {[...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
                  <div key={i} className="marell-t-item">
                    <span className="marell-t-text">"{t.text}"</span>
                    <span className="marell-t-author">— {t.author}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Balance */}
            <div className="marell-balance-card">
              <div>
                <div className="balance-label">Available Balance</div>
                <div className="balance-amount">{fmtNaira(user?.balance || 0)}</div>
              </div>
              <button className="marell-btn marell-btn-primary" onClick={() => setActive("Withdraw")}>Withdraw Funds</button>
            </div>

            {/* Investment Carousel */}
            <div style={{ marginTop: "2rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "0.5rem" }}>
                <h3 style={{ margin: 0 }}>Start your journey</h3>
                <button className="marell-btn marell-btn-ghost" onClick={() => setActive("Products")}>View All Plans</button>
              </div>

              {(() => {
                const plan = PLANS[planIndex];
                const dailyEarnings = Math.round((plan.dailyPct / 100) * plan.min);
                const totalReturns = dailyEarnings * plan.days + plan.bonus;
                return (
                  <div className="marell-plan-card" style={{ "--plan-color": plan.color }}>
                    <div className="marell-plan-header">
                      <div>
                        <div className="marell-plan-title">{plan.name}</div>
                        <div style={{ fontSize: "0.9rem", color: "#9ca3af" }}>{plan.days} Days · {plan.dailyPct}% / Day</div>
                      </div>
                      <div className="marell-plan-earn">
                        <div style={{ fontSize: "0.8rem", color: "#9ca3af" }}>Total Returns</div>
                        <div className="marell-plan-amount">{fmtNaira(totalReturns)}</div>
                        <div style={{ fontSize: "0.75rem", color: "#4ade80" }}>+ Bonus {fmtNaira(plan.bonus)}</div>
                      </div>
                    </div>
                    
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1rem", flexWrap: "wrap", gap: "0.5rem" }}>
                      <button className="marell-btn marell-btn-primary" onClick={() => handleOpenChat({ intent: "invest", plan: plan.id })}>
                        Invest {fmtNaira(plan.min)}
                      </button>
                      <span style={{ fontSize: "0.8rem", color: "#9ca3af" }}>Min: {fmtNaira(plan.min)}</span>
                    </div>

                    {/* SVG Train */}
                    <div className="marell-train-wrap">
                      <svg className="marell-train-svg" viewBox="0 0 100 80">
                        <line x1="0" y1="60" x2="100" y2="60" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
                        <g className="train-car">
                          <rect x="10" y="25" width="40" height="25" rx="4" fill={plan.color} />
                          <circle cx="20" cy="55" r="5" fill="#111" stroke="#fff" strokeWidth="1" />
                          <circle cx="40" cy="55" r="5" fill="#111" stroke="#fff" strokeWidth="1" />
                          <text x="30" y="42" textAnchor="middle" fill="#000" fontSize="10" fontWeight="bold">M-{plan.id}</text>
                        </g>
                      </svg>
                    </div>
                  </div>
                );
              })()}

              <div className="marell-dots">
                {PLANS.map((p, i) => (
                  <div 
                    key={p.id} 
                    className={`marell-dot ${i === planIndex ? "active" : ""}`} 
                    onClick={() => setPlanIndex(i)} 
                  />
                ))}
              </div>
            </div>
          </>
        )}

        {/* Products */}
        {active === "Products" && (
          <>
            <h2 style={{ marginTop: 0 }}>Investment Plans</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1rem" }}>
              {PLANS.map(plan => (
                <div key={plan.id} className="marell-plan-card" style={{ "--plan-color": plan.color }}>
                  <div className="marell-plan-title">{plan.name}</div>
                  <div style={{ color: "#9ca3af", margin: "0.5rem 0" }}>{plan.days} Days · {plan.dailyPct}% Daily</div>
                  <div style={{ fontSize: "1.2rem", fontWeight: "bold", color: plan.color }}>{fmtNaira(plan.min)}</div>
                  <button className="marell-btn marell-btn-primary" style={{ width: "100%", marginTop: "1rem" }} onClick={() => handleOpenChat({ intent: "invest", plan: plan.id })}>
                    Invest Now
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Portfolio */}
        {active === "Portfolio" && (
          <>
            <h2 style={{ marginTop: 0 }}>My Portfolio</h2>
            <div className="marell-order-row" style={{ textAlign: "center", color: "#666" }}>
              Your active investments and history will appear here.
            </div>
          </>
        )}

        {/* Recharge */}
        {active === "Recharge" && (
          <>
            <h2 style={{ marginTop: 0 }}>Recharge Account</h2>
            <div className="marell-balance-card">
              <button className="marell-btn marell-btn-primary" onClick={() => handleOpenChat({ intent: "recharge" })}>
                💬 Chat Admin for Account Details
              </button>
            </div>
            <form onSubmit={submitRecharge} style={{ marginTop: "1.5rem" }}>
              <label className="marell-label">Amount (₦)
                <input type="number" className="marell-input" value={rechargeForm.amount} onChange={e => setRechargeForm(f => ({ ...f, amount: e.target.value }))} required />
              </label>
              <label className="marell-label">Payment Method
                <select className="marell-select" value={rechargeForm.method} onChange={e => setRechargeForm(f => ({ ...f, method: e.target.value }))}>
                  <option value="bank">Bank Transfer</option>
                  <option value="card">Card Payment</option>
                </select>
              </label>
              <label className="marell-label">Reference (Optional)
                <input type="text" className="marell-input" value={rechargeForm.reference} onChange={e => setRechargeForm(f => ({ ...f, reference: e.target.value }))} />
              </label>
              <button className="marell-btn marell-btn-primary" style={{ width: "100%", marginTop: "1.5rem" }} type="submit">
                Submit Request
              </button>
            </form>
          </>
        )}

        {/* Withdraw */}
        {active === "Withdraw" && (
          <>
            <h2 style={{ marginTop: 0 }}>Withdraw Funds</h2>
            <p className="marell-label">Available: <strong style={{ color: "#fff" }}>{fmtNaira(user?.balance || 0)}</strong></p>
            <p style={{ fontSize: "0.8rem", color: "#666" }}>Min: {fmtNaira(WITHDRAW_MIN)} · Fee: {WITHDRAW_FEE_PERCENT}% · Time: {WITHDRAW_START_HOUR}:00 - {WITHDRAW_END_HOUR}:00</p>
            
            <form onSubmit={submitWithdraw} style={{ marginTop: "1.5rem" }}>
              <label className="marell-label">Amount (₦)
                <input type="number" className="marell-input" value={withdrawForm.amount} onChange={e => setWithdrawForm(f => ({ ...f, amount: e.target.value }))} required />
              </label>
              <label className="marell-label">Bank Name
                <input type="text" className="marell-input" value={withdrawForm.bankName} onChange={e => setWithdrawForm(f => ({ ...f, bankName: e.target.value }))} required />
              </label>
              <label className="marell-label">Account Name
                <input type="text" className="marell-input" value={withdrawForm.accountName} onChange={e => setWithdrawForm(f => ({ ...f, accountName: e.target.value }))} required />
              </label>
              <label className="marell-label">Account Number
                <input type="text" className="marell-input" value={withdrawForm.accountNumber} onChange={e => setWithdrawForm(f => ({ ...f, accountNumber: e.target.value }))} required />
              </label>
              <button className="marell-btn marell-btn-primary" style={{ width: "100%", marginTop: "1.5rem" }} type="submit">
                Process Withdrawal
              </button>
            </form>
          </>
        )}

        {/* Activities */}
        {active === "Activities" && (
          <>
            <h2 style={{ marginTop: 0 }}>Activities</h2>
            {orders.filter(o => o.phone === user?.phone).length === 0 ? (
              <div style={{ color: "#666", padding: "2rem", textAlign: "center" }}>No activities yet.</div>
            ) : (
              orders.filter(o => o.phone === user?.phone).map(o => (
                <div key={o.id} className="marell-order-row">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", flexWrap: "wrap", gap: "0.5rem" }}>
                    <div>
                      <div className="marell-order-id">{o.id}</div>
                      <div style={{ fontSize: "0.9rem", color: "#9ca3af" }}>{o.type.toUpperCase()} · {fmtNaira(o.amount)}</div>
                      {o.adminNote && <div style={{ marginTop: "0.5rem", fontSize: "0.8rem", color: "#fbbf24" }}>📢 {o.adminNote}</div>}
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ 
                        display: "inline-block", padding: "0.25rem 0.6rem", borderRadius: "6px", 
                        background: o.status === "Successful" ? "rgba(74, 222, 128, 0.15)" : "rgba(255, 255, 255, 0.05)",
                        color: o.status === "Successful" ? "#4ade80" : "#fff",
                        fontSize: "0.8rem", fontWeight: 700
                      }}>
                        {o.status}
                      </span>
                      <div style={{ fontSize: "0.75rem", color: "#666", marginTop: "0.25rem" }}>{new Date(o.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                  {!o.userNotified && (
                    <button className="marell-btn marell-btn-ghost" style={{ marginTop: "0.8rem", width: "100%" }} onClick={() => userAcknowledge(o.id)}>
                      ✓ Acknowledge
                    </button>
                  )}
                </div>
              ))
            )}
          </>
        )}

        {/* Admin Console */}
        {active === "Admin" && isAdmin && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 0, flexWrap: "wrap", gap: "0.5rem" }}>
              <h2 style={{ marginTop: 0 }}>Admin Console</h2>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button className={`marell-tab-btn ${adminTab === "orders" ? "active" : ""}`} onClick={() => setAdminTab("orders")}>Orders</button>
                <button className={`marell-tab-btn ${adminTab === "users" ? "active" : ""}`} onClick={() => setAdminTab("users")}>Users</button>
              </div>
            </div>
            
            {adminTab === "orders" && orders.length === 0 ? (
              <div style={{ color: "#666", padding: "1rem" }}>No orders found.</div>
            ) : adminTab === "orders" ? (
              orders.map(o => (
                <div key={o.id} className="marell-order-row">
                  <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
                    <div>
                      <div className="marell-order-id">{o.id}</div>
                      <div style={{ fontSize: "0.9rem", color: "#9ca3af" }}>{o.type.toUpperCase()} · {fmtNaira(o.amount)} · {o.phone}</div>
                      {o.adminNote && <div style={{ fontSize: "0.8rem", color: "#fbbf24", marginTop: "0.25rem" }}>📝 {o.adminNote}</div>}
                    </div>
                    <div style={{ display: "flex", gap: "0.4rem", alignItems: "center", flexWrap: "wrap" }}>
                      <button className="marell-btn marell-btn-ghost" style={{ fontSize: "0.75rem" }} onClick={() => adminSendMessage(o.id)}>Message</button>
                      <select 
                        className="marell-select" 
                        style={{ width: "auto", margin: 0, padding: "0.4rem", fontSize: "0.8rem", appearance: "auto" }}
                        value={o.status}
                        onChange={e => {
                          const val = e.target.value;
                          if (["Successful", "Incomplete", "Declined"].includes(val)) {
                            adminUpdateOrderStatus(o.id, val, val + " by admin");
                          } else {
                            updateOrder(o.id, { status: val });
                            setOrders(loadOrders());
                          }
                        }}
                      >
                        <option value={o.status}>{o.status}</option>
                        <option value="Successful">Successful</option>
                        <option value="Processed">Processed</option>
                        <option value="Incomplete">Incomplete</option>
                        <option value="Declined">Declined</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <AdminUsersList fmtNaira={fmtNaira} />
            )}
          </>
        )}
      </main>

      <StickyCalculator />
    </div>
  );
}

/* Subcomponent: Admin Users List */
function AdminUsersList({ fmtNaira }) {
  const [users, setUsers] = useState(() => {
    try {
      const raw = localStorage.getItem("marell_users");
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  });

  function depositToUser(phone) {
    const amt = prompt("Enter amount to deposit:");
    if (!amt || isNaN(amt) || Number(amt) <= 0) return;
    
    const raw = localStorage.getItem("marell_users");
    if (!raw) return alert("No users found.");
    const arr = JSON.parse(raw);
    const idx = arr.findIndex(u => u.phone === phone);
    if (idx < 0) return alert("User not found.");
    
    arr[idx].balance = (arr[idx].balance || 0) + Number(amt);
    localStorage.setItem("marell_users", JSON.stringify(arr));
    setUsers([...arr]);
    alert(`Deposited ${fmtNaira(amt)} to ${phone}`);
  }

  return (
    <div style={{ marginTop: "1rem" }}>
      {users.length === 0 ? <div style={{ color: "#666" }}>No users registered.</div> : users.map(u => (
        <div key={u.phone} className="marell-order-row">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
            <div>
              <div style={{ fontWeight: 700 }}>{u.phone}</div>
              <div style={{ fontSize: "0.9rem", color: "#9ca3af" }}>Balance: {fmtNaira(u.balance || 0)}</div>
            </div>
            <button className="marell-btn marell-btn-ghost" style={{ fontSize: "0.8rem" }} onClick={() => depositToUser(u.phone)}>Deposit</button>
          </div>
        </div>
      ))}
      <button className="marell-btn marell-btn-ghost" style={{ marginTop: "1rem", width: "100%" }} onClick={() => {
        const raw = localStorage.getItem("marell_users");
        if (raw) setUsers(JSON.parse(raw));
      }}>Refresh List</button>
    </div>
  );
}

