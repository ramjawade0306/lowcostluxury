'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { formatPrice, calcDiscount } from '@/lib/utils';
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

  const images = product.images?.split(',').filter(Boolean) || [];
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

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-2">
          <div className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden">
            <Image src={mainImg} alt={product.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
            {product.discount > 0 && (
              <span className="absolute top-4 left-4 bg-accent text-white font-bold px-3 py-1 rounded">
                {product.discount}% OFF
              </span>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setImgIdx(i)}
                  className={`relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 ${imgIdx === i ? 'border-accent' : 'border-transparent'}`}
                >
                  <Image src={img} alt="" fill className="object-cover" />
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
          <p className="text-sm text-gray-600 mb-4">
            {product.stock > 0 ? (
              <span className="text-green-600">In stock ({product.stock} available)</span>
            ) : (
              <span className="text-red-600">Out of stock</span>
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

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="text-xl font-bold mb-4">Related Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {related.map((p) => (
              <Link key={p.id} href={`/product/${p.slug}`} className="card block">
                <div className="relative aspect-square bg-gray-100">
                  <Image
                    src={p.images?.split(',')[0]?.trim() || '/placeholder.svg'}
                    alt={p.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-3">
                  <h3 className="font-medium text-sm line-clamp-2">{p.name}</h3>
                  <span className="text-accent font-bold text-sm">{formatPrice(calcDiscount(p.price, p.discount))}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
