'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAdminAuth } from '@/context/AdminAuthContext';
import toast from 'react-hot-toast';
import PasswordInput from '@/components/PasswordInput';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAdminAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      login(data.admin, data.token);
      toast.success('Welcome!');
      router.push('/admin');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-white text-center mb-6">Admin Login</h1>
        <form onSubmit={handleSubmit} className="bg-gray-800 rounded-xl p-6 space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg bg-gray-700 border border-gray-600 text-white px-4 py-2 focus:ring-2 focus:ring-accent"
              required
            />
          </div>
          <PasswordInput
            label="Password"
            labelClassName="block text-sm text-gray-300 mb-1"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg bg-gray-700 border border-gray-600 text-white px-4 py-2 focus:ring-2 focus:ring-accent pr-10"
            required
          />
          <div className="flex justify-end">
            <Link href="/admin/forgot-password Join" className="text-sm text-accent hover:underline">
              Forgot password?
            </Link>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p className="text-center text-gray-400 text-sm mt-4">
          <Link href="/" className="hover:text-white">← Back to Store</Link>
        </p>
      </div>
    </div>
  );
}
