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

  if (loading) return <div className="animate-pulse h-64 bg-gray-200 rounded-xl" />;

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
            <span className="text-sm font-normal bg-gray-200 text-gray-700 px-3 py-1 rounded-full capitalize">
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
          <div key={order.id} className={`card overflow-hidden ${focusId === order.orderId ? 'ring-2 ring-accent' : ''}`}>
            <div className="p-4 bg-gray-50 flex flex-wrap items-center justify-between gap-2">
              <span className="font-mono font-bold">{order.orderId}</span>
              <span>{order.user?.name} · {order.user?.email}</span>
              <span>{order.phone}</span>
              <span className="font-bold">{formatPrice(order.total)}</span>
              <select
                value={order.status}
                onChange={(e) => handleStatusChange(order.id, e.target.value)}
                disabled={updating === order.id}
                className="text-sm border rounded px-2 py-1"
              >
                <option value="placed">Placed</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <span className="text-sm text-gray-500">Payment: {order.paymentStatus}</span>
            </div>
            <div className="p-4 text-sm text-gray-600">{order.address}</div>
            <div className="divide-y">
              {order.items.map((item, i) => (
                <div key={i} className="p-4 flex gap-4">
                  <div className="relative w-12 h-12 rounded overflow-hidden bg-gray-100 flex-shrink-0">
                    <Image src={item.product?.images?.split(',')[0]?.trim() || '/placeholder.svg'} alt="" fill className="object-cover" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{item.product?.name}</div>
                    <div className="text-gray-500">Qty: {item.quantity} × {formatPrice(item.price)}</div>
                    {item.replacementStatus && (
                      <div className="mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-bold uppercase ${item.replacementStatus === 'requested' ? 'bg-yellow-100 text-yellow-700' :
                          item.replacementStatus === 'approved' ? 'bg-blue-100 text-blue-700' :
                            item.replacementStatus === 'replaced' ? 'bg-green-100 text-green-700' :
                              'bg-red-100 text-red-700'
                          }`}>
                          Replacement: {item.replacementStatus}
                        </span>
                        {item.replacementReason && <div className="text-xs text-gray-400 mt-1 italic">Reason: {item.replacementReason}</div>}

                        {item.replacementStatus === 'requested' && (
                          <div className="flex gap-2 mt-2">
                            <button onClick={() => updateReplacementStatus(item.id, 'approved')} className="text-xs bg-accent text-white px-2 py-1 rounded">Approve</button>
                            <button onClick={() => updateReplacementStatus(item.id, 'rejected')} className="text-xs bg-gray-200 px-2 py-1 rounded">Reject</button>
                          </div>
                        )}
                        {item.replacementStatus === 'approved' && (
                          <div className="mt-2 text-xs">
                            <button onClick={() => updateReplacementStatus(item.id, 'replaced')} className="bg-green-600 text-white px-2 py-1 rounded">Mark as Replaced</button>
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
                className="px-4 py-2 bg-accent text-white rounded hover:bg-orange-600 font-medium"
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
