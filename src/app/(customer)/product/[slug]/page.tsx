'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { formatPrice, calcDiscount, getMediaUrl } from '@/lib/utils';
import toast from 'react-hot-toast';

type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  discount: number;
  stock: number;
  images: string;
  category: { id: string; name: string; slug: string };
  isSoldOut: boolean;
};

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [qty, setQty] = useState(1);
  const [imgIdx, setImgIdx] = useState(0);
  const { addItem } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    fetch(`/api/products/${slug}`)
      .then((r) => (r.ok ? r.json() : null))
      .then(setProduct);
  }, [slug]);

  useEffect(() => {
    const catId = product?.category?.id;
    if (catId) {
      fetch(`/api/products?category=${catId}`)
        .then((r) => r.json())
        .then((list: Product[]) => setRelated(list.filter((p) => p.id !== product.id).slice(0, 4)));
    }
  }, [product?.id, product?.category?.id]);

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <div className="animate-pulse h-64 bg-gray-100 rounded-xl mb-6" />
        <div className="animate-pulse h-8 bg-gray-100 rounded w-3/4 mx-auto" />
      </div>
    );
  }

  const images = (product.images?.split(',').filter(Boolean) || []).map(img => getMediaUrl(img.trim()));
  const mainImg = images[imgIdx] || images[0] || '/placeholder.svg';
  const finalPrice = calcDiscount(product.price, product.discount);
  const canAdd = !product.isSoldOut && product.stock >= qty;

  const handleAddToCart = () => {
    if (!canAdd) return;
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      discount: product.discount,
      quantity: qty,
      image: mainImg,
      slug: product.slug,
    });
    toast.success('Added to cart');
  };

  const handleBuyNow = () => {
    if (!canAdd) return;
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      discount: product.discount,
      quantity: qty,
      image: mainImg,
      slug: product.slug,
    });
    router.push('/checkout');
  };

  const isVideo = (url: string) => {
    const ext = url.split('.').pop()?.split('?')[0].toLowerCase();
    return ['mp4', 'mov', 'avi', 'webm'].includes(ext || '');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="relative aspect-square bg-black rounded-3xl overflow-hidden shadow-2xl group flex items-center justify-center">
            {isVideo(mainImg) ? (
              <video
                src={mainImg}
                controls
                autoPlay
                muted
                playsInline
                className="w-full h-full object-contain"
              />
            ) : (
              <Image src={mainImg} alt={product.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
            )}
            {product.discount > 0 && (
              <span className="absolute top-6 left-6 bg-accent text-white font-black px-4 py-1.5 rounded-full shadow-lg shadow-accent/30 z-10">
                {product.discount}% OFF
              </span>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide py-2 px-1">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setImgIdx(i)}
                  className={`relative w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 border-2 transition-all duration-300 shadow-md ${imgIdx === i ? 'border-accent scale-105 shadow-accent/20' : 'border-white hover:border-accent/40'}`}
                >
                  {isVideo(img) ? (
                    <div className="relative w-full h-full bg-black flex items-center justify-center">
                      <video src={img} className="w-full h-full object-cover opacity-60" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M6.3 2.841A.7.7 0 005 3.41V16.59a.7.7 0 001.3.569l10.7-6.59a.7.7 0 000-1.138l-10.7-6.59z" />
                        </svg>
                      </div>
                    </div>
                  ) : (
                    <Image src={img} alt="" fill className="object-cover" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>
          <p className="text-gray-500 text-sm mb-4">{product.category?.name}</p>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl font-bold text-accent">{formatPrice(finalPrice)}</span>
            {product.discount > 0 && (
              <span className="text-gray-400 line-through">{formatPrice(product.price)}</span>
            )}
          </div>
          <p className="text-sm font-bold mb-4">
            {product.stock > 0 ? (
              product.stock < 10 ? (
                <span className="text-accent animate-pulse text-xs">🔥 Hurry! Only {product.stock} items remaining!</span>
              ) : (
                <span className="text-emerald-500">In stock</span>
              )
            ) : (
              <span className="text-hot">Out of stock</span>
            )}
          </p>
          <p className="text-gray-700 mb-6 whitespace-pre-line">{product.description}</p>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="w-10 h-10 flex items-center justify-center hover:bg-gray-100"
              >
                −
              </button>
              <span className="w-12 text-center font-medium">{qty}</span>
              <button
                onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                className="w-10 h-10 flex items-center justify-center hover:bg-gray-100"
              >
                +
              </button>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleAddToCart}
              disabled={!canAdd}
              className="btn-outline flex-1"
            >
              Add to Cart
            </button>
            <button
              onClick={handleBuyNow}
              disabled={!canAdd}
              className="btn-primary flex-1"
            >
              Buy Now
            </button>
          </div>

          {!user && (
            <p className="text-sm text-gray-500 mt-4">
              <a href="/login" className="text-accent hover:underline">Login</a> to save your address and track orders.
            </p>
          )}
        </div>
      </div>

        <section className="mt-16">
          <h2 className="text-xl font-bold mb-4">Related Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {related.map((p) => (
              <Link key={p.id} href={`/product/${p.slug}`} className="card group block">
                <div className="relative aspect-square bg-gray-50 overflow-hidden">
                  <Image
                    src={getMediaUrl(p.images?.split(',')[0]?.trim()) || '/placeholder.svg'}
                    alt={p.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-800 text-sm line-clamp-2 min-h-[2.5rem] group-hover:text-accent transition-colors">{p.name}</h3>
                  <span className="text-accent font-black text-sm">{formatPrice(calcDiscount(p.price, p.discount))}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
    </div>
  );
}
