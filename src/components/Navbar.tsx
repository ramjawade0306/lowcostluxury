'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';

export default function Navbar() {
  const path = usePathname();
  const router = useRouter();
  const { count } = useCart();
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const isAdmin = path.startsWith('/admin');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  if (isAdmin) return null;

  return (
    <nav className="sticky top-0 z-50 glass">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-3 font-bold text-2xl text-accent hover:scale-105 transition-transform active:scale-95">
          <div className="relative w-10 h-10 rounded-full overflow-hidden shadow-lg border-2 border-accent/20">
            <Image src="/logo_custom.jpg" alt="Logo" fill className="object-cover" />
          </div>
          <span className="hidden sm:inline-block">Low price luxury</span>
        </Link>
        <div className="flex-1 max-w-md mx-4 hidden md:block">
          <form onSubmit={handleSearch} className="relative group flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search luxury..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50 border-gray-100 focus:bg-white focus:ring-2 focus:ring-accent/20 pl-10 pr-4 py-2.5 rounded-xl text-sm transition-all outline-none border"
              />
              <svg className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 group-focus-within:text-accent transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="m21 21-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z" />
              </svg>
            </div>
            <button type="submit" className="px-4 bg-accent text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-accent-dark transition-colors shadow-sm shadow-accent/20">
              Go
            </button>
          </form>
        </div>

        <div className="flex items-center gap-6">
          <Link
            href="/about-shop"
            className={`text-sm font-bold uppercase tracking-widest transition-all hover:text-accent ${path === '/about-shop' ? 'text-accent' : 'text-gray-600'}`}
          >
            About Us
          </Link>
          <Link
            href="/admin"
            className={`text-sm font-bold uppercase tracking-widest transition-all hover:text-accent ${path.startsWith('/admin') ? 'text-accent' : 'text-gray-400'}`}
          >
            Admin
          </Link>
          <Link href="/cart" className="relative p-2 rounded-xl hover:bg-accent/5 transition-colors group">
            <svg className="w-6 h-6 text-gray-700 group-hover:text-accent transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {count > 0 && (
              <span className="absolute -top-1 -right-1 bg-accent text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center animate-shine shadow-lg shadow-accent/40">
                {count > 9 ? '9+' : count}
              </span>
            )}
          </Link>
          {user ? (
            <div className="relative group">
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-100 transition-all font-bold text-sm text-gray-800">
                <span className="truncate max-w-[100px]">{user.name}</span>
                <svg className="w-4 h-4 text-gray-400 group-hover:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="absolute right-0 mt-2 p-1 w-48 bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 opacity-0 scale-95 invisible group-hover:opacity-100 group-hover:visible group-hover:scale-100 transition-all duration-300 origin-top-right">
                <Link href="/admin" className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-accent hover:bg-accent/5 rounded-xl transition-colors">ADMIN PANEL</Link>
                <Link href="/account" className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-accent/5 hover:text-accent rounded-xl transition-colors">ACCOUNT</Link>
                <Link href="/account/orders" className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-accent/5 hover:text-accent rounded-xl transition-colors">ORDERS</Link>
                <button onClick={logout} className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm font-black text-hot hover:bg-hot/5 rounded-xl transition-colors">
                  LOGOUT
                </button>
              </div>
            </div>
          ) : (
            <Link href="/login" className="px-6 py-2.5 bg-accent text-white rounded-xl font-bold text-sm hover:bg-accent-dark transition-all hover:scale-105 active:scale-95 shadow-lg shadow-accent/20">
              LOGIN
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
