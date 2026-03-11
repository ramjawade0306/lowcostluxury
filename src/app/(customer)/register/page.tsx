'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOTP] = useState('');
  const [verifying, setVerifying] = useState(false);

  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, email: email || undefined, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Registration failed');

      setShowOTP(true);
      toast.success('OTP sent to your phone number!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifying(true);
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code: otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Verification failed');

      login(data.user, data.token);
      toast.success('Account verified and logged in!');
      router.push('/');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    try {
      const res = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to resend OTP');
      toast.success('OTP resent!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Resend failed');
    }
  };

  if (showOTP) {
    return (
      <div className="max-w-md mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold text-center mb-2">Verify Phone</h1>
        <p className="text-center text-gray-600 mb-6">
          Enter the 6-digit code sent to<br />
          <span className="font-semibold text-gray-900">{phone}</span>
        </p>
        <form onSubmit={handleVerify} className="card p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">OTP Code</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOTP(e.target.value)}
              className="input text-center text-2xl tracking-[0.5em] font-mono"
              maxLength={6}
              placeholder="000000"
              required
            />
          </div>
          <button type="submit" disabled={verifying} className="btn-primary w-full">
            {verifying ? 'Verifying...' : 'Verify & Sign Up'}
          </button>
          <div className="flex flex-col gap-2 pt-2">
            <button
              type="button"
              onClick={handleResend}
              className="text-sm text-accent hover:underline"
            >
              Resend OTP
            </button>
            <button
              type="button"
              onClick={() => setShowOTP(false)}
              className="text-sm text-gray-500 hover:underline"
            >
              Change phone number
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-center mb-6">Create Account</h1>
      <form onSubmit={handleSubmit} className="card p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input"
            placeholder="Ram"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email (Optional)</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
            placeholder="ram@gmail.com (optional)"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="input"
            placeholder="e.g. 9999999999"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
            required
            minLength={6}
          />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Sending OTP...' : 'Continue'}
        </button>
      </form>
      <p className="text-center text-sm text-gray-600 mt-4">
        Already have an account?{' '}
        <Link href="/login" className="text-accent font-medium hover:underline">
          Login
        </Link>
      </p>
    </div>
  );
}
