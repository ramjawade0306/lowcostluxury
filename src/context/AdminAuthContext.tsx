'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Admin = { id: string; email: string; name: string } | null;

const AdminAuthContext = createContext<{
  admin: Admin;
  token: string | null;
  login: (admin: Admin, token: string) => void;
  logout: () => void;
}>({
  admin: null,
  token: null,
  login: () => {},
  logout: () => {},
});

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<Admin>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const t = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
    const a = typeof window !== 'undefined' ? localStorage.getItem('admin') : null;
    if (t && a) {
      try {
        setToken(t);
        setAdmin(JSON.parse(a));
      } catch {}
    }
    setLoaded(true);
  }, []);

  const login = (a: Admin, t: string) => {
    setAdmin(a);
    setToken(t);
    if (typeof window !== 'undefined') {
      localStorage.setItem('adminToken', t);
      localStorage.setItem('admin', JSON.stringify(a));
    }
  };

  const logout = () => {
    setAdmin(null);
    setToken(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('admin');
    }
  };

  return (
    <AdminAuthContext.Provider value={{ admin, token, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export const useAdminAuth = () => useContext(AdminAuthContext);
