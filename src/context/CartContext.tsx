'use client';

import React, { createContext, useContext, useEffect, useCallback } from 'react';

export type CartItem = {
  productId: string;
  name: string;
  price: number;
  discount: number;
  quantity: number;
  image: string;
  slug: string;
};

type CartContextType = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeItem: (productId: string) => void;
  updateQty: (productId: string, quantity: number) => void;
  clear: () => void;
  subtotal: number;
  count: number;
};

const CartContext = createContext<CartContextType | null>(null);

const STORAGE_KEY = 'deal_store_cart';

function loadCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    return s ? JSON.parse(s) : [];
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<CartItem[]>([]);

  useEffect(() => {
    setItems(loadCart());
  }, []);

  const persist = useCallback((newItems: CartItem[]) => {
    setItems(newItems);
    saveCart(newItems);
  }, []);

  const addItem = useCallback((item: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
    const qty = item.quantity ?? 1;
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.productId === item.productId);
      let next: CartItem[];
      if (idx >= 0) {
        next = prev.map((i, k) => (k === idx ? { ...i, quantity: i.quantity + qty } : i));
      } else {
        next = [...prev, { ...item, quantity: qty }];
      }
      saveCart(next);
      return next;
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => {
      const next = prev.filter((i) => i.productId !== productId);
      saveCart(next);
      return next;
    });
  }, []);

  const updateQty = useCallback((productId: string, quantity: number) => {
    if (quantity < 1) {
      removeItem(productId);
      return;
    }
    setItems((prev) => {
      const next = prev.map((i) =>
        i.productId === productId ? { ...i, quantity } : i
      );
      saveCart(next);
      return next;
    });
  }, [removeItem]);

  const clear = useCallback(() => {
    setItems([]);
    saveCart([]);
  }, []);

  const subtotal = items.reduce((s, i) => s + Math.round(i.price - (i.price * i.discount) / 100) * i.quantity, 0);
  const count = items.reduce((c, i) => c + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clear, subtotal, count }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
