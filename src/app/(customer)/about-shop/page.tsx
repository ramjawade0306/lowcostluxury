'use client';

import { useEffect, useState } from 'react';
import { getMediaUrl } from '@/lib/utils';

export default function AboutShopPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/about-shop')
            .then((res) => res.json())
            .then((d) => {
                if (!d.error && d.id) {
                    setData(d);
                }
            })
            .catch((err) => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-12 animate-pulse">
                <div className="h-40 bg-gray-200 rounded-xl mb-8" />
                <div className="h-64 bg-gray-200 rounded-xl" />
            </div>
        );
    }

    if (!data) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-12 text-center">
                <h1 className="text-2xl font-bold mb-4">About Our Shop</h1>
                <p className="text-gray-600">Information about our shop is currently not available.</p>
            </div>
        );
    }

    let proofImages = [];
    let proofVideos = [];
    try {
        proofImages = data.proofImages ? JSON.parse(data.proofImages) : [];
        proofVideos = data.proofVideos ? JSON.parse(data.proofVideos) : [];
    } catch (e) {
        console.error('Failed to parse proof media');
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <div className="text-center mb-20 relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-accent/10 rounded-full blur-3xl -z-10"></div>
                <span className="text-accent font-black tracking-[0.4em] text-xs uppercase mb-4 block">Our Story</span>
                <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-8 tracking-tighter">About Our Shop</h1>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto whitespace-pre-line font-medium leading-relaxed drop-shadow-sm">
                    {data.shopDescription || 'Welcome to our store. We provide affordable and genuine products.'}
                </p>
            </div>

            {/* 2. Trust Elements */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-24">
                <div className="card p-8 text-center animate-float" style={{ animationDelay: '0s' }}>
                    <div className="text-4xl font-black text-accent mb-2 tracking-tighter">{data.yearsInBusiness || '1'}+</div>
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Years Experience</div>
                </div>
                <div className="card p-8 text-center animate-float group" style={{ animationDelay: '-1s' }}>
                    <div className="text-4xl font-black text-accent mb-2 tracking-tighter group-hover:scale-110 transition-transform">{data.customersServed || '100'}+</div>
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Happy Clients</div>
                </div>
                <div className="card p-8 text-center animate-float" style={{ animationDelay: '-2s' }}>
                    <div className="text-4xl font-black text-emerald-500 mb-2 tracking-tighter">100%</div>
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{data.promiseText || 'Genuine'}</div>
                </div>
                <div className="card p-8 text-center animate-float" style={{ animationDelay: '-3s' }}>
                    <div className="text-4xl font-black text-accent mb-2 drop-shadow-lg">🚀</div>
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{data.shippingNote || 'Fast Shipping'}</div>
                </div>
            </div>

            {/* 3. Owner Section */}
            {data.showOwnerSection && (
                <div className="bg-white rounded-3xl p-8 md:p-12 mb-16 shadow-lg border border-gray-100 flex flex-col md:flex-row items-center gap-8 md:gap-12 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>

                    <div className="flex-shrink-0 relative z-10 hidden md:block">
                        {data.ownerPhoto ? (
                            <img
                                src={getMediaUrl(data.ownerPhoto)}
                                alt={data.ownerName || 'Shop Owner'}
                                className="w-40 h-40 md:w-56 md:h-56 object-cover rounded-full shadow-xl border-4 border-white"
                            />
                        ) : (
                            <div className="w-40 h-40 md:w-56 md:h-56 bg-gradient-to-br from-accent/20 to-accent/40 rounded-full shadow-xl border-4 border-white flex items-center justify-center text-accent">
                                <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                        )}
                    </div>

                    <div className="flex-1 text-center md:text-left relative z-10 w-full">
                        <div className="md:hidden flex justify-center mb-6">
                            {data.ownerPhoto ? (
                                <img
                                    src={getMediaUrl(data.ownerPhoto)}
                                    alt={data.ownerName || 'Shop Owner'}
                                    className="w-32 h-32 object-cover rounded-full shadow-xl border-4 border-white"
                                />
                            ) : (
                                <div className="w-32 h-32 bg-gradient-to-br from-accent/20 to-accent/40 rounded-full shadow-xl border-4 border-white flex items-center justify-center text-accent">
                                    <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                            )}
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">{data.ownerName || 'Founder'}</h2>
                        <p className="text-accent font-medium mb-4">Founder & Owner</p>
                        <p className="text-gray-600 mb-6 leading-relaxed whitespace-pre-line text-left md:text-left">
                            {data.ownerBio || 'Started the store to provide affordable branded products directly to customers.'}
                        </p>
                        <div className="flex justify-center md:justify-start gap-4 flex-wrap">
                            {data.whatsappLink && (
                                <a
                                    href={data.whatsappLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-sm shadow-green-500/30"
                                >
                                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                                        <path d="M12 0C5.372 0 0 5.373 0 12c0 2.124.553 4.125 1.543 5.86L.005 24l6.32-1.654A11.944 11.944 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.946c-1.802 0-3.565-.483-5.113-1.4l-.367-.217-3.793.993 1.01-3.69-.238-.379A9.927 9.927 0 0 1 2.052 12C2.052 6.514 6.514 2.052 12 2.052S21.948 6.514 21.948 12 17.486 21.946 12 21.946z" />
                                    </svg>
                                    WhatsApp
                                </a>
                            )}
                            {data.instagramLink && (
                                <a
                                    href={data.instagramLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white px-5 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-sm shadow-pink-500/30"
                                >
                                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                    </svg>
                                    Instagram
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* 4. Media & Proof */}
            {(proofImages.length > 0 || proofVideos.length > 0) && (
                <div className="mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center md:text-left">Behind the Scenes & Proof</h3>

                    {proofVideos.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            {proofVideos.map((src: string, index: number) => (
                                <div key={index} className="aspect-video relative rounded-2xl overflow-hidden shadow-lg border border-gray-100 bg-black group">
                                    <video
                                        src={getMediaUrl(src)}
                                        controls
                                        className="w-full h-full object-cover"
                                        poster="/placeholder.svg"
                                    />
                                </div>
                            ))}
                        </div>
                    )}

                    {proofImages.length > 0 && (
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                            {proofImages.map((src: string, index: number) => (
                                <div key={index} className="aspect-square relative rounded-2xl overflow-hidden hover:opacity-90 transition shadow-sm border border-gray-100 bg-gray-50 flex items-center justify-center">
                                    <img
                                        src={getMediaUrl(src)}
                                        alt={`Proof image ${index + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
