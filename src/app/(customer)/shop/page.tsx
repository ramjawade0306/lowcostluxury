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

      <div className="flex flex-col lg:flex-row gap-6 mb-12">
        <div className="flex-1 flex gap-2">
          <div className="relative flex-1 group">
            <input
              type="search"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input w-full pl-10 h-12 rounded-xl border-gray-100 focus:border-accent group-hover:bg-accent/5 transition-all"
            />
            <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 group-hover:text-accent transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <button className="btn-primary h-12 px-6 rounded-xl flex items-center gap-2 font-black uppercase tracking-widest text-xs">
            Search
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Filter:</span>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="input h-10 px-4 rounded-lg text-sm border-gray-100 hover:border-accent transition-all cursor-pointer">
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sort:</span>
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="input h-10 px-4 rounded-lg text-sm border-gray-100 hover:border-accent transition-all cursor-pointer">
              <option value="newest">Newest first</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="discount">Highest Discount</option>
            </select>
          </div>

          <label className="flex items-center gap-3 cursor-pointer group bg-white/50 px-4 py-2 rounded-lg border border-gray-100 hover:border-accent transition-all">
            <input 
              type="checkbox" 
              checked={hotDeals} 
              onChange={(e) => setHotDeals(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-accent focus:ring-accent"
            />
            <span className="text-xs font-black text-gray-400 group-hover:text-accent transition-colors uppercase tracking-widest">Hot Deals</span>
          </label>
        </div>
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
