import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import { Product, IProduct } from "@/lib/models";

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    await connectToDatabase();
    const { slug } = await params;
    const doc = await Product.findOne({ slug }).lean() as IProduct | null;
    if (!doc) return NextResponse.json({ message: "Not found" }, { status: 404 });
    return NextResponse.json({ product: {
      id: (doc._id as { toString(): string }).toString(), 
      slug: doc.slug, 
      name: doc.name, 
      price: doc.price, 
      category: doc.category, 
      image: doc.image,
      discountPercentage: doc.discountPercentage && doc.discountPercentage > 0 ? doc.discountPercentage : undefined,
      inStock: doc.inStock !== false, // default to true if not set
      stockQuantity: doc.stockQuantity || 0,
      description: doc.description || "",
    }});
  } catch (error: unknown) {
    console.error('Error fetching product:', error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}


