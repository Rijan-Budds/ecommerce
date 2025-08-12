import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Product } from "@/lib/models";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  try {
    await connectToDatabase();
    if (!q) return NextResponse.json({ products: [] });
    const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    const docs = await Product.find({ $or: [{ name: regex }, { slug: regex }, { category: regex }] }).lean();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const products = docs.map((d: any) => ({ id: d._id.toString(), slug: d.slug, name: d.name, price: d.price, category: d.category, image: d.image }));
    return NextResponse.json({ products });
  } catch (e: unknown) {
    return NextResponse.json({ products: [], error: e instanceof Error ? e.message : "Search failed" }, { status: 200 });
  }
}


