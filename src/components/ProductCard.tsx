import Link from 'next/link';
import Image from 'next/image';
import { formatPrice, calcDiscount, getMediaUrl } from '@/lib/utils';

type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  discount: number;
  images: string;
  isHotDeal?: boolean;
  isSoldOut?: boolean;
};

export default function ProductCard({ product }: { product: Product }) {
  const img = getMediaUrl(product.images?.split(',')[0]?.trim());
  const finalPrice = calcDiscount(product.price, product.discount);

  const isVideo = (url: string) => {
    const ext = url.split('.').pop()?.split('?')[0].toLowerCase();
    return ['mp4', 'mov', 'avi', 'webm'].includes(ext || '');
  };

  return (
    <Link href={`/product/${product.slug}`} className="card group block">
      <div className="relative aspect-[4/5] overflow-hidden bg-black">
        {isVideo(img) ? (
          <video
            src={img}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80"
            muted
            playsInline
            onMouseOver={(e) => e.currentTarget.play()}
            onMouseOut={(e) => {
              e.currentTarget.pause();
              e.currentTarget.currentTime = 0;
            }}
          />
        ) : (
          <Image
            src={img}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        )}
        {isVideo(img) && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
              <svg className="w-6 h-6 text-white ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6.3 2.841A.7.7 0 005 3.41V16.59a.7.7 0 001.3.569l10.7-6.59a.7.7 0 000-1.138l-10.7-6.59z" />
              </svg>
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

        {product.discount > 0 && (
          <span className="absolute top-4 left-4 bg-accent text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-lg shadow-accent/30">
            {product.discount}% OFF
          </span>
        )}
        {product.isHotDeal && (
          <span className="absolute top-4 right-4 bg-hot text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-lg shadow-hot/30">
            HOT
          </span>
        )}
        {product.isSoldOut && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
            <span className="text-white text-sm font-black uppercase tracking-widest border-2 border-white/50 px-4 py-1.5 rounded-lg">Sold Out</span>
          </div>
        )}
      </div>
      <div className="p-5">
        <h3 className="font-bold text-gray-800 line-clamp-2 min-h-[2.5rem] group-hover:text-accent transition-colors duration-300">{product.name}</h3>
        <div className="mt-4 flex items-end justify-between">
          <div className="flex flex-col">
            {product.discount > 0 && (
              <span className="text-gray-400 text-xs line-through font-semibold mb-0.5">{formatPrice(product.price)}</span>
            )}
            <span className="text-accent text-lg font-black">{formatPrice(finalPrice)}</span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-all duration-500 shadow-inner">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}
