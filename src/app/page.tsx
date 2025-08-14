"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { FaShoppingCart, FaHeart, FaArrowRight, FaStar, FaTruck, FaShieldAlt, FaHeadset } from "react-icons/fa";

import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import Autoplay from "embla-carousel-autoplay";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

// Carousel images with their corresponding category slugs
const sliderData = [
  {
    image: "/home/slider1.jpg",
    categorySlug: "keyboard",
    alt: "keyboard",
    title: "Premium Keyboards",
    subtitle: "Experience the perfect typing sensation"
  },
  {
    image: "/home/slider2.jpg",
    categorySlug: "mouse",
    alt: "Mouse",
    title: "Gaming Mice",
    subtitle: "Precision and speed for every click"
  },
  {
    image: "/home/slider3.jpg",
    categorySlug: "speaker",
    alt: "Speaker",
    title: "High-Fidelity Speakers",
    subtitle: "Crystal clear sound quality"
  },
  {
    image: "/home/slider4.jpg",
    categorySlug: "monitor",
    alt: "Monitor",
    title: "Ultra HD Monitors",
    subtitle: "Stunning visuals for work and play"
  },
];

type Product = {
  id: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  category: string;
  discountPercentage?: number;
  inStock?: boolean;
};

const featuredCategories = [
  {
    id: 1,
    name: "CPUs",
    slug: "cpu",
    image: "/home/category1.jpg",
    description: "High-performance processors"
  },
  {
    id: 2,
    name: "Keyboard",
    slug: "keyboard",
    image: "/home/category2.jpg",
    description: "Mechanical & wireless keyboards"
  },
  {
    id: 3,
    name: "Monitor",
    slug: "monitor",
    image: "/home/category3.jpg",
    description: "4K & gaming monitors"
  },
  {
    id: 4,
    name: "Speakers",
    slug: "speaker",
    image: "/home/category4.jpg",
    description: "Premium audio systems"
  },
  {
    id: 5,
    name: "Mouse",
    slug: "mouse",
    image: "/home/category5.jpg",
    description: "Gaming & wireless mice"
  },
];

