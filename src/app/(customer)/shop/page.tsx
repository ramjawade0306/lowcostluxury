'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '@/components/ProductCard';

type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  discount: number;
  images: string;
  isHotDeal?: boolean;
  isSoldOut?: boolean;
  category?: { name: string };
};

type Category = { id: string; name: string; slug: string };

function ShopInner() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [hotDeals, setHotDeals] = useState(searchParams.get('hotDeals') === 'true');

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then(setCategories)
      .catch(() => { });
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (search) params.set('search', search);
    if (sort) params.set('sort', sort);
    if (hotDeals) params.set('hotDeals', 'true');
    fetch(`/api/products?${params}`)
      .then((r) => r.json())
      .then(setProducts)
      .finally(() => setLoading(false));
  }, [category, search, sort, hotDeals]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Shop</h1>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input
          type="search"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input flex-1"
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="input w-full sm:w-48">
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="input w-full sm:w-40">
          <option value="newest">Newest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="discount">Best Discounts</option>
        </select>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={hotDeals} onChange={(e) => setHotDeals(e.target.checked)} />
          <span className="text-sm">Hot Deals</span>
        </label>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="card aspect-square animate-pulse bg-gray-100" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <p className="text-center text-gray-500 py-12">No products found.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <div key={i} className="card aspect-square animate-pulse bg-gray-100" />)}
        </div>
      </div>
    }>
      <ShopInner />
    </Suspense>
  );
}
