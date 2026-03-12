'use client';

import React, { useEffect, useState } from 'react';

const WhatsAppButton = () => {
    const [whatsappLink, setWhatsappLink] = useState('https://wa.me/916264267644');

    useEffect(() => {
        const fetchAbout = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/about-shop`);
                const data = await res.json();
                if (data.whatsappLink) {
                    setWhatsappLink(data.whatsappLink);
                }
            } catch (err) {
                console.error('Failed to fetch WhatsApp link', err);
            }
        };
        fetchAbout();
    }, []);

    if (!whatsappLink) return null;

    return (
        <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-6 py-3 bg-[#25D366] text-white rounded-full shadow-2xl hover:scale-105 transition-all duration-300 group hover:shadow-[#25D366]/40"
            aria-label="Contact on WhatsApp"
        >
            <svg
                viewBox="0 0 24 24"
                width="28"
                height="28"
                fill="currentColor"
                className="text-white drop-shadow-sm"
            >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                <path d="M12 0C5.372 0 0 5.373 0 12c0 2.124.553 4.125 1.543 5.86L.005 24l6.32-1.654A11.944 11.944 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.946c-1.802 0-3.565-.483-5.113-1.4l-.367-.217-3.793.993 1.01-3.69-.238-.379A9.927 9.927 0 0 1 2.052 12C2.052 6.514 6.514 2.052 12 2.052S21.948 6.514 21.948 12 17.486 21.946 12 21.946z" />
            </svg>
            <span className="font-bold text-sm md:text-base whitespace-nowrap drop-shadow-sm">Support</span>
            <div className="absolute inset-0 rounded-full bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </a>
    );
};

export default WhatsAppButton;
