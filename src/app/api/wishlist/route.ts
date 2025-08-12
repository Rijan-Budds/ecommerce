import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { User, Product } from "@/lib/models";
import { getAuth } from "@/lib/auth";
import mongoose from "mongoose";

export async function GET() {
  await connectToDatabase();
  const auth = await getAuth();
  if (!auth || auth.role === 'admin') return NextResponse.json({ items: [] });
  const user = await User.findById(auth.sub);
  const ids = (user?.wishlist || [])
    .filter(Boolean)
    .filter((id: string) => mongoose.Types.ObjectId.isValid(id))
    .map((id: string) => new mongoose.Types.ObjectId(id));
  if (ids.length === 0) return NextResponse.json({ items: [] });
  const docs = await Product.find({ _id: { $in: ids } }).lean();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const items = docs.map((d: any) => ({ id: d._id.toString(), slug: d.slug, name: d.name, price: d.price, category: d.category, image: d.image }));
  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  await connectToDatabase();
  const auth = await getAuth();
  if (!auth || auth.role === 'admin') return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const productId = body?.productId as string;
  if (!productId) return NextResponse.json({ message: 'productId required' }, { status: 400 });
  const user = await User.findById(auth.sub);
  const index = user.wishlist.indexOf(productId);
  if (index >= 0) user.wishlist.splice(index, 1); else user.wishlist.push(productId);
  await user.save();
  return NextResponse.json({ wishlist: user.wishlist });
}


