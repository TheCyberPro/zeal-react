// src/contexts/AuthContext.jsx
import React, { createContext, useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // load persisted auth on mount
  useEffect(() => {
    const raw = localStorage.getItem("marell_auth");
    if (raw) {
      try {
        setUser(JSON.parse(raw));
      } catch {
        localStorage.removeItem("marell_auth");
      }
    }
  }, []);

  // Helper: persist current user to localStorage
  const persistUser = useCallback((u) => {
    if (!u) {
      localStorage.removeItem("marell_auth");
      setUser(null);
      return;
    }
    localStorage.setItem("marell_auth", JSON.stringify(u));
    setUser(u);
  }, []);

  /**
   * login
   * - Accepts { phone, password } for demo localStorage auth.
   * - Looks up users in localStorage key "marell_users".
   * - If found, sets user object with role and balance.
   * - Redirects to /marell (admins get ?admin=1).
   *
   * NOTE: Replace with server-side auth in production.
   */
  function login({ phone, password }) {
    // demo: find user in marell_users
    const raw = localStorage.getItem("marell_users");
    const users = raw ? JSON.parse(raw) : [];

    // find exact match (demo). In production, call your API.
    const found = users.find((u) => u.phone === phone && u.password === password);

    if (!found) {
      // For demo convenience, do not auto-create here; throw so UI can show error.
      throw new Error("Invalid credentials");
    }

    const u = {
      phone: found.phone,
      role: found.role || "user",
      balance: found.balance || 0,
      createdAt: found.createdAt || new Date().toISOString(),
      // token can be added when using real auth
    };

    persistUser(u);

    // redirect: admins get a query param so Marell can open admin console
    if (u.role === "admin") navigate("/marell?admin=1");
    else navigate("/Marell");

    return u;
  }

  /**
   * logout
   */
  function logout() {
    localStorage.removeItem("marell_auth");
    setUser(null);
    navigate("/marell/login");
  }

  /**
   * refreshUser
   * - Re-reads the persisted user (useful after admin deposits update marell_users)
   */
  function refreshUser() {
    const raw = localStorage.getItem("marell_auth");
    if (!raw) {
      setUser(null);
      return null;
    }
    try {
      const u = JSON.parse(raw);
      // refresh balance from marell_users if present
      const usersRaw = localStorage.getItem("marell_users");
      if (usersRaw) {
        const users = JSON.parse(usersRaw);
        const found = users.find((x) => x.phone === u.phone);
        if (found) {
          u.balance = found.balance || u.balance || 0;
        }
      }
      setUser(u);
      localStorage.setItem("marell_auth", JSON.stringify(u));
      return u;
    } catch {
      localStorage.removeItem("marell_auth");
      setUser(null);
      return null;
    }
  }

  /**
   * openSupportChat
   * - Attempts to open tawk.to widget and attach visitor context.
   * - Safe to call anywhere in the app.
   */
  function openSupportChat(context = {}) {
    try {
      if (typeof window !== "undefined" && window.Tawk_API) {
        const attrs = {
          visitorPhone: user?.phone || "",
          ...context,
        };
        window.Tawk_API.setAttributes(attrs, function () {
          if (window.Tawk_API.popup) window.Tawk_API.popup();
        });
      } else {
        // fallback: navigate to contact page
        navigate("/contact");
      }
    } catch (err) {
      // silent fail; fallback to contact page
      navigate("/contact");
    }
  }

  const value = {
    user,
    setUser: (u) => persistUser(u),
    login,
    logout,
    refreshUser,
    openSupportChat,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
