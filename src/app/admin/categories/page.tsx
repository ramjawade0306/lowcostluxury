'use client';

import { useEffect, useState } from 'react';
import { useAdminAuth } from '@/context/AdminAuthContext';
import toast from 'react-hot-toast';
import MediaUpload from '@/components/MediaUpload';
import Image from 'next/image';

type Category = { id: string; name: string; slug: string; image?: string; _count?: { products: number } };

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [image, setImage] = useState('');
  const { token } = useAdminAuth();

  const load = () => {
    if (!token) {
      setLoading(false);
      return;
    }
    fetch('/api/admin/categories', { headers: { Authorization: `Bearer ${token}` } })
      .then(async (r) => {
        const text = await r.text();
        if (!text) return [];
        try {
          return JSON.parse(text);
        } catch {
          return [];
        }
      })
      .then(setCategories)
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [token]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editing ? `/api/admin/categories/${editing.id}` : '/api/admin/categories';
      const res = await fetch(url, {
        method: editing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name, image }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed');
      }
      load();
      setShowForm(false);
      setEditing(null);
      setName('');
      setImage('');
      toast.success(editing ? 'Updated' : 'Created');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed');
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this category?')) return;
    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      load();
      toast.success('Deleted');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Categories</h1>
        <button onClick={() => { setEditing(null); setName(''); setImage(''); setShowForm(true); }} className="btn-primary">
          + Add Category
        </button>
      </div>

      {showForm && (
        <form onSubmit={save} className="card p-6 mb-6 space-y-4">
          <h3 className="font-bold">{editing ? 'Edit' : 'New'} Category</h3>
          <div className="flex gap-4">
            <input
              placeholder="Category name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input flex-1"
              required
            />
          </div>
          <MediaUpload
            label="Category Image"
            value={image}
            onChange={setImage}
            multiple={false}
            accept="image/*"
          />
          <div className="flex gap-2">
            <button type="submit" className="btn-primary">Save</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-outline">Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="animate-pulse h-48 bg-gray-200 rounded-xl" />
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-4">Name</th>
                <th className="text-left p-4">Slug</th>
                <th className="text-left p-4">Products</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id} className="border-t">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded overflow-hidden bg-gray-100 border border-gray-200">
                        <Image src={c.image || '/placeholder.svg'} alt="" fill className="object-cover" />
                      </div>
                      <span className="font-medium text-gray-900">{c.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-gray-500">{c.slug}</td>
                  <td className="p-4">{c._count?.products ?? 0}</td>
                  <td className="p-4">
                    <button onClick={() => { setEditing(c); setName(c.name); setImage(c.image || ''); setShowForm(true); }} className="text-accent text-sm mr-2">Edit</button>
                    <button onClick={() => remove(c.id)} className="text-red-500 text-sm">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
