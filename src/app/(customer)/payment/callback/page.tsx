'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import toast from 'react-hot-toast';

function PaymentCallbackInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('orderId');
  const { token } = useAuth();
  const { clear } = useCart();
  const [status, setStatus] = useState<'loading' | 'success' | 'failed' | 'pending'>('loading');

  useEffect(() => {
    if (!orderId || !token) {
      setStatus('failed');
      return;
    }

    const checkStatus = async () => {
      try {
        const res = await fetch(`/api/payment/status?orderId=${encodeURIComponent(orderId)}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.state === 'COMPLETED' || data.paymentStatus === 'paid') {
          clear();
          setStatus('success');
          toast.success('Payment successful!');
        } else if (data.state === 'FAILED') {
          setStatus('failed');
          toast.error('Payment failed');
        } else {
          setStatus('pending');
        }
      } catch {
        setStatus('failed');
      }
    };

    checkStatus();
  }, [orderId, token, clear]);

  useEffect(() => {
    if (status === 'success') {
      const t = setTimeout(() => router.push(`/account/orders?success=${orderId}`), 2000);
      return () => clearTimeout(t);
    }
  }, [status, orderId, router]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="card p-8 max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            <div className="text-4xl mb-4">⏳</div>
            <h1 className="text-xl font-bold mb-2">Verifying payment...</h1>
            <p className="text-gray-500">Please wait</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="text-5xl mb-4">✓</div>
            <h1 className="text-xl font-bold text-green-600 mb-2">Payment Successful!</h1>
            <p className="text-gray-500 mb-4">Order ID: {orderId}</p>
            <p className="text-sm text-gray-400">Redirecting to orders...</p>
            <Link href={`/account/orders?success=${orderId}`} className="btn-primary mt-4 block">
              View Orders
            </Link>
          </>
        )}
        {status === 'failed' && (
          <>
            <div className="text-5xl mb-4">✗</div>
            <h1 className="text-xl font-bold text-red-600 mb-2">Payment Failed</h1>
            <p className="text-gray-500 mb-4">Your payment could not be completed.</p>
            <Link href="/checkout" className="btn-primary block">
              Try Again
            </Link>
          </>
        )}
        {status === 'pending' && (
          <>
            <div className="text-4xl mb-4">⏳</div>
            <h1 className="text-xl font-bold mb-2">Payment Pending</h1>
            <p className="text-gray-500 mb-4">Your payment is being processed.</p>
            <Link href={`/account/orders?success=${orderId}`} className="btn-primary block">
              View Orders
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-4xl">⏳</div></div>}>
      <PaymentCallbackInner />
    </Suspense>
  );
}
