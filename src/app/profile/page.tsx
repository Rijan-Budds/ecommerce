"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useProfileStore } from "@/store/useProfileStore";



export default function ProfilePage() {
  const router = useRouter();
  const { loading, user, wishlist, orders, loadProfile, removeFromWishlistLocal } = useProfileStore();

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleLogout = async () => {
    await fetch("/api/logout", {
      method: "POST",
      credentials: "include",
    });
    router.push("/");
  };

  const handleRemoveFromWishlist = async (productId: string) => {
    try {
      const res = await fetch(`/api/wishlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ productId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update wishlist");
      removeFromWishlistLocal(productId);
      toast.success("Removed from wishlist");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update wishlist";
      toast.error(message);
    }
  };

  if (loading)
    return <div className="max-w-7xl mx-auto px-4 py-8">Loading...</div>;

  if (!user) {
    return (
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">You are not logged in</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Please log in to view your profile.
        </p>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-8 space-y-10">
      <section className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Hi, {user.username}</h1>
          <p className="text-gray-600 dark:text-gray-300">{user.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90"
        >
          Logout
        </button>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Wishlist</h2>
        {wishlist.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-300">
            No items in wishlist yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {wishlist.map((p: { id: string; name: string; image: string; price: number }) => (
              <div
                key={p.id}
                className="border rounded-lg p-4 shadow bg-white dark:bg-gray-900 dark:text-white"
              >
                <Image
                  src={p.image}
                  alt={p.name}
                  width={300}
                  height={192}
                  className="w-full h-40 object-cover rounded mb-3"
                />
                <div className="font-semibold">{p.name}</div>
                <div className="text-secondary font-bold mb-3">
                  ${p.price.toFixed(2)}
                </div>
                <button
                  onClick={() => handleRemoveFromWishlist(p.id)}
                  className="w-full border border-gray-300 dark:border-gray-700 py-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Orders</h2>
        {orders.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-300">No orders yet.</p>
        ) : (
          <div className="space-y-4">
            {orders.map((o: { _id: string; createdAt: string; status: string; items: { quantity: number; name?: string; image?: string; price?: number }[]; grandTotal: number }) => (
              <div
                key={o._id}
                className="border rounded-lg p-4 shadow bg-white dark:bg-gray-900 dark:text-white"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold">Order ID: {o._id}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(o.createdAt).toLocaleString()}
                  </div>
                </div>
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  Status: <span className="capitalize font-medium">{o.status}</span>
                </div>
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  Items: {o.items.reduce((s: number, it: { quantity: number }) => s + it.quantity, 0)}
                </div>
                {o.items && o.items.length > 0 && (
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {o.items.map((it, idx) => (
                      <div key={idx} className="flex items-center gap-3 border rounded p-2 bg-white/50 dark:bg-gray-800/50">
                        {it.image && (
                          <Image src={it.image} alt={it.name || "Item"} width={64} height={64} className="object-cover rounded" />
                        )}
                        <div className="flex-1">
                          <div className="font-medium">{it.name || "Item"}</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            Qty: {it.quantity} {typeof it.price === 'number' ? ` • $${(it.price * it.quantity).toFixed(2)}` : ''}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="text-secondary font-bold mt-1">
                  Total: ${o.grandTotal?.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
