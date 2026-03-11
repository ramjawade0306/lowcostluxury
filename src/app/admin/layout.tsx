'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { AdminAuthProvider, useAdminAuth } from '@/context/AdminAuthContext';
import { useEffect } from 'react';

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
      <aside className="w-full md:w-56 bg-gray-800 p-4 flex-shrink-0">
        <Link href="/admin" className="text-xl font-bold text-accent block mb-6">
          Admin
        </Link>
        <nav className="space-y-1">
          <Link href="/admin" className={`block px-4 py-2 rounded-lg ${path === '/admin' ? 'bg-accent text-white' : 'text-gray-300 hover:bg-gray-700'}`}>Dashboard</Link>
          <Link href="/admin/products" className={`block px-4 py-2 rounded-lg ${path === '/admin/products' ? 'bg-accent text-white' : 'text-gray-300 hover:bg-gray-700'}`}>Products</Link>
          <Link href="/admin/categories" className={`block px-4 py-2 rounded-lg ${path === '/admin/categories' ? 'bg-accent text-white' : 'text-gray-300 hover:bg-gray-700'}`}>Categories</Link>
          <Link href="/admin/orders" className={`block px-4 py-2 rounded-lg ${path === '/admin/orders' ? 'bg-accent text-white' : 'text-gray-300 hover:bg-gray-700'}`}>Orders</Link>
          <Link href="/admin/users" className={`block px-4 py-2 rounded-lg ${path === '/admin/users' ? 'bg-accent text-white' : 'text-gray-300 hover:bg-gray-700'}`}>Users</Link>
          <Link href="/admin/reviews" className={`block px-4 py-2 rounded-lg ${path === '/admin/reviews' ? 'bg-accent text-white' : 'text-gray-300 hover:bg-gray-700'}`}>Reviews</Link>
          <Link href="/admin/coupons" className={`block px-4 py-2 rounded-lg ${path === '/admin/coupons' ? 'bg-accent text-white' : 'text-gray-300 hover:bg-gray-700'}`}>Coupons</Link>
          <Link href="/admin/settings" className={`block px-4 py-2 rounded-lg ${path === '/admin/settings' ? 'bg-accent text-white' : 'text-gray-300 hover:bg-gray-700'}`}>Settings</Link>
          <Link href="/admin/about-shop" className={`block px-4 py-2 rounded-lg ${path === '/admin/about-shop' ? 'bg-accent text-white' : 'text-gray-300 hover:bg-gray-700'}`}>About Shop</Link>
        </nav>
        <div className="mt-8 pt-6 border-t border-gray-700">
          <span className="text-gray-400 text-sm block mb-2">{admin.email}</span>
          <button
            onClick={handleLogout}
            className="text-red-400 text-sm hover:underline"
          >
            Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 p-6 overflow-auto bg-gray-50">{children}</main>
    </div>
  );
}
