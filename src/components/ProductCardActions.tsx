"use client";

import React from "react";
import { toast } from "sonner";

export function ProductCardActions({ productId }: { productId: string }) {
  const handleAddToCart = async () => {
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: 'add', productId, quantity: 1 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to add to cart");
      toast.success("Added to cart");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to add to cart");
    }
  };

  const handleToggleWishlist = async () => {
    try {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ productId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update wishlist");
      toast.success("Wishlist updated");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to update wishlist");
    }
  };

  return (
    <div className="mt-3 grid grid-cols-2 gap-2">
      <button
        onClick={handleAddToCart}
        className="w-full bg-primary text-primary-foreground py-2 rounded hover:bg-primary/90 transition"
      >
        Add to Cart
      </button>
      <button
        onClick={handleToggleWishlist}
        className="w-full border border-border py-2 rounded hover:bg-muted transition"
      >
        Wishlist
      </button>
    </div>
  );
}


