'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const path = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (user === null && typeof window !== 'undefined') {
      router.push('/login');
    }
  }, [user, router]);

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">My Account</h1>
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-48 flex-shrink-0">
          <nav className="space-y-1">
            <Link
              href="/account"
              className={`block px-4 py-2 rounded-lg ${path === '/account' ? 'bg-accent/10 text-accent font-medium' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              Profile
            </Link>
            <Link
              href="/account/orders"
              className={`block px-4 py-2 rounded-lg ${path === '/account/orders' ? 'bg-accent/10 text-accent font-medium' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              Orders
            </Link>
            <Link
              href="/account/addresses"
              className={`block px-4 py-2 rounded-lg ${path === '/account/addresses' ? 'bg-accent/10 text-accent font-medium' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              Addresses
            </Link>
          </nav>
        </aside>
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
