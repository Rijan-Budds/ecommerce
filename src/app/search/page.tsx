import React from "react";
import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";

async function searchProducts(query: string) {
  if (!query) return [] as { id: string; slug: string; name: string; price: number; image: string }[];
  const hdrs = await headers();
  const host = hdrs.get("host") || "localhost:3000";
  const proto = hdrs.get("x-forwarded-proto") || "http";
  const base = `${proto}://${host}`;
  const res = await fetch(`${base}/api/search?q=${encodeURIComponent(query)}`, {
    cache: 'no-store'
  });
  const data = await res.json();
  return data.products || [];
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const products = await searchProducts(q || "");

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Search results for: {q || ""}</h1>

      {products.length === 0 ? (
        <p>No results found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {products.map((p: { id: string; slug: string; name: string; price: number; image: string }) => (
            <Link key={p.id} href={`/product/${p.slug}`} className="border rounded-lg p-4 shadow bg-white dark:bg-gray-900 dark:text-white hover:shadow-lg transition-shadow">
              <Image
                src={p.image}
                alt={p.name}
                width={300}
                height={192}
                className="w-full h-40 object-cover rounded mb-3"
              />
              <div className="font-semibold">{p.name}</div>
              <div className="text-secondary font-bold">${p.price.toFixed(2)}</div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}


