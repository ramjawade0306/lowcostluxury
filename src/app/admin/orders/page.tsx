'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { formatPrice } from '@/lib/utils';
import toast from 'react-hot-toast';

type Order = {
  id: string;
  orderId: string;
  status: string;
  paymentStatus: string;
  total: number;
  address: string;
  phone: string;
  createdAt: string;
  user: { name: string; email: string };
  items: { 
    id: string; 
    product: { name: string; images: string }; 
    quantity: number; 
    price: number; 
    replacementStatus?: string; 
    replacementReason?: string 
  }[];
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [trackingModal, setTrackingModal] = useState<{ orderId: string, open: boolean }>({ orderId: '', open: false });
  const [trackingInput, setTrackingInput] = useState('');
  const searchParams = useSearchParams();
  const focusId = searchParams.get('id');
  const { token } = useAdminAuth();

  const load = () => {
    if (!token) {
      setLoading(false);
      return;
    }
    const params = new URLSearchParams();
    const search = searchParams.get('search');
    if (search) params.set('search', search);

    fetch(`/api/admin/orders?${params}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async (r) => {
        const text = await r.text();
        if (!text) return [];
        try {
          return JSON.parse(text);
        } catch {
          return [];
        }
      })
      .then(setOrders)
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [token, searchParams]);

  const updateStatus = async (id: string, newStatus: string, trackingId: string | null = null) => {
    // Optimistically update the UI
    setOrders(current =>
      current.map(o => o.id === id ? { ...o, status: newStatus } : o)
    );

    setUpdating(id);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus, trackingId }),
      });
      if (!res.ok) throw new Error();
      toast.success('Updated');
    } catch {
      toast.error('Failed');
      load(); // Revert on failure
    } finally {
      setUpdating(null);
    }
  };

  const handleStatusChange = (id: string, newStatus: string) => {
    if (newStatus === 'shipped') {
      setTrackingModal({ orderId: id, open: true });
      setTrackingInput('');
    } else {
      updateStatus(id, newStatus);
    }
  };

  const submitTrackingUpdate = () => {
    updateStatus(trackingModal.orderId, 'shipped', trackingInput.trim() || null);
    setTrackingModal({ orderId: '', open: false });
  };

  const updateReplacementStatus = async (itemId: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/order-items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ replacementStatus: status }),
      });
      if (!res.ok) throw new Error();
      load();
      toast.success('Replacement status updated');
    } catch {
      toast.error('Failed to update replacement status');
    }
  };

  if (loading) return <div className="animate-pulse h-64 bg-accent/5 rounded-xl" />;

  const filter = searchParams.get('filter');

  let filteredOrders = orders;
  if (filter === 'today') {
    // strict calendar day to avoid timezone disconnects
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // Check if o.createdAt ends with Z. If not, append Z so Javascript parses it as UTC since SQLAlchemy stores naive UTC.
    filteredOrders = orders.filter(o => {
      const dateStr = o.createdAt.endsWith('Z') ? o.createdAt : `${o.createdAt}Z`;
      const orderDate = new Date(dateStr);
      return orderDate >= startOfDay && orderDate <= endOfDay;
    });
  } else if (filter === 'pending') {
    filteredOrders = orders.filter(o => o.status === 'placed');
  } else if (filter === 'replacements') {
    filteredOrders = orders.filter(o => o.items.some(i => i.replacementStatus === 'requested'));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-3">
          Orders
          {filter && (
            <span className="text-[10px] font-black tracking-widest bg-accent/10 text-accent px-3 py-1 rounded-full uppercase">
              Filter: {filter.replace('-', ' ')}
            </span>
          )}
        </h1>
        {filter && (
          <button
            onClick={() => window.location.href = '/admin/orders'}
            className="text-sm text-accent hover:underline"
          >
            Clear Filter
          </button>
        )}
      </div>

      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="text-gray-500 text-center py-12">No orders match this filter.</div>
        ) : filteredOrders.map((order) => (
          <div key={order.id} className={`card overflow-hidden transition-all duration-300 ${focusId === order.orderId ? 'ring-2 ring-accent shadow-xl shadow-accent/10' : 'hover:shadow-md'}`}>
            <div className="p-4 bg-accent/[0.02] border-b flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="font-mono font-bold text-gray-900">{order.orderId}</span>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  {new Date(order.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-gray-600 font-medium">{order.user?.name} · {order.user?.email}</span>
                <span className="text-gray-500 font-mono">{order.phone}</span>
                <span className="font-black text-accent text-lg">{formatPrice(order.total)}</span>
              </div>
              <select
                value={order.status}
                onChange={(e) => handleStatusChange(order.id, e.target.value)}
                disabled={updating === order.id}
                className="text-xs font-black uppercase tracking-widest bg-white border border-gray-100 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-accent outline-none cursor-pointer"
              >
                <option value="placed">Placed</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Payment</span>
                <span className={`text-[10px] font-black uppercase tracking-widest ${order.paymentStatus === 'paid' ? 'text-emerald-500' : 'text-amber-500'}`}>
                  {order.paymentStatus}
                </span>
              </div>
            </div>
            <div className="px-4 py-2 text-[11px] font-medium text-gray-500 bg-white border-b uppercase tracking-wider">
              {order.address}
            </div>
            <div className="divide-y">
              {order.items.map((item, i) => (
                <div key={i} className="p-4 flex gap-4 hover:bg-gray-50/50 transition-colors">
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-accent/5 flex-shrink-0 border border-gray-100">
                    <Image src={item.product?.images?.split(',')[0]?.trim() || '/placeholder.svg'} alt="" fill className="object-cover" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{item.product?.name}</div>
                    <div className="text-gray-500">Qty: {item.quantity} × {formatPrice(item.price)}</div>
                    {item.replacementStatus && (
                      <div className="mt-1">
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest ${item.replacementStatus === 'requested' ? 'bg-amber-100 text-amber-700' :
                          item.replacementStatus === 'approved' ? 'bg-sky-100 text-sky-700' :
                            item.replacementStatus === 'replaced' ? 'bg-emerald-100 text-emerald-700' :
                              'bg-hot/10 text-hot'
                          }`}>
                          Replacement: {item.replacementStatus}
                        </span>
                        {item.replacementReason && <div className="text-xs text-gray-400 mt-1 italic">Reason: {item.replacementReason}</div>}

                        {item.replacementStatus === 'requested' && (
                          <div className="flex gap-2 mt-2">
                            <button onClick={() => updateReplacementStatus(item.id, 'approved')} className="text-[10px] font-black uppercase tracking-widest bg-accent text-white px-3 py-1 rounded-lg shadow-sm shadow-accent/20">Approve</button>
                            <button onClick={() => updateReplacementStatus(item.id, 'rejected')} className="text-[10px] font-black uppercase tracking-widest bg-gray-100 text-gray-500 px-3 py-1 rounded-lg">Reject</button>
                          </div>
                        )}
                        {item.replacementStatus === 'approved' && (
                          <div className="mt-2 text-xs">
                            <button onClick={() => updateReplacementStatus(item.id, 'replaced')} className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm shadow-emerald-500/20">Mark as Replaced</button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div>{formatPrice(item.price * item.quantity)}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {trackingModal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-sm shadow-xl">
            <h3 className="font-bold text-lg mb-4">Enter Tracking ID</h3>
            <p className="text-sm text-gray-500 mb-4">Provide the delivery partner tracking ID. You can leave this blank if not applicable.</p>
            <input
              type="text"
              placeholder="e.g. AWB123456789"
              value={trackingInput}
              onChange={(e) => setTrackingInput(e.target.value)}
              className="w-full border p-2 rounded mb-6 focus:ring-2 focus:ring-accent outline-none"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setTrackingModal({ orderId: '', open: false })}
                className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={submitTrackingUpdate}
                className="px-6 py-2.5 bg-accent text-white rounded-xl hover:bg-accent-dark font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-accent/20"
              >
                Confirm Shipment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
