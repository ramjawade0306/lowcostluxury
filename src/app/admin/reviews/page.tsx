'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useAdminAuth } from '@/context/AdminAuthContext';
import toast from 'react-hot-toast';
import MediaUpload from '@/components/MediaUpload';

type Review = { id: string; name: string; image: string; rating: number; comment?: string; isActive: boolean };

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', image: '', rating: 5, comment: '' });
  const { token } = useAdminAuth();

  const load = () => {
    if (!token) {
      setLoading(false);
      return;
    }
    fetch('/api/admin/reviews', { headers: { Authorization: `Bearer ${token}` } })
      .then(async (r) => {
        const text = await r.text();
        if (!text) return [];
        try {
          return JSON.parse(text);
        } catch {
          return [];
        }
      })
      .then(setReviews)
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [token]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed');
      }
      load();
      setShowForm(false);
      setForm({ name: '', image: '', rating: 5, comment: '' });
      toast.success('Review added');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Reviews / Proof</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          + Add Review
        </button>
      </div>

      {showForm && (
        <form onSubmit={save} className="card p-6 mb-6 space-y-4">
          <input
            placeholder="Customer Name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="input"
            required
          />
          <MediaUpload
            label="Customer Photo"
            value={form.image}
            onChange={(val) => setForm(f => ({ ...f, image: val }))}
            multiple={false}
            accept="image/*"
          />
          <input
            type="number"
            min={1}
            max={5}
            placeholder="Rating"
            value={form.rating}
            onChange={(e) => setForm((f) => ({ ...f, rating: +e.target.value }))}
            className="input"
          />
          <textarea
            placeholder="Comment (optional)"
            value={form.comment}
            onChange={(e) => setForm((f) => ({ ...f, comment: e.target.value }))}
            className="input"
            rows={2}
          />
          <div className="flex gap-2">
            <button type="submit" className="btn-primary">Add</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-outline">Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="animate-pulse h-48 bg-gray-200 rounded-xl" />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reviews.map((r) => (
            <div key={r.id} className="card p-6">
              <div className="flex items-center gap-4">
                <Image src={r.image} alt={r.name} width={48} height={48} className="rounded-full" />
                <div>
                  <div className="font-medium">{r.name}</div>
                  <div className="text-yellow-500">{'★'.repeat(r.rating)}</div>
                </div>
              </div>
              {r.comment && <p className="mt-2 text-gray-600 text-sm">{r.comment}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
