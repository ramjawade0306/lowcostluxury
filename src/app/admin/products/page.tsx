'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { formatPrice, getMediaUrl } from '@/lib/utils';
import toast from 'react-hot-toast';
import MediaUpload from '@/components/MediaUpload';

type Product = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  discount: number;
  stock: number;
  isHotDeal: boolean;
  isSoldOut: boolean;
  category: { id: string; name: string };
  images: string;
  isReturnable: boolean;
};

type Category = { id: string; name: string };

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: 0,
    discount: 0,
    stock: 0,
    categoryId: '',
    images: '',
    isHotDeal: false,
    isSoldOut: false,
    isReturnable: false,
  });
  const searchParams = useSearchParams();
  const filter = searchParams.get('filter');
  const categoryFilter = searchParams.get('category');
  const { token } = useAdminAuth();

  const parseJson = async (r: Response, fallback: unknown) => {
    const text = await r.text();
    if (!text) return fallback;
    try {
      return JSON.parse(text);
    } catch {
      return fallback;
    }
  };

  const load = () => {
    if (!token) {
      setLoading(false);
      return;
    }
    const params = new URLSearchParams();
    const search = searchParams.get('search');
    if (search) params.set('search', search);

    Promise.all([
      fetch(`/api/admin/products?${params}`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => parseJson(r, [])),
      fetch('/api/admin/categories', { headers: { Authorization: `Bearer ${token}` } }).then((r) => parseJson(r, [])),
    ]).then(([prods, cats]) => {
      setProducts(prods);
      setCategories(cats);
    }).catch(() => { }).finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [token, searchParams]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editing ? `/api/admin/products/${editing.id}` : '/api/admin/products';
      const res = await fetch(url, {
        method: editing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      load();
      setShowForm(false);
      setEditing(null);
      setForm({ name: '', description: '', price: 0, discount: 0, stock: 0, categoryId: '', images: '', isHotDeal: false, isSoldOut: false, isReturnable: false });
      toast.success(editing ? 'Updated' : 'Created');
    } catch {
      toast.error('Failed');
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      load();
      toast.success('Deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  let filteredProducts = filter === 'low-stock'
    ? products.filter(p => p.stock < 10 && !p.isSoldOut)
    : products;

  if (categoryFilter) {
    filteredProducts = filteredProducts.filter(p => p.category?.id === categoryFilter);
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-3">
          Products
          {filter && (
            <span className="text-[10px] font-black tracking-widest bg-accent/10 text-accent px-3 py-1 rounded-full uppercase">
              Filter: {filter.replace('-', ' ')}
            </span>
          )}
        </h1>
        <div className="flex items-center gap-4">
          {(filter || categoryFilter) && (
            <button
              onClick={() => window.location.href = '/admin/products'}
              className="text-sm text-accent hover:underline"
            >
              Clear {categoryFilter ? 'Category' : 'Filter'}
            </button>
          )}
          <button onClick={() => { setEditing(null); setShowForm(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="btn-primary">
            + Add Product
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={save} className="card p-6 mb-6 space-y-4">
          <h3 className="font-bold">{editing ? 'Edit' : 'New'} Product</h3>
          <input
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="input"
            required
          />
          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            className="input"
            rows={3}
          />
          <div className="grid grid-cols-3 gap-4">
            <input
              type="number"
              placeholder="Price"
              value={form.price || ''}
              onChange={(e) => setForm((f) => ({ ...f, price: +e.target.value }))}
              className="input"
              required
            />
            <input
              type="number"
              placeholder="Discount %"
              min="0"
              max="100"
              value={form.discount || ''}
              onChange={(e) => {
                let val = Number(e.target.value);
                if (val > 100) val = 100;
                if (val < 0) val = 0;
                setForm((f) => ({ ...f, discount: val }));
              }}
              className="input"
            />
            <input
              type="number"
              placeholder="Stock"
              value={form.stock || ''}
              onChange={(e) => setForm((f) => ({ ...f, stock: +e.target.value }))}
              className="input"
            />
          </div>
          <select
            value={form.categoryId}
            onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
            className="input"
            required
          >
            <option value="">Category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <MediaUpload
            label="Product Images"
            value={form.images}
            onChange={(val) => setForm(f => ({ ...f, images: val }))}
            multiple={true}
            accept="image/*,video/*"
          />
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.isHotDeal} onChange={(e) => setForm((f) => ({ ...f, isHotDeal: e.target.checked }))} />
            Hot Deal
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.isSoldOut} onChange={(e) => setForm((f) => ({ ...f, isSoldOut: e.target.checked }))} />
            Sold Out
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.isReturnable} onChange={(e) => setForm((f) => ({ ...f, isReturnable: e.target.checked }))} />
            Returnable
          </label>
          <div className="flex gap-2">
            <button type="submit" className="btn-primary">Save</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-outline">Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="animate-pulse h-48 bg-accent/5 rounded-xl" />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-accent/[0.02]">
                <tr className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                  <th className="text-left p-4">Product</th>
                  <th className="text-left p-4">Price</th>
                  <th className="text-left p-4">Stock</th>
                  <th className="text-left p-4">Status</th>
                  <th className="p-4"></th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length === 0 && !loading ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500">No products match this filter.</td>
                  </tr>
                ) : filteredProducts.map((p) => (
                  <tr key={p.id} className="border-t">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-accent/5">
                          <Image src={getMediaUrl(p.images?.split(',')?.[0]?.trim())} alt="" fill className="object-cover" />
                        </div>
                        <div>
                          <div className="font-medium">{p.name}</div>
                          <div className="text-sm text-gray-500">{p.category?.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">{formatPrice(p.price)} {p.discount > 0 && `(-${p.discount}%)`}</td>
                    <td className="p-4">{p.stock}</td>
                    <td className="p-4 text-sm font-medium">
                      {p.isSoldOut ? <span className="text-hot font-black uppercase tracking-widest text-[10px]">Sold Out</span> : p.isHotDeal ? <span className="text-accent font-black uppercase tracking-widest text-[10px]">Hot</span> : '-'}
                      {p.isReturnable && <span className="ml-2 text-[9px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">Returnable</span>}
                    </td>
                    <td className="p-4 text-right">
                      <button onClick={() => { setEditing(p); setForm({ name: p.name, description: p.description || '', price: p.price, discount: p.discount, stock: p.stock, categoryId: p.category?.id || '', images: p.images || '', isHotDeal: p.isHotDeal, isSoldOut: p.isSoldOut, isReturnable: p.isReturnable }); setShowForm(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="text-accent hover:underline font-bold text-sm mr-4">Edit</button>
                      <button onClick={() => remove(p.id)} className="text-hot hover:underline font-medium text-sm">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
