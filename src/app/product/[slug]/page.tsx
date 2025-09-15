import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import ProductActions from "./ProductActions"; // import client component
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

async function fetchProduct(slug: string) {
  try {
    // Validate slug format
    if (!slug || typeof slug !== 'string' || slug.length > 100) {
      return null
    }
    
    // Get the host from headers
    const headersList = await headers();
    const host = headersList.get('host') || 'localhost:3000';
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    
    const res = await fetch(`${protocol}://${host}/api/products/${slug}`, { cache: 'no-store' })
    
    if (!res.ok) return null
    const data = await res.json()
    return data.product as { 
      id: string; 
      name: string; 
      price: number; 
      slug: string; 
      image: string; 
      category: string;
      discountPercentage?: number;
      inStock?: boolean;
      stockQuantity: number;
      description: string;
    }
  } catch (error) {
    console.error('Error fetching product:', error)
    return null
  }
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await fetchProduct(slug);
  if (!product) return notFound();

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-6xl mx-auto px-6 py-12">
          {/* Breadcrumb */}
          <nav className="mb-8">
            <ol className="flex items-center space-x-2 text-sm text-gray-600">
              <li><Link href="/" className="hover:text-blue-600 transition-colors">Home</Link></li>
              <li>/</li>
                              <li><Link href={`/categories/${product.category}`} className="hover:text-blue-600 transition-colors capitalize">{product.category.replace('-', ' ')}</Link></li>
              <li>/</li>
              <li className="text-gray-900 font-medium">{product.name}</li>
            </ol>
          </nav>

          {/* Product Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Product Image */}
            <div className="space-y-4">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-[#0D3B66] via-[#154A8A] to-[#1E5CAF] rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                <Image
                  src={product.image}
                  alt={product.name}
                  width={800}
                  height={600}
                  className="w-full h-[500px] object-cover rounded-2xl shadow-2xl group-hover:scale-[1.02] transition-transform duration-300"
                />
                
                {/* Discount Badge */}
                {product.discountPercentage && product.discountPercentage > 0 && (
                  <div className="absolute top-4 left-4">
                    <span className="bg-red-500 text-white px-4 py-2 rounded-full text-lg font-bold">
                      -{product.discountPercentage}% OFF
                    </span>
                  </div>
                )}
                
                {/* Stock Status Badge */}
                {product.inStock === false && (
                  <div className="absolute top-4 right-4">
                    <span className="bg-gray-500 text-white px-4 py-2 rounded-full text-lg font-bold">
                      Out of Stock
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-8">
              {/* Category Badge */}
              <div className="inline-block">
                <span className="bg-gradient-to-r from-[#0D3B66] to-[#154A8A] text-white px-4 py-2 rounded-full text-sm font-medium capitalize">
                  {product.category.replace('-', ' ')}
                </span>
              </div>

              {/* Product Title */}
              <h1 className="text-4xl font-bold text-gray-900 leading-tight">
                {product.name}
              </h1>

              {/* Price */}
              <div className="flex items-baseline space-x-2">
                {product.discountPercentage && product.discountPercentage > 0 ? (
                  <>
                    <span className="text-2xl font-bold text-gray-400 line-through">
                      रु{product.price.toFixed(2)}
                    </span>
                    <span className="text-4xl font-bold bg-gradient-to-r from-[#0D3B66] to-[#1E5CAF] bg-clip-text text-transparent">
                      रु{(product.price * (1 - product.discountPercentage / 100)).toFixed(2)}
                    </span>
                  </>
                ) : (
                  <span className="text-4xl font-bold bg-gradient-to-r from-[#0D3B66] to-[#1E5CAF] bg-clip-text text-transparent">
                    रु{product.price.toFixed(2)}
                  </span>
                )}
                <span className="text-lg text-gray-500">NPR</span>
              </div>

              {/* Stock Information */}
              <div className="flex items-center space-x-4">
                <span className="text-lg font-medium text-gray-900">Stock:</span>
                {product.stockQuantity > 0 ? (
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    {product.stockQuantity} items available
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                    Out of Stock
                  </span>
                )}
              </div>

              {/* Description */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Product Description</h3>
                <p className="text-gray-700 leading-relaxed text-lg">
                  {product.description || "Experience the perfect blend of innovation and performance with this exceptional product. Designed with cutting-edge technology and premium materials, it delivers outstanding quality and reliability for all your needs."}
                </p>
              </div>



              {/* Product Actions */}
              <div className="pt-6 border-t border-gray-200">
                <ProductActions productId={product.id} />
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
