import { createContext, useContext, useState, useEffect } from "react";

/**
 * AuthContext
 * Provides admin authentication state and helpers across the entire app.
 * Token is persisted to localStorage so sessions survive page refreshes.
 */
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("qr_admin_token") || null);
  const [admin, setAdmin] = useState(() => {
    try {
      const saved = localStorage.getItem("qr_admin_info");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Login: persist token and admin info
  const login = (token, adminInfo) => {
    localStorage.setItem("qr_admin_token", token);
    localStorage.setItem("qr_admin_info", JSON.stringify(adminInfo));
    setToken(token);
    setAdmin(adminInfo);
  };

  // Logout: clear storage
  const logout = () => {
    localStorage.removeItem("qr_admin_token");
    localStorage.removeItem("qr_admin_info");
    setToken(null);
    setAdmin(null);
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ token, admin, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook for convenient access
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
};
