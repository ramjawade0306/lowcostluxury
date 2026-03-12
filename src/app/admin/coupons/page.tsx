'use client';

import { useEffect, useState } from 'react';
import { useAdminAuth } from '@/context/AdminAuthContext';
import toast from 'react-hot-toast';

type Coupon = { id: string; code: string; discount: number; minOrder: number; maxUses?: number; usedCount: number; isActive: boolean; expiresAt?: string };

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ code: '', discount: 0, minOrder: 0, maxUses: '', expiresAt: '' });
  const { token } = useAdminAuth();

  const load = () => {
    if (!token) {
      setLoading(false);
      return;
    }
    fetch('/api/admin/coupons', { headers: { Authorization: `Bearer ${token}` } })
      .then(async (r) => {
        const text = await r.text();
        if (!text) return [];
        try {
          return JSON.parse(text);
        } catch {
          return [];
        }
      })
      .then(setCoupons)
      .catch(() => setCoupons([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [token]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ...form,
          maxUses: form.maxUses ? +form.maxUses : undefined,
          expiresAt: form.expiresAt || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed');
      }
      load();
      setShowForm(false);
      setForm({ code: '', discount: 0, minOrder: 0, maxUses: '', expiresAt: '' });
      toast.success('Coupon created');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Coupons</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          + Add Coupon
        </button>
      </div>

      {showForm && (
        <form onSubmit={save} className="card p-6 mb-6 space-y-4">
          <input
            placeholder="Code (e.g. SAVE20)"
            value={form.code}
            onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
            className="input"
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <input
              type="number"
              placeholder="Discount (₹)"
              value={form.discount || ''}
              onChange={(e) => setForm((f) => ({ ...f, discount: +e.target.value }))}
              className="input"
              required
            />
            <input
              type="number"
              placeholder="Min order (₹)"
              value={form.minOrder || ''}
              onChange={(e) => setForm((f) => ({ ...f, minOrder: +e.target.value }))}
              className="input"
            />
          </div>
          <input
            type="number"
            placeholder="Max uses (optional)"
            value={form.maxUses}
            onChange={(e) => setForm((f) => ({ ...f, maxUses: e.target.value }))}
            className="input"
          />
          <input
            type="datetime-local"
            placeholder="Expires (optional)"
            value={form.expiresAt}
            onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))}
            className="input"
          />
          <div className="flex gap-2">
            <button type="submit" className="btn-primary">Create</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-outline">Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="animate-pulse h-48 bg-accent/5 rounded-xl" />
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead className="bg-accent/[0.02]">
              <tr className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                <th className="text-left p-4">Code</th>
                <th className="text-left p-4">Discount</th>
                <th className="text-left p-4">Min Order</th>
                <th className="text-left p-4">Used</th>
                <th className="text-left p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c.id} className="border-t">
                  <td className="p-4 font-mono font-medium">{c.code}</td>
                  <td className="p-4">₹{c.discount}</td>
                  <td className="p-4">₹{c.minOrder}</td>
                  <td className="p-4">{c.usedCount}{c.maxUses ? `/${c.maxUses}` : ''}</td>
                  <td className="p-4">{c.isActive ? <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Active</span> : <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Inactive</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
