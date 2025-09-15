import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import { Product, User, ICartItem } from "@/lib/models";
import { getAuth } from "@/lib/auth";

export async function PATCH(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  await connectToDatabase();
  const auth = await getAuth();
  if (!auth || auth.role !== 'admin') return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  const { slug } = await params;
  const { name, price, category, image, discountPercentage, inStock, stockQuantity, description } = await req.json();
  const doc = await Product.findOne({ slug });
  if (!doc) return NextResponse.json({ message: 'Product not found' }, { status: 404 });
  if (name && name.trim().toLowerCase() !== doc.name.trim().toLowerCase()) {
    const existingByName = await Product.findOne({ name: { $regex: `^${name.trim()}$`, $options: 'i' } });
    if (existingByName && existingByName._id.toString() !== doc._id.toString()) {
      return NextResponse.json({ message: 'Product name already exists' }, { status: 400 });
    }
  }
  if (name != null) doc.name = String(name).trim();
  if (price != null) doc.price = Number(price);
  if (category != null) doc.category = String(category).toLowerCase().trim();
  if (image != null) doc.image = String(image).trim();
  if (discountPercentage != null) doc.discountPercentage = Number(discountPercentage);
  if (inStock != null) doc.inStock = Boolean(inStock);
  if (stockQuantity != null) doc.stockQuantity = Number(stockQuantity);
  if (description != null) doc.description = String(description).trim();
  await doc.save();
  return NextResponse.json({ 
    message: 'Product updated', 
    product: { 
      id: doc._id.toString(), 
      slug: doc.slug, 
      name: doc.name, 
      price: doc.price, 
      category: doc.category, 
      image: doc.image,
      discountPercentage: doc.discountPercentage && doc.discountPercentage > 0 ? doc.discountPercentage : undefined,
      inStock: doc.inStock,
      stockQuantity: doc.stockQuantity,
      description: doc.description
    } 
  });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  await connectToDatabase();
  const auth = await getAuth();
  if (!auth || auth.role !== 'admin') return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  const { slug } = await params;
  const product = await Product.findOne({ slug });
  if (!product) return NextResponse.json({ message: 'Product not found' }, { status: 404 });
  const productIdStr = product._id.toString();
  await Product.deleteOne({ _id: product._id });
  const users = await User.find({});
  for (const u of users) {
    u.cart = u.cart.filter((ci: ICartItem) => ci.productId !== productIdStr);
    u.wishlist = u.wishlist.filter((pid: string) => pid !== productIdStr);
    await u.save();
  }
  return NextResponse.json({ message: 'Product deleted' });
}


