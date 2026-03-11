'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import PasswordInput from '@/components/PasswordInput';

export default function AdminForgotPasswordPage() {
    const [step, setStep] = useState(1); // 1: Phone, 2: OTP & New Password
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.detail || 'Failed to send OTP');
            toast.success(data.message);
            setStep(2);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, otp, newPassword }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.detail || 'Reset failed');
            toast.success('Password reset successfully! Please login.');
            router.push('/admin/login');
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Reset failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
            <div className="w-full max-w-md">
                <h1 className="text-2xl font-bold text-white text-center mb-6">Admin Password Reset</h1>

                <div className="bg-gray-800 rounded-xl p-6 shadow-2xl">
                    {step === 1 ? (
                        <form onSubmit={handleSendOTP} className="space-y-4">
                            <p className="text-gray-400 text-sm mb-4 text-center">
                                Enter your registered phone number to receive an OTP.
                            </p>
                            <div>
                                <label className="block text-sm text-gray-300 mb-1">Phone Number</label>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full rounded-lg bg-gray-700 border border-gray-600 text-white px-4 py-2 focus:ring-2 focus:ring-accent"
                                    placeholder="e.g. 9876543210"
                                    required
                                />
                            </div>
                            <button type="submit" disabled={loading} className="w-full btn-primary py-3">
                                {loading ? 'Sending OTP...' : 'Send OTP'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleResetPassword} className="space-y-4">
                            <p className="text-gray-400 text-sm mb-4 text-center">
                                Enter OTP for <b>{phone}</b> and your new password.
                            </p>
                            <div>
                                <label className="block text-sm text-gray-300 mb-1">OTP</label>
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    className="w-full rounded-lg bg-gray-700 border border-gray-600 text-white px-4 py-2 focus:ring-2 focus:ring-accent"
                                    placeholder="6-digit OTP"
                                    required
                                />
                            </div>
                            <PasswordInput
                                label="New Password"
                                labelClassName="block text-sm text-gray-300 mb-1"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full rounded-lg bg-gray-700 border border-gray-600 text-white px-4 py-2 focus:ring-2 focus:ring-accent pr-10"
                                required
                            />
                            <button type="submit" disabled={loading} className="w-full btn-primary py-3">
                                {loading ? 'Resetting...' : 'Reset Password'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="text-sm text-gray-500 w-full hover:underline"
                            >
                                Change phone number
                            </button>
                        </form>
                    )}
                </div>

                <p className="text-center text-gray-400 text-sm mt-4">
                    <Link href="/admin/login" className="hover:text-white">← Back to Admin Login</Link>
                </p>
            </div>
        </div>
    );
}
