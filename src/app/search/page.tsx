import React from "react";
import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { ProductCardActions } from "@/components/ProductCardActions";
import { FaSearch, FaArrowLeft } from "react-icons/fa";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

interface SearchProduct {
  id: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  category: string;
  discountPercentage?: number;
  inStock?: boolean;
}

async function searchProducts(query: string): Promise<SearchProduct[]> {
  if (!query) return [];
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
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-6 py-12">
          {/* Header Section */}
          <div className="mb-12">
            {/* Breadcrumb */}
            <nav className="mb-6">
              <ol className="flex items-center space-x-2 text-sm text-gray-600">
                <li>
                  <Link href="/" className="hover:text-blue-600 transition-colors flex items-center space-x-1">
                    <FaArrowLeft className="text-xs" />
                    <span>Back to Home</span>
                  </Link>
                </li>
                <li>/</li>
                <li className="text-gray-900 font-medium">Search Results</li>
              </ol>
            </nav>

            {/* Search Header */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-[#0D3B66] to-[#1E5CAF] text-white rounded-full mb-6">
                <FaSearch className="text-2xl" />
              </div>
              <h1 className="text-5xl font-bold text-gray-900 mb-4">
                Search <span className="bg-gradient-to-r from-[#0D3B66] to-[#1E5CAF] bg-clip-text text-transparent">Results</span>
              </h1>
              {q && (
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  Showing results for &quot;{q}&quot;
                </p>
              )}
            </div>
          </div>

          {/* Search Results Section */}
          {products.length === 0 ? (
            <div className="text-center py-20">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 bg-gradient-to-r from-[#0D3B66] to-[#1E5CAF] rounded-full flex items-center justify-center mx-auto mb-6">
                  <FaSearch className="text-white text-3xl" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">No Results Found</h2>
                <p className="text-gray-600 mb-8 text-lg">
                  We couldn&apos;t find any products matching &quot;{q}&quot;. 
                  Try different keywords or browse our categories.
                </p>
                <div className="space-y-4">
                  <Link 
                    href="/" 
                    className="inline-flex items-center space-x-2 bg-gradient-to-r from-[#0D3B66] to-[#1E5CAF] text-white px-8 py-4 rounded-xl font-semibold hover:from-[#0D3B66]/90 hover:to-[#1E5CAF]/90 transition-all duration-200"
                  >
                    <FaArrowLeft className="text-sm" />
                    <span>Browse All Products</span>
                  </Link>
                  <div className="text-sm text-gray-500">
                    Popular searches: CPU, Keyboard, Monitor, Speaker, Mouse
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
                             {/* Search Stats */}
               <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                 <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <FaSearch className="text-[#0D3B66]" />
                      <span className="font-semibold text-gray-900">Search Results</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      Found {products.length} product{products.length !== 1 ? 's' : ''} for &quot;{q}&quot;
                    </div>
                  </div>
                </div>
              </div>

              {/* Products Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {products.map((p: SearchProduct) => (
                  <div key={p.id} className="group h-full">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 h-full flex flex-col">
                      {/* Product Image */}
                      <Link href={`/product/${p.slug}`} passHref>
                        <div className="relative cursor-pointer">
                          <div className="absolute inset-0 bg-gradient-to-br from-[#0D3B66] via-[#154A8A] to-[#1E5CAF] opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                          <Image
                            src={p.image}
                            alt={p.name}
                            width={400}
                            height={300}
                            className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          {/* Quick View Overlay */}
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                            <div className="bg-white text-[#0D3B66] px-4 py-2 rounded-full font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
                              Quick View
                            </div>
                          </div>
                          {/* Category Badge */}
                          <div className="absolute top-4 left-4">
                            <span className="bg-gradient-to-r from-[#0D3B66] to-[#154A8A] text-white px-3 py-1 rounded-full text-xs font-medium capitalize">
                              {p.category.replace('-', ' ')}
                            </span>
                          </div>
                          
                          {/* Discount Badge */}
                          {p.discountPercentage && p.discountPercentage > 0 && (
                            <div className="absolute top-4 right-4">
                              <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                                -{p.discountPercentage}%
                              </span>
                            </div>
                          )}
                          
                          {/* Stock Status Badge */}
                          {p.inStock === false && (
                            <div className="absolute bottom-4 right-4">
                              <span className="bg-gray-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                                Out of Stock
                              </span>
                            </div>
                          )}
                        </div>
                      </Link>

                      {/* Product Info */}
                      <div className="p-6 space-y-4 flex-1 flex flex-col">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 line-clamp-2 h-14 group-hover:text-[#0D3B66] transition-colors">
                            {p.name}
                          </h3>
                          <div className="flex items-baseline space-x-2">
                            {p.discountPercentage && p.discountPercentage > 0 ? (
                              <>
                                <span className="text-lg font-bold text-gray-400 line-through">
                                  रु{p.price.toFixed(2)}
                                </span>
                                <span className="text-2xl font-bold bg-gradient-to-r from-[#0D3B66] to-[#1E5CAF] bg-clip-text text-transparent">
                                  रु{(p.price * (1 - p.discountPercentage / 100)).toFixed(2)}
                                </span>
                              </>
                            ) : (
                              <span className="text-2xl font-bold bg-gradient-to-r from-[#0D3B66] to-[#1E5CAF] bg-clip-text text-transparent">
                                रु{p.price.toFixed(2)}
                              </span>
                            )}
                            <span className="text-sm text-gray-500">NPR</span>
                          </div>
                        </div>

                        {/* Product Actions */}
                        <div className="pt-4 border-t border-gray-100">
                          <ProductCardActions productId={p.id} inStock={p.inStock !== false} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Search Suggestions */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Try These Searches</h3>
                <div className="flex flex-wrap gap-3">
                  {['CPU', 'Keyboard', 'Monitor', 'Speaker', 'Mouse', 'Trending'].map((suggestion) => (
                    <Link
                      key={suggestion}
                      href={`/search?q=${encodeURIComponent(suggestion.toLowerCase())}`}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gradient-to-r hover:from-[#0D3B66] hover:to-[#1E5CAF] hover:text-white transition-all duration-200"
                    >
                      {suggestion}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}


