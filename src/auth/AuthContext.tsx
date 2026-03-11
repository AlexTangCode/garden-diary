import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// ── Types ────────────────────────────────────────────────
interface AuthContextValue {
  isAuthenticated: boolean;
  login: (password: string) => boolean;
  logout: () => void;
}

// ── Session key ──────────────────────────────────────────
const SESSION_KEY = 'cb_auth_session';

// ── Context ──────────────────────────────────────────────
const AuthContext = createContext<AuthContextValue | null>(null);

// ── Provider ─────────────────────────────────────────────
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    // Restore session on reload (sessionStorage clears when tab closes)
    return sessionStorage.getItem(SESSION_KEY) === 'true';
  });

  const login = useCallback((password: string): boolean => {
    const correct = import.meta.env.VITE_APP_PASSWORD;
    if (!correct) {
      console.warn('[Auth] VITE_APP_PASSWORD is not set in .env');
      return false;
    }
    if (password === correct) {
      sessionStorage.setItem(SESSION_KEY, 'true');
      setIsAuthenticated(true);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY);
    setIsAuthenticated(false);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// ── Hook ─────────────────────────────────────────────────
export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
