import Link from 'next/link';
import Image from 'next/image';
import ProductCard from '@/components/ProductCard';
import { prisma } from '@/lib/db';
import { formatPrice } from '@/lib/utils';

export const revalidate = 60; // Enable ISR (Incremental Static Regeneration) for high-traffic scalability


async function getData() {
  try {
    const [categories, hotDeals, reviews, shopInfo] = await Promise.all([
      prisma.category.findMany({ orderBy: { name: 'asc' } }),
      prisma.product.findMany({ where: { isHotDeal: true, isSoldOut: false }, take: 8, include: { category: true } }),
      prisma.review.findMany({ where: { isActive: true }, take: 6 }),
      prisma.aboutShop.findFirst({ where: { id: '1' } }),
    ]);
    return { categories, hotDeals, reviews, shopInfo };
  } catch (error) {
    console.warn("Database not available during build for / page ISR. Returning empty fallback data.", error);
    return { categories: [], hotDeals: [], reviews: [], shopInfo: null };
  }
}

export default async function HomePage() {
  const { categories, hotDeals, reviews, shopInfo } = await getData();

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative pt-12 pb-24 md:pt-20 md:pb-32 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-accent/10 backdrop-blur-sm text-accent text-xs font-black px-4 py-2 rounded-full mb-6 animate-float">
                <span className="flex h-2 w-2 rounded-full bg-accent animate-ping"></span>
                EXCLUSIVE COLLECTIONS NOW LIVE
              </div>
              <h1 className="text-5xl md:text-7xl font-black text-gray-900 mb-6 leading-[1.1] tracking-tighter">
                Discover <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent-dark">Luxury</span> <br />
                at Every Price.
              </h1>
              <p className="text-gray-500 text-lg md:text-xl mb-10 max-w-xl leading-relaxed font-medium">
                Elevate your lifestyle with our curated selection of premium car accessories, gadgets, and watches. Genuine quality, guaranteed.
              </p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                <Link href="/shop" className="px-10 py-4 bg-accent text-white font-black rounded-[2rem] shadow-2xl shadow-accent/40 hover:bg-accent-dark hover:-translate-y-1 transition-all active:scale-95 group">
                  SHOP NOW
                  <svg className="w-5 h-5 inline-block ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
                <Link href="/shop?hotDeals=true" className="px-10 py-4 bg-white text-gray-900 font-bold rounded-[2rem] border border-gray-100 hover:bg-gray-50 transition-all active:scale-95 shadow-sm">
                  VIEW DEALS
                </Link>
              </div>
            </div>

            <div className="flex-1 relative">
              <div className="relative w-full aspect-square max-w-md mx-auto">
                {/* Visual Eye-catcher: Abstract Floating elements */}
                <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-transparent rounded-[3rem] rotate-6 animate-pulse-slow"></div>
                <div className="absolute inset-0 border-2 border-accent/20 rounded-[3rem] -rotate-3 animate-float drop-shadow-2xl"></div>

                {/* Dynamic Image or Stat Card */}
                <div className="absolute top-[5%] -right-[15%] glass p-6 rounded-3xl animate-float shadow-2xl z-20" style={{ animationDelay: '-1s' }}>
                  <div className="text-accent font-black text-2xl">99%</div>
                  <div className="text-[10px] font-bold text-gray-500 tracking-widest leading-tight">POSITIVE<br />REVIEWS</div>
                </div>

                <div className="absolute bottom-[10%] -left-[10%] glass p-6 rounded-3xl animate-float shadow-2xl z-20" style={{ animationDelay: '-3s' }}>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full bg-accent animate-pulse"></div>
                    <div className="text-[10px] font-bold text-gray-400 tracking-widest leading-tight">GENUINE QUALITY</div>
                  </div>
                  <div className="text-gray-900 font-black text-lg underline decoration-accent decoration-2">100% ASSURED</div>
                </div>

                {/* Main Hero Visual Placeholder/Image */}
                <div className="relative h-full w-full rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white/50 group">
                  <div className="absolute inset-0 bg-gradient-to-tr from-accent/40 to-transparent group-hover:opacity-0 transition-opacity duration-700"></div>
                  <Image
                    src="https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?q=80&w=2070&auto=format&fit=crop"
                    alt="Hero Product"
                    fill
                    className="object-cover transition-transform duration-1000 group-hover:scale-110"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-24 px-4 bg-white/40 backdrop-blur-sm relative overflow-hidden">
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex items-end justify-between mb-16">
            <div>
              <span className="text-accent font-black tracking-[0.2em] text-xs uppercase mb-3 block">Premium Selection</span>
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter">Shop by Category</h2>
            </div>
            <div className="hidden md:flex gap-4">
              {/* Controls or links */}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((cat, idx) => (
              <Link
                key={cat.id}
                href={`/shop?category=${cat.id}`}
                className="group relative h-64 rounded-[2.5rem] bg-white border border-gray-100 overflow-hidden text-center hover:border-accent/40 transition-all duration-500 hover:shadow-2xl hover:shadow-accent/10 hover:-translate-y-2"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                {cat.image ? (
                  <Image src={cat.image} alt={cat.name} fill className="object-cover group-hover:scale-110 transition-transform duration-700 scale-105" />
                ) : (
                  <div className="absolute inset-0 bg-accent/5 mesh-bg flex items-center justify-center text-5xl">
                    📦
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
                <div className="absolute bottom-6 left-0 right-0 px-4">
                  <span className="block font-black text-white text-sm tracking-widest uppercase group-hover:translate-y-[-4px] transition-transform">{cat.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Hot Deals Grid */}
      <section className="py-24 px-4 relative">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <div>
              <span className="text-red-500 font-black tracking-[0.2em] text-xs uppercase mb-3 block animate-bounce">Limited Offers</span>
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter">🔥 Hot Deals of the Week</h2>
            </div>
            <Link href="/shop?hotDeals=true" className="inline-flex items-center gap-3 bg-gray-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-accent transition-colors shadow-xl group">
              EXPLORE ALL DEALS
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {hotDeals.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section Redesign */}
      {shopInfo && (
        <section className="py-24 px-4">
          <div className="max-w-6xl mx-auto bg-gray-900 rounded-[4rem] p-12 md:p-20 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-[50%] h-full bg-accent/10 rounded-full blur-[120px] translate-x-1/2"></div>
            <div className="relative z-10 grid md:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-4xl md:text-6xl font-black text-white mb-8 leading-none tracking-tighter">
                  Built on <br />
                  <span className="text-accent underline decoration-8 decoration-white/10 underline-offset-[10px]">Trust & Quality.</span>
                </h2>
                <p className="text-gray-400 text-xl font-medium mb-10 leading-relaxed max-w-lg">
                  {shopInfo.shopDescription || "We believe in transparency and excellence. Every product is handpicked to ensure it meets our rigorous standards."}
                </p>
                <div className="flex items-center gap-8">
                  <div className="flex -space-x-4">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="w-12 h-12 rounded-full border-4 border-gray-900 bg-gray-800 flex items-center justify-center text-xs font-black text-white">
                        {i === 4 ? "+5K" : "JD"}
                      </div>
                    ))}
                  </div>
                  <div className="text-sm font-bold text-gray-300">TRUSTED BY 5000+ HAPPY CLIENTS</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "YEARS", val: shopInfo.yearsInBusiness || "1", color: "text-accent" },
                  { label: "CLIENTS", val: shopInfo.customersServed || "100", color: "text-white" },
                  { label: "GENUINE", val: "100%", color: "text-green-400" },
                  { label: "REPLACEMENT", val: "EASY", color: "text-accent" },
                ].map((item, idx) => (
                  <div key={idx} className="bg-white/5 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/10 hover:bg-white/10 transition-all border-b-4 border-b-accent/20">
                    <div className={`text-3xl md:text-4xl font-black ${item.color} mb-1 tracking-tighter`}>{item.val}+</div>
                    <div className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Reviews Section */}
      <section className="py-24 px-4 bg-white/20 backdrop-blur-xl border-t border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-accent font-black tracking-[0.2em] text-xs uppercase mb-3 block">Testimonials</span>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter">Your Feedback Drives Us</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {reviews.map((r) => (
              <div key={r.id} className="card p-10 bg-white shadow-xl shadow-gray-200/50">
                <div className="flex text-accent text-lg mb-6 gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className={i < r.rating ? "opacity-100" : "opacity-20"}>★</span>
                  ))}
                </div>
                <p className="text-gray-700 italic font-medium leading-relaxed mb-8 text-lg">"{r.comment}"</p>
                <div className="flex items-center gap-4 border-t border-gray-50 pt-8">
                  <div className="w-12 h-12 rounded-2xl overflow-hidden bg-gray-100 grayscale hover:grayscale-0 transition-all duration-500">
                    <Image src={r.image} alt={r.name} width={48} height={48} className="object-cover" />
                  </div>
                  <div>
                    <div className="font-black text-gray-900 text-sm">{r.name.toUpperCase()}</div>
                    <div className="text-[10px] font-bold text-gray-400 tracking-widest">VERIFIED BOUGHT</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Premium Footer Signature */}
      <footer className="py-16 relative overflow-hidden bg-gray-950 flex justify-center items-center border-t-4 border-accent">
        <div className="absolute inset-0 bg-gradient-to-r from-accent/10 via-transparent to-accent/10 opacity-50"></div>
        <div className="absolute -top-[100px] left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-accent/20 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="relative z-10 flex flex-col items-center text-center px-4">
          <div className="flex items-center gap-3 text-white/40 text-xs font-black tracking-[0.4em] uppercase mb-4">
            <span className="w-12 h-px bg-gradient-to-r from-transparent to-white/30"></span>
            SIGNATURE
            <span className="w-12 h-px bg-gradient-to-l from-transparent to-white/30"></span>
          </div>

          <p className="text-lg md:text-xl font-medium text-white/80 tracking-widest mb-1">
            Designed & Developed by
          </p>

          <div className="font-black text-3xl md:text-5xl tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500 mb-4 drop-shadow-2xl">
            Ramkrushna Jawade
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md hover:bg-white/10 transition-colors group cursor-default">
            <svg className="w-4 h-4 text-accent" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 10.999h2C22 5.869 18.127 2 12.99 2v2C17.052 4 20 6.943 20 10.999z" />
              <path d="M13 8c2.103 0 3 .897 3 3h2c0-3.225-1.775-5-5-5v2zM17.081 16.581C15.636 17.518 13.918 18 12 18c-5.514 0-10-4.486-10-10C2 6.082 2.482 4.364 3.419 2.919l-1.41-1.41-1.401 1.41A11.96 11.96 0 002 12c0 6.627 5.373 12 12 12a11.96 11.96 0 009.081-4.19l-1.41-1.401-1.401-1.419c-1.026 1.096-2.476 1.838-4.189 2.19z" />
              <path d="M15.422 10.583a4.015 4.015 0 00-1.844-1.844l-3.766-1.506a.5.5 0 00-.638.258l-1.506 3.766c-.19.475-.027 1.022.392 1.319l1.637 1.161c-.571 1.393-1.638 2.46-3.03 3.03l-1.161-1.637a1.006 1.006 0 00-1.318-.393l-3.766 1.506a.5.5 0 00-.258.638l1.506 3.766c.307.767 1.114 1.258 1.936 1.258A10.005 10.005 0 0015.422 10.58z" />
            </svg>
            <span className="text-white/60 text-sm font-bold tracking-widest group-hover:text-white transition-colors">
              +91 99213 21593
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
