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
            className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-[#25D366] text-white rounded-full shadow-lg hover:scale-110 transition-transform duration-200"
            aria-label="Contact on WhatsApp"
        >
            <svg
                viewBox="0 0 24 24"
                width="32"
                height="32"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-white"
            >
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 1 1-7.6-10.8 8.38 8.38 0 0 1 3.8.9L21 3z"></path>
            </svg>
        </a>
    );
};

export default WhatsAppButton;
