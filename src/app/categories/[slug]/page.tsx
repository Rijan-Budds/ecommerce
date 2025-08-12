import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ProductCardActions } from "@/components/ProductCardActions";
import { connectToDatabase } from "@/lib/db";
import { Product } from "@/lib/models";

async function fetchProductsByCategory(slug: string) {
  await connectToDatabase();
  const docs = await Product.find({ category: { $regex: `^${slug}$`, $options: 'i' } }).lean();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return docs.map((d: any) => ({ id: d._id.toString(), slug: d.slug, name: d.name, price: d.price, image: d.image, category: d.category }));
}

const CategoryPage = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params;
  const products = await fetchProductsByCategory(slug);

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 capitalize">{slug.replace("-", " ")}</h1>

      {products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {products.map((p: { id: string; slug: string; name: string; price: number; image: string; category: string }) => (
            <div key={p.id} className="border rounded-lg p-4 shadow bg-white dark:bg-gray-900 dark:text-white hover:shadow-lg transition-shadow">
              <Link href={`/product/${p.slug}`} passHref>
                <div className="cursor-pointer">
                  <Image
                    src={p.image}
                    alt={p.name}
                    width={300}
                    height={192}
                    className="w-full h-40 object-cover rounded mb-3"
                  />
                  <div className="font-semibold">{p.name}</div>
                  <div className="text-secondary font-bold">${p.price.toFixed(2)}</div>
                </div>
              </Link>
              <ProductCardActions productId={p.id} />
            </div>
          ))}
        </div>
      )}
    </main>
  );
};

export default CategoryPage;
