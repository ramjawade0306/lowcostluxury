'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { formatPrice } from '@/lib/utils';

export default function AdminDashboard() {
  const [data, setData] = useState<{
    totalSales: number;
    ordersToday: number;
    pendingOrders: number;
    replacementRequests: number;
    productsCount: number;
    lowStock: number;
    recentOrders: { orderId: string; total: number; user: { name: string }; status: string }[];
  } | null>(null);
  const { token } = useAdminAuth();

  useEffect(() => {
    if (!token) return;
    fetch('/api/admin/dashboard', { headers: { Authorization: `Bearer ${token}` } })
      .then(async (r) => {
        const text = await r.text();
        if (!text) return null;
        try {
          return JSON.parse(text);
        } catch {
          return null;
        }
      })
      .then(setData)
      .catch(() => setData(null));
  }, [token]);

  if (!data) return <div className="animate-pulse h-64 bg-gray-200 rounded-xl" />;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="card p-6">
          <div className="text-gray-500 text-sm">Total Sales</div>
          <div className="text-2xl font-bold text-accent">{formatPrice(data.totalSales)}</div>
        </div>
        <div className="card p-6">
          <div className="text-gray-500 text-sm">Orders Today</div>
          <div className="text-2xl font-bold">{data.ordersToday}</div>
        </div>
        <div className="card p-6">
          <div className="text-gray-500 text-sm">Products</div>
          <div className="text-2xl font-bold">{data.productsCount}</div>
        </div>
        <div className="card p-6">
          <div className="text-gray-500 text-sm">Low Stock Alert</div>
          <div className={`text-2xl font-bold ${data.lowStock > 0 ? 'text-red-600' : ''}`}>{data.lowStock}</div>
        </div>
        <div className="card p-6 bg-blue-50/50">
          <div className="text-gray-500 text-sm">Pending Orders</div>
          <div className="text-2xl font-bold text-blue-700">{data.pendingOrders}</div>
        </div>
        <div className="card p-6 bg-yellow-50/50">
          <div className="text-gray-500 text-sm">Replacements</div>
          <div className="text-2xl font-bold text-yellow-700">{data.replacementRequests}</div>
        </div>
      </div>
      <div className="card overflow-hidden">
        <div className="p-4 border-b font-bold">Recent Orders</div>
        <div className="divide-y">
          {data.recentOrders.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No orders yet</div>
          ) : (
            data.recentOrders.map((o) => (
              <Link
                key={o.orderId}
                href={`/admin/orders?id=${o.orderId}`}
                className="flex items-center justify-between p-4 hover:bg-gray-50"
              >
                <span className="font-mono">{o.orderId}</span>
                <span>{o.user?.name}</span>
                <span>{formatPrice(o.total)}</span>
                <span className="text-sm text-gray-500">{o.status}</span>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
