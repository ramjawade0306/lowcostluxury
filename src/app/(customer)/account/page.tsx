'use client';

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function AccountPage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="max-w-md mx-auto">
      <div className="card p-8 bg-white/70 backdrop-blur-xl border-white/20 shadow-2xl shadow-accent/5">
        <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center text-accent mb-6">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-6 tracking-tighter uppercase">My Profile</h2>
        <div className="space-y-6">
          <div className="group">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block mb-1">Full Name</span>
            <span className="text-lg font-bold text-gray-800 group-hover:text-accent transition-colors">{user.name}</span>
          </div>
          <div className="group">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block mb-1">Email Address</span>
            <span className="text-lg font-bold text-gray-800 group-hover:text-accent transition-colors">{user.email}</span>
          </div>
          {user.phone && (
            <div className="group">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block mb-1">Phone Number</span>
              <span className="text-lg font-bold text-gray-800 group-hover:text-accent transition-colors">{user.phone}</span>
            </div>
          )}
        </div>
        <div className="mt-10 pt-6 border-t border-gray-50">
           <Link href="/account/orders" className="text-sm font-black text-accent hover:underline tracking-widest uppercase">View Order History →</Link>
        </div>
      </div>
    </div>
  );
}
