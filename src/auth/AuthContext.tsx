import React, { createContext, useContext, useState, useCallback } from 'react';

interface AuthContextValue {
  isAuthenticated: boolean;
  login: (password: string) => boolean;
  logout: () => void;
}

// Use localStorage so auth persists across browser sessions (not just tabs)
const STORAGE_KEY = 'cb_auth_persistent';

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    // Check localStorage on first render — stays true until explicit logout
    return localStorage.getItem(STORAGE_KEY) === 'true';
  });

  const login = useCallback((password: string): boolean => {
    const correct = import.meta.env.VITE_APP_PASSWORD;
    if (!correct) {
      console.warn('[Auth] VITE_APP_PASSWORD is not set');
      return false;
    }
    if (password === correct) {
      localStorage.setItem(STORAGE_KEY, 'true');
      setIsAuthenticated(true);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setIsAuthenticated(false);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
