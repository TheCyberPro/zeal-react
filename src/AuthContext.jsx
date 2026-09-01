import React, { createContext, useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // Load persisted auth on mount
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
   * - Returns { success: boolean, error?: string, user?: object }
   *
   * NOTE: Replace with server-side auth in production.
   */
  const login = useCallback(({ phone, password }) => {
    try {
      const raw = localStorage.getItem("marell_users");
      const users = raw ? JSON.parse(raw) : [];

      const found = users.find((u) => u.phone === phone && u.password === password);

      if (!found) {
        return { success: false, error: "Invalid credentials" };
      }

      const u = {
        phone: found.phone,
        role: found.role || "user",
        balance: found.balance || 0,
        createdAt: found.createdAt || new Date().toISOString(),
      };

      persistUser(u);

      if (u.role === "admin") {
        navigate("/marell?admin=1");
      } else {
        navigate("/Marell");
      }

      return { success: true, user: u };
    } catch (err) {
      return { success: false, error: err.message || "Login failed" };
    }
  }, [navigate, persistUser]);

  /**
   * logout
   */
  const logout = useCallback(() => {
    localStorage.removeItem("marell_auth");
    setUser(null);
    navigate("/marell/login");
  }, [navigate]);

  /**
   * refreshUser
   * - Re-reads the persisted user (useful after admin deposits update marell_users)
   */
  const refreshUser = useCallback(() => {
    const raw = localStorage.getItem("marell_auth");
    if (!raw) {
      setUser(null);
      return null;
    }
    try {
      const u = JSON.parse(raw);
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
  }, []);

  /**
   * openSupportChat
   * - Attempts to open tawk.to widget and attach visitor context.
   * - Safe to call anywhere in the app.
   */
  const openSupportChat = useCallback((context = {}) => {
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
        navigate("/contact");
      }
    } catch {
      navigate("/contact");
    }
  }, [user, navigate]);

  const value = {
    user,
    setUser: persistUser,
    login,
    logout,
    refreshUser,
    openSupportChat,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
