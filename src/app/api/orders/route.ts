import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { User, Product } from "@/lib/models";
import { getAuth } from "@/lib/auth";

const cityFees: Record<string, number> = {
  Kathmandu: 3.5,
  Pokhara: 4.5,
  Lalitpur: 3.0,
  Bhaktapur: 3.0,
  Biratnagar: 5.0,
  Butwal: 4.0,
};

export async function GET() {
  await connectToDatabase();
  const auth = await getAuth();
  if (!auth || auth.role === 'admin') return NextResponse.json({ orders: [] });
  const user = await User.findById(auth.sub);
  return NextResponse.json({ orders: user.orders });
}

export async function POST(req: Request) {
  await connectToDatabase();
  const auth = await getAuth();
  if (!auth || auth.role === 'admin') return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const { name, email, address } = body || {};
  if (!name || !email || !address?.city) return NextResponse.json({ message: 'name, email, city are required' }, { status: 400 });
  const user = await User.findById(auth.sub);
  if (user.cart.length === 0) return NextResponse.json({ message: 'Cart is empty' }, { status: 400 });

  const ids = user.cart.map((ci: { productId: string }) => ci.productId);
  const docs = ids.length ? await Product.find({ _id: { $in: ids } }).lean() : [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const productMap = new Map(docs.map((d: any) => [d._id.toString(), { price: d.price, name: d.name, image: d.image }]));
  const subtotal = user.cart.reduce((sum: number, ci: { productId: string; quantity: number }) => {
    const price = productMap.get(ci.productId)?.price || 0;
    return sum + price * ci.quantity;
  }, 0);
  const deliveryFee = cityFees[address.city] ?? 5.0;
  const grandTotal = subtotal + deliveryFee;

  user.orders.push({
    items: user.cart.map((ci: { productId: string; quantity: number }) => ({
      productId: ci.productId,
      quantity: ci.quantity,
      name: productMap.get(ci.productId)?.name,
      image: productMap.get(ci.productId)?.image,
      price: productMap.get(ci.productId)?.price,
    })),
    status: 'pending',
    subtotal,
    deliveryFee,
    grandTotal,
    customer: {
      name,
      email,
      address: { street: address?.street || '', city: address.city },
    },
  });
  user.cart = [];
  await user.save();
  return NextResponse.json({ message: 'Order placed', orders: user.orders });
}


