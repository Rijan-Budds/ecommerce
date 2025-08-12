"use client";
import { create } from "zustand";

// use Next.js internal API routes

type CartItem = { productId: string; quantity: number; product?: { id: string; slug: string; name: string; price: number; category: string; image: string } | null };

interface CartState {
  items: CartItem[];
  fetchCart: () => Promise<void>;
  add: (productId: string, quantity?: number) => Promise<void>;
  update: (productId: string, quantity: number) => Promise<void>;
  remove: (productId: string) => Promise<void>;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  fetchCart: async () => {
    const res = await fetch(`/api/cart`, { credentials: "include" });
    const data = await res.json();
    set({ items: data.items ?? [] });
  },
  add: async (productId, quantity = 1) => {
    await fetch(`/api/cart`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ action: 'add', productId, quantity }),
    });
    await get().fetchCart();
  },
  update: async (productId, quantity) => {
    await fetch(`/api/cart`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ action: 'update', productId, quantity }),
    });
    await get().fetchCart();
  },
  remove: async (productId) => {
    await fetch(`/api/cart`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ action: 'remove', productId }),
    });
    await get().fetchCart();
  },
}));


