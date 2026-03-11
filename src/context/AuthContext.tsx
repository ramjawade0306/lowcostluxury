'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type User = { id: string; email: string; name: string; phone?: string } | null;

const AuthContext = createContext<{
  user: User;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
  setUser: (u: User) => void;
}>({
  user: null,
  token: null,
  login: () => {},
  logout: () => {},
  setUser: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<User>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const t = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const u = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    if (t && u) {
      try {
        setToken(t);
        setUserState(JSON.parse(u));
      } catch {}
    }
    setLoaded(true);
  }, []);

  const login = (u: User, t: string) => {
    setUserState(u);
    setToken(t);
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', t);
      localStorage.setItem('user', JSON.stringify(u));
    }
  };

  const logout = () => {
    setUserState(null);
    setToken(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  };

  const setUser = (u: User) => {
    setUserState(u);
    if (typeof window !== 'undefined' && u) {
      localStorage.setItem('user', JSON.stringify(u));
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
