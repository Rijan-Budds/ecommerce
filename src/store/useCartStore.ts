"use client";
import { create } from "zustand";

interface Product {
  id: string; 
  slug: string; 
  name: string; 
  price: number; 
  image: string; 
  category: string  
}

interface CartItem { 
  productId: string; 
  quantity: number; 
  product?: Product | null;
}

interface CartState {
  items: CartItem[];
  isLoading: boolean;
  fetchCart: () => Promise<void>;
  add: (productId: string, quantity?: number) => Promise<void>;
  update: (productId: string, quantity: number) => Promise<void>;
  remove: (productId: string) => Promise<void>;
  clearCart: () => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  isLoading: false,
  fetchCart: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch(`/api/cart`, { credentials: "include" });
      const data = await res.json();
      set({ items: data.items ?? [] });
    } catch (error) {
      console.error("Failed to fetch cart:", error);
    } finally {
      set({ isLoading: false });
    }
  },
  add: async (productId, quantity = 1) => {
    set({ isLoading: true });
    try {
      const res = await fetch(`/api/cart`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: 'add', productId, quantity }),
      });
      
      if (!res.ok) {
        throw new Error("Failed to add item to cart");
      }
      
      // Optimistically update the cart state
      const currentItems = get().items;
      const existingItem = currentItems.find(item => item.productId === productId);
      
      if (existingItem) {
        set({
          items: currentItems.map(item =>
            item.productId === productId
              ? { ...item, quantity: item.quantity + quantity }
              : item
          )
        });
      } else {
        set({
          items: [...currentItems, { productId, quantity, product: null }]
        });
      }
    } catch (error) {
      console.error("Failed to add item:", error);
      // Revert to server state on error
      await get().fetchCart();
    } finally {
      set({ isLoading: false });
    }
  },
  update: async (productId, quantity) => {
    set({ isLoading: true });
    try {
      const res = await fetch(`/api/cart`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: 'update', productId, quantity }),
      });
      
      if (!res.ok) {
        throw new Error("Failed to update cart");
      }
      
      // Optimistically update the cart state
      const currentItems = get().items;
      if (quantity <= 0) {
        set({
          items: currentItems.filter(item => item.productId !== productId)
        });
      } else {
        set({
          items: currentItems.map(item =>
            item.productId === productId
              ? { ...item, quantity }
              : item
          )
        });
      }
    } catch (error) {
      console.error("Failed to update item:", error);
      // Revert to server state on error
      await get().fetchCart();
    } finally {
      set({ isLoading: false });
    }
  },
  remove: async (productId) => {
    set({ isLoading: true });
    try {
      const res = await fetch(`/api/cart`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: 'remove', productId }),
      });
      
      if (!res.ok) {
        throw new Error("Failed to remove item from cart");
      }
      
      // Optimistically update the cart state
      const currentItems = get().items;
      set({
        items: currentItems.filter(item => item.productId !== productId)
      });
    } catch (error) {
      console.error("Failed to remove item:", error);
      // Revert to server state on error
      await get().fetchCart();
    } finally {
      set({ isLoading: false });
    }
  },
  clearCart: () => {
    set({ items: [] });
  },
}));