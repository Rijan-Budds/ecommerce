import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Product } from "@/lib/models";

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  await connectToDatabase();
  const { slug } = await params;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const doc = await Product.findOne({ slug }).lean() as any;
  if (!doc) return NextResponse.json({ message: "Not found" }, { status: 404 });
  return NextResponse.json({ product: {
    id: doc._id.toString(), slug: doc.slug, name: doc.name, price: doc.price, category: doc.category, image: doc.image,
  }});
}