function Page() {
  const autoplayPlugin = React.useRef(
    Autoplay({ delay: 4000, stopOnInteraction: false })
  );

  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/products?category=trending", { cache: "no-store" });
        const data = await res.json();
        const list: Product[] = Array.isArray(data.products) ? data.products : [];
        setTrendingProducts(list.slice(0, 8));
      } catch {
        setTrendingProducts([]);
      }
    };
    load();
  }, []);

  const handleAddToCart = async (productId: string) => {
    try {
      console.log("Adding to cart for product:", productId);
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: 'add', productId, quantity: 1 }),
      });
      const data = await res.json();
      console.log("Cart response status:", res.status);
      console.log("Cart response data:", data);
      if (!res.ok) {
        if (res.status === 401) {
          console.log("User not authenticated, showing login message");
          toast.error("Please log in to add items to your cart");
          return;
        }
        throw new Error(data.message || "Failed to add to cart");
      }
      toast.success("Added to cart");
    } catch (error: unknown) {
      console.log("Cart error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to add to cart";
      toast.error(errorMessage);
    }
  };

  const handleToggleWishlist = async (productId: string) => {
    try {
      console.log("Toggling wishlist for product:", productId);
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ productId }),
      });
      const data = await res.json();
      console.log("Wishlist response status:", res.status);
      console.log("Wishlist response data:", data);
      if (!res.ok) {
        if (res.status === 401) {
          console.log("User not authenticated, showing login message");
          toast.error("Please log in to add items to your wishlist");
          return;
        }
        throw new Error(data.message || "Failed to update wishlist");
      }
      toast.success("Wishlist updated");
    } catch (error: unknown) {
      console.log("Wishlist error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to update wishlist";
      toast.error(errorMessage);
    }
  };

  return (
    <>
      <Header />

      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        {/* Hero Carousel */}
        <section className="relative">
          <Carousel plugins={[autoplayPlugin.current]} opts={{ loop: true }}>
            <CarouselContent>
              {sliderData.map((slider, i) => (
                <CarouselItem key={i} className="basis-full">
                  <div className="relative h-[500px] overflow-hidden">
                    <Image
                      src={slider.image}
                      alt={slider.alt}
                      width={1400}
                      height={500}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent">
                      <div className="max-w-7xl mx-auto px-6 h-full flex items-center">
                        <div className="text-white max-w-lg">
                          <h1 className="text-5xl font-bold mb-4">{slider.title}</h1>
                          <p className="text-xl mb-6 text-gray-200">{slider.subtitle}</p>
                          <Link
                            href={`/categories/${slider.categorySlug}`}
                            className="inline-flex items-center space-x-2 bg-gradient-to-r from-[#0D3B66] to-[#1E5CAF] text-white px-8 py-4 rounded-xl font-semibold hover:from-[#0D3B66]/90 hover:to-[#1E5CAF]/90 transition-all duration-200 shadow-lg hover:shadow-xl"
                          >
                            <span>Shop Now</span>
                            <FaArrowRight />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </section>

        {/* Trending Products */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Trending <span className="bg-gradient-to-r from-[#0D3B66] to-[#1E5CAF] bg-clip-text text-transparent">Products</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Discover our most popular products loved by customers worldwide
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {trendingProducts.map((product) => (
                <div key={product.id} className="group h-full">
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 h-full flex flex-col">
                    <Link href={`/product/${product.slug}`}>
                      <div className="relative overflow-hidden">
                        <Image
                          src={product.image}
                          alt={product.name}
                          width={400}
                          height={300}
                          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-br from-[#0D3B66] via-[#154A8A] to-[#1E5CAF] opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                        
                        {/* Discount Badge */}
                        {product.discountPercentage && product.discountPercentage > 0 && (
                          <div className="absolute top-4 left-4">
                            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                              -{product.discountPercentage}%
                            </span>
                          </div>
                        )}
                        
                        {/* Stock Status Badge */}
                        {product.inStock === false && (
                          <div className="absolute top-4 right-4">
                            <span className="bg-gray-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                              Out of Stock
                            </span>
                          </div>
                        )}
                      </div>
                    </Link>

                    <div className="p-6 space-y-4 flex-1 flex flex-col">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 group-hover:text-[#0D3B66] transition-colors overflow-hidden text-ellipsis whitespace-nowrap">
                          {product.name}
                        </h3>
                        <div className="flex items-baseline space-x-2">
                          {product.discountPercentage && product.discountPercentage > 0 ? (
                            <>
                              <span className="text-lg font-bold text-gray-400 line-through">
                                रु{product.price.toFixed(2)}
                              </span>
                              <span className="text-2xl font-bold bg-gradient-to-r from-[#0D3B66] to-[#1E5CAF] bg-clip-text text-transparent">
                                रु{(product.price * (1 - product.discountPercentage / 100)).toFixed(2)}
                              </span>
                            </>
                          ) : (
                            <span className="text-2xl font-bold bg-gradient-to-r from-[#0D3B66] to-[#1E5CAF] bg-clip-text text-transparent">
                              रु{product.price.toFixed(2)}
                            </span>
                          )}
                          <span className="text-sm text-gray-500">NPR</span>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleAddToCart(product.id)}
                          disabled={product.inStock === false}
                          className={`flex-1 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 ${
                            product.inStock === false
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : 'bg-gradient-to-r from-[#0D3B66] to-[#1E5CAF] text-white hover:from-[#0D3B66]/90 hover:to-[#1E5CAF]/90'
                          }`}
                        >
                          <FaShoppingCart />
                          <span>{product.inStock === false ? 'Out of Stock' : 'Add to Cart'}</span>
                        </button>
                        <button
                          onClick={() => handleToggleWishlist(product.id)}
                          className="px-4 py-3 border-2 border-[#0D3B66] text-[#0D3B66] rounded-xl hover:bg-[#0D3B66] hover:text-white transition-all duration-200"
                        >
                          <FaHeart />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Shop by <span className="bg-gradient-to-r from-[#0D3B66] to-[#1E5CAF] bg-clip-text text-transparent">Category</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Explore our wide range of products organized by category
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              {featuredCategories.map((cat) => (
                <Link key={cat.id} href={`/categories/${cat.slug}`}>
                  <div className="group">
                    <div className="relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                      <Image
                        src={cat.image}
                        alt={cat.name}
                        width={300}
                        height={200}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent">
                        <div className="absolute bottom-0 left-0 right-0 p-6">
                          <h3 className="text-white text-xl font-bold mb-2">{cat.name}</h3>
                          <p className="text-gray-200 text-sm mb-4">{cat.description}</p>
                          <div className="flex items-center text-white text-sm font-semibold">
                            <span>Explore</span>
                            <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-6">
            <div className="bg-gradient-to-r from-[#0D3B66] via-[#154A8A] to-[#1E5CAF] rounded-3xl p-12 text-center text-white">
              <h2 className="text-4xl font-bold mb-4">Ready to Transform Your Setup?</h2>
              <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
                Join thousands of satisfied customers who have upgraded their tech experience with our premium products.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/categories/trending"
                  className="bg-white text-[#0D3B66] px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <span>Shop Trending</span>
                  <FaArrowRight />
                </Link>
                <Link
                  href="/about"
                  className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-[#0D3B66] transition-all duration-200"
                >
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

export default Page;