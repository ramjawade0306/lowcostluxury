'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { formatPrice } from '@/lib/utils';
import toast from 'react-hot-toast';
import { fetchJson } from '@/lib/fetchJson';

type OrderItem = {
  id: string;
  product: { name: string; images: string; isReturnable: boolean };
  quantity: number;
  price: number;
  returnStatus?: string;
  returnReason?: string;
  replacementStatus?: string;
  replacementReason?: string;
};
type Order = {
  id: string;
  orderId: string;
  status: string;
  paymentStatus: string;
  total: number;
  trackingId?: string;
  shippedAt?: string;
  deliveredAt?: string;
  createdAt: string;
  items: OrderItem[];
};

function OrdersInner() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();
  const searchParams = useSearchParams();
  const success = searchParams.get('success');


  const [replacementItemId, setReplacementItemId] = useState<string | null>(null);
  const [replacementReason, setReplacementReason] = useState('Damaged Product');
  const [submittingReplacement, setSubmittingReplacement] = useState(false);

  useEffect(() => {
    if (success) toast.success(`Order ${success} placed successfully!`);
  }, [success]);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    setError(null);
    setLoading(true);
    fetchJson<Order[]>('/api/user/orders', { headers: { Authorization: `Bearer ${token}` } })
      .then((data) => {
        if (Array.isArray(data)) {
          setOrders(data);
        } else {
          setOrders([]);
          setError('Failed to load orders');
        }
      })
      .catch((err) => {
        setError(err.message || 'Failed to load orders');
        setOrders([]);
      })
      .finally(() => setLoading(false));
  }, [token]);


  const handleReplacementRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !replacementItemId) return;

    setSubmittingReplacement(true);
    try {
      const res = await fetch(`/api/orders/replacement/${replacementItemId}?reason=${encodeURIComponent(replacementReason)}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to submit replacement request');

      toast.success('Replacement request submitted successfully');
      setReplacementItemId(null);
      // Refresh orders
      fetchJson<Order[]>('/api/user/orders', { headers: { Authorization: `Bearer ${token}` } })
        .then(data => Array.isArray(data) && setOrders(data));
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmittingReplacement(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((n) => (
          <div key={n} className="animate-pulse h-32 bg-gray-100 rounded-xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-12 text-center text-red-500">
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="btn-outline mt-4">Retry</button>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="card p-12 text-center border-dashed border-2">
        <p className="text-gray-500 mb-6">Please login to view your orders.</p>
        <Link href="/login" className="btn-primary">Login</Link>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="card p-12 text-center border-dashed border-2">
        <p className="text-gray-500 mb-6">No orders yet. Discover our latest collections!</p>
        <Link href="/shop" className="btn-primary">
          Start Shopping
        </Link>
      </div>
    );
  }

  const statusColor: Record<string, string> = {
    placed: 'bg-amber-100 text-amber-800',
    shipped: 'bg-blue-100 text-blue-800',
    delivered: 'bg-emerald-100 text-emerald-800',
    cancelled: 'bg-hot/10 text-hot',
    cod_pending: 'bg-accent/10 text-accent-dark',
  };

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div key={order.id} className="card overflow-hidden shadow-sm hover:shadow-xl hover:shadow-accent/5 transition-all duration-300">
          <div className="p-4 border-b flex flex-wrap items-center justify-between gap-2 bg-accent/[0.02]">
            <div className="flex items-center gap-3">
              <span className="font-mono font-bold text-gray-900">{order.orderId}</span>
              <span className="text-[10px] uppercase font-black tracking-widest px-2.5 py-1 rounded-full shadow-sm shadow-black/5 ${statusColor[order.status] || 'bg-gray-100'}">
                {order.status}
              </span>
            </div>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              {new Date(order.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
            </span>
          </div>

          <div className="px-4 py-2 bg-white flex flex-col gap-1 border-b">
            <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em]">
              <div className={`w-2 h-2 rounded-full ${order.status === 'placed' ? 'bg-amber-400 shadow-lg shadow-amber-400/50' : 'bg-gray-200'}`}></div>
              <span className={order.status === 'placed' ? 'text-gray-900 font-black' : 'text-gray-400 font-bold'}>Ordered</span>
              <div className="flex-1 border-t border-gray-100"></div>
              <div className={`w-2 h-2 rounded-full ${order.status === 'shipped' ? 'bg-blue-400 shadow-lg shadow-blue-400/50' : 'bg-gray-200'}`}></div>
              <span className={order.status === 'shipped' ? 'text-gray-900 font-black' : 'text-gray-400 font-bold'}>Shipped</span>
              <div className="flex-1 border-t border-gray-100"></div>
              <div className={`w-2 h-2 rounded-full ${order.status === 'delivered' ? 'bg-emerald-400 shadow-lg shadow-emerald-400/50' : 'bg-gray-200'}`}></div>
              <span className={order.status === 'delivered' ? 'text-gray-900 font-black' : 'text-gray-400 font-bold'}>Delivered</span>
            </div>
            {(order.shippedAt || order.deliveredAt || order.trackingId) && (
              <div className="flex justify-between flex-wrap gap-y-1 text-[9px] text-gray-400 font-medium mt-1">
                <div>Ordered: {new Date(order.createdAt).toLocaleDateString()}</div>
                {order.shippedAt && <div>Shipped: {new Date(order.shippedAt).toLocaleDateString()}</div>}
                {order.deliveredAt && <div>Delivered: {new Date(order.deliveredAt).toLocaleDateString()}</div>}
                {order.trackingId && <div className="w-full text-blue-500 mt-1">Tracking ID: <span className="font-mono text-gray-700 select-all">{order.trackingId}</span></div>}
              </div>
            )}
          </div>
          <div className="divide-y divide-gray-50 bg-white">
            {order.items.map((item, i) => (
              <div key={i} className="p-4 flex gap-4 hover:bg-gray-50/50 transition-colors">
                <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-accent/5 flex-shrink-0 border border-gray-100">
                  <Image
                    src={item.product?.images?.split(',')[0]?.trim() || '/placeholder.svg'}
                    alt={item.product?.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 text-sm truncate">{item.product?.name}</div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    Qty: {item.quantity} × {formatPrice(item.price)}
                  </div>
                  {item.returnStatus && (
                    <div className="mt-1 text-[10px] font-bold uppercase tracking-wider">
                      <span className={
                        item.returnStatus === 'requested' ? 'text-yellow-600' :
                          item.returnStatus === 'approved' ? 'text-blue-600' :
                            item.returnStatus === 'refunded' ? 'text-green-600' :
                              'text-red-600'
                      }>
                        Return: {item.returnStatus}
                      </span>
                    </div>
                  )}
                  {item.replacementStatus && (
                    <div className="mt-1 text-[10px] font-bold uppercase tracking-wider">
                      <span className={
                        item.replacementStatus === 'requested' ? 'text-yellow-600' :
                          item.replacementStatus === 'approved' ? 'text-blue-600' :
                            item.replacementStatus === 'replaced' ? 'text-green-600' :
                              'text-red-600'
                      }>
                        Replacement: {item.replacementStatus}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="font-bold text-gray-900 text-sm">{formatPrice(item.price * item.quantity)}</div>
                  {order.status === 'delivered' && !item.returnStatus && !item.replacementStatus && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setReplacementItemId(item.id); setReplacementReason('Damaged Product'); }}
                        className="text-[10px] text-blue-600 font-bold uppercase border border-blue-600 px-2 py-0.5 rounded hover:bg-blue-600 hover:text-white transition-colors"
                      >
                        Replace
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 bg-accent/[0.02] flex justify-between items-center border-t border-gray-100">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Payment Status</span>
              <span className="text-sm font-black text-gray-700 capitalize">{order.paymentStatus}</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Amount</span>
              <span className="text-xl font-black text-accent">{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>
      ))}


      {/* Replacement Request Modal */}
      {replacementItemId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-bold mb-4">Request Replacement</h3>
            <form onSubmit={handleReplacementRequest} className="space-y-4">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Reason for Replacement</label>
                <select
                  value={replacementReason}
                  onChange={(e) => setReplacementReason(e.target.value)}
                  className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-accent outline-none"
                  required
                >
                  <option value="Damaged Product">Damaged Product</option>
                  <option value="Defective Item">Defective Item</option>
                  <option value="Quality Issue">Quality Issue</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setReplacementItemId(null)}
                  className="flex-1 btn-outline py-2 rounded-lg text-sm"
                  disabled={submittingReplacement}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-primary py-2.5 rounded-xl text-xs font-black tracking-widest uppercase shadow-lg shadow-blue-500/30 bg-blue-600 hover:bg-blue-700 border-none"
                  disabled={submittingReplacement}
                >
                  {submittingReplacement ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-accent border-t-transparent rounded-full" /></div>}>
      <OrdersInner />
    </Suspense>
  );
}
