import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import { Product } from "@/lib/models";

function escapeRegex(str = "") {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function GET(req: Request) {
  await connectToDatabase();
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const q = searchParams.get("q");
  
  const query: Record<string, unknown> = {};
  
  if (category) query.category = { $regex: `^${escapeRegex(category)}$`, $options: "i" };
  if (q) {
    const regex = new RegExp(escapeRegex(q), "i");
    Object.assign(query, { $or: [{ name: regex }, { slug: regex }, { category: regex }] });
  }
  
  const docs = await Product.find(query).lean();
  
  const products = docs.map((d) => ({
    id: String(d._id),
    slug: d.slug,
    name: d.name,
    price: d.price,
    category: d.category,
    image: d.image,
    discountPercentage: d.discountPercentage && d.discountPercentage > 0 ? d.discountPercentage : undefined,
    inStock: d.inStock !== false, // default to true if not set
    stockQuantity: d.stockQuantity || 0,
    description: d.description || "",
  }));
  
  return NextResponse.json({ products });
}