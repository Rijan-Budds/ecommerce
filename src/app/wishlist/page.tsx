'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { toast } from 'sonner'

interface Product {
  id: string
  slug: string
  name: string
  price: number
  category: string
  image: string
}

export default function WishlistPage() {
  const [items, setItems] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/wishlist', { credentials: 'include' })
        const data = await res.json()
        setItems(data.items || [])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const removeItem = async (productId: string) => {
    try {
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ productId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to update wishlist')
      setItems((prev) => prev.filter((p) => p.id !== productId))
      toast.success('Removed from wishlist')
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to update wishlist')
    }
  }

  if (loading) return <div className="max-w-7xl mx-auto px-4 py-8">Loading...</div>

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Wishlist</h1>
      {items.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-300">No items in wishlist.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {items.map((p) => (
            <div key={p.id} className="border rounded-lg p-4 shadow bg-white dark:bg-gray-900 dark:text-white">
              <Image src={p.image} alt={p.name} width={300} height={192} className="w-full h-40 object-cover rounded mb-3" />
              <div className="font-semibold">{p.name}</div>
              <div className="text-orange-600 font-bold mb-3">${p.price.toFixed(2)}</div>
              <button
                onClick={() => removeItem(p.id)}
                className="w-full border border-gray-300 dark:border-gray-700 py-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
