'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { AdminAuthProvider, useAdminAuth } from '@/context/AdminAuthContext';
import { useEffect, useState } from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </AdminAuthProvider>
  );
}

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const { admin, logout } = useAdminAuth();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [path]);

  useEffect(() => {
    if (path !== '/admin/login' && admin === null && typeof window !== 'undefined') {
      router.push('/admin/login');
    }
  }, [path, admin, router]);

  if (path === '/admin/login') {
    return <>{children}</>;
  }

  if (!admin) return null;

  const handleLogout = () => {
    logout();
    router.push('/admin/login');
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      {/* Mobile Header with Hamburger */}
      <div className="md:hidden bg-gray-800 p-4 flex justify-between items-center text-white">
        <Link href="/admin" className="text-xl font-bold text-accent">
          Admin
        </Link>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="focus:outline-none">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      <aside className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:block w-full md:w-56 bg-white md:bg-gray-900 p-4 border-r border-gray-100 md:border-none flex-shrink-0 shadow-xl md:shadow-none`}>
        <Link href="/admin" className="hidden md:block text-xl font-bold text-accent mb-6">
          Admin
        </Link>
        <div className="mb-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!search.trim()) return;
              const currentPath = path.split('?')[0];
              router.push(`${currentPath}?search=${encodeURIComponent(search.trim())}`);
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-gray-50 md:bg-gray-800 border-gray-100 md:border-gray-700 text-gray-900 md:text-white text-sm px-3 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-accent"
            />
            <button type="submit" className="bg-accent text-white px-2 rounded-lg text-xs font-bold transition-all hover:bg-accent-dark">
              Go
            </button>
          </form>
        </div>
        <nav className="space-y-1">
          <Link href="/admin" className={`block px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-widest transition-all ${path === '/admin' ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'text-gray-500 md:text-gray-400 hover:bg-accent/5 hover:text-accent font-medium'}`}>Dashboard</Link>
          <Link href="/admin/products" className={`block px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-widest transition-all ${path === '/admin/products' ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'text-gray-500 md:text-gray-400 hover:bg-accent/5 hover:text-accent font-medium'}`}>Products</Link>
          <Link href="/admin/categories" className={`block px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-widest transition-all ${path === '/admin/categories' ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'text-gray-500 md:text-gray-400 hover:bg-accent/5 hover:text-accent font-medium'}`}>Categories</Link>
          <Link href="/admin/orders" className={`block px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-widest transition-all ${path === '/admin/orders' ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'text-gray-500 md:text-gray-400 hover:bg-accent/5 hover:text-accent font-medium'}`}>Orders</Link>
          <Link href="/admin/users" className={`block px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-widest transition-all ${path === '/admin/users' ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'text-gray-500 md:text-gray-400 hover:bg-accent/5 hover:text-accent font-medium'}`}>Users</Link>
          <Link href="/admin/reviews" className={`block px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-widest transition-all ${path === '/admin/reviews' ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'text-gray-500 md:text-gray-400 hover:bg-accent/5 hover:text-accent font-medium'}`}>Reviews</Link>
          <Link href="/admin/coupons" className={`block px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-widest transition-all ${path === '/admin/coupons' ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'text-gray-500 md:text-gray-400 hover:bg-accent/5 hover:text-accent font-medium'}`}>Coupons</Link>
          <Link href="/admin/settings" className={`block px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-widest transition-all ${path === '/admin/settings' ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'text-gray-500 md:text-gray-400 hover:bg-accent/5 hover:text-accent font-medium'}`}>Settings</Link>
          <Link href="/admin/about-shop" className={`block px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-widest transition-all ${path === '/admin/about-shop' ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'text-gray-500 md:text-gray-400 hover:bg-accent/5 hover:text-accent font-medium'}`}>About Shop</Link>
        </nav>
        <div className="mt-8 pt-6 border-t border-gray-700">
          <span className="text-gray-400 text-sm block mb-2">{admin.email}</span>
          <button
            onClick={handleLogout}
            className="text-hot text-sm font-black uppercase tracking-widest hover:underline"
          >
            Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 p-6 overflow-auto bg-gray-50">{children}</main>
    </div>
  );
}
