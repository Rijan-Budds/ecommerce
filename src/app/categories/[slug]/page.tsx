import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ProductCardActions } from "@/components/ProductCardActions";
import connectToDatabase from "@/lib/db";
import { Product } from "@/lib/models";
import { FaArrowLeft } from "react-icons/fa";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

interface ProductDisplay {
  id: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  category: string;
  discountPercentage?: number;
  inStock?: boolean;
}

async function fetchProductsByCategory(slug: string): Promise<ProductDisplay[]> {
  await connectToDatabase();
  const docs = await Product.find({ category: { $regex: `^${slug}$`, $options: 'i' } }).lean();

  return docs.map((d) => ({
    id: String(d._id),
    slug: d.slug,
    name: d.name,
    price: d.price,
    image: d.image,
    category: d.category,
    discountPercentage: d.discountPercentage && d.discountPercentage > 0 ? d.discountPercentage : undefined,
    inStock: d.inStock !== false, // default to true if not set
  }));
}

const CategoryPage = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params;
  const products = await fetchProductsByCategory(slug);
  const categoryName = slug.replace("-", " ");

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
                <li className="text-gray-900 font-medium capitalize">{categoryName}</li>
              </ol>
            </nav>

            {/* Category Header */}
            <div className="text-center">
              <h1 className="text-5xl font-bold text-gray-900 mb-4 capitalize">
                {categoryName}
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Discover our premium collection of {categoryName.toLowerCase()} products.
                Quality, innovation, and style in every item.
              </p>
            </div>


          </div>

          {/* Products Section */}
          {products.length === 0 ? (
            <div className="text-center py-20">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">No Products Found</h2>
              <p className="text-gray-600 mb-6">We couldn&apos;t find any products in this category.</p>
              <Link
                href="/"
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-[#0D3B66] to-[#1E5CAF] text-white px-6 py-3 rounded-xl font-semibold hover:from-[#0D3B66]/90 hover:to-[#1E5CAF]/90 transition-all duration-200"
              >
                <FaArrowLeft className="text-sm" />
                <span>Browse All Products</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Filter Bar */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between">

                  <div className="text-sm text-gray-600">
                    Showing {products.length} product{products.length !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>

              {/* Products Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {products.map((p) => (
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
                          
                          {/* Discount Badge */}
                          {p.discountPercentage && p.discountPercentage > 0 && (
                            <div className="absolute top-4 left-4">
                              <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                                -{p.discountPercentage}%
                              </span>
                            </div>
                          )}
                          
                          {/* Stock Status Badge */}
                          {p.inStock === false && (
                            <div className="absolute top-4 right-4">
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
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CategoryPage;