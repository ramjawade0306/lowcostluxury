import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import './globals.css';

export const metadata: Metadata = {
  title: 'Low price luxury - Best Discounts & Offers',
  description: 'Shop the best deals on car accessories, mobile accessories, watches, gadgets and more. Fast delivery, genuine products.',
};

import BackgroundShapes from '@/components/BackgroundShapes';
import WhatsAppButton from '@/components/WhatsAppButton';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-50">
        <BackgroundShapes />
        <div className="relative z-10">
          {children}
        </div>
        <Toaster position="bottom-center" />
      </body>
    </html>
  );
}
