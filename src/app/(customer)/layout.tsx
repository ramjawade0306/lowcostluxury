import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import Navbar from '@/components/Navbar';
import WhatsAppButton from '@/components/WhatsAppButton';

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <CartProvider>
        <Navbar />
        <main className="min-h-screen pb-20">{children}</main>
        <WhatsAppButton />
      </CartProvider>
    </AuthProvider>
  );
}
