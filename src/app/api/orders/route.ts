import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { User, Product, ICartItem } from "@/lib/models";
import { getAuth } from "@/lib/auth";
import { sendOrderConfirmationEmail } from "@/lib/email";

const cityFees: Record<string, number> = {
  Kathmandu: 3.5,
  Pokhara: 4.5,
  Lalitpur: 3.0,
  Bhaktapur: 3.0,
  Biratnagar: 5.0,
  Butwal: 4.0,
};

export async function GET() {
  await dbConnect();
  const auth = await getAuth();
  if (!auth || auth.role === 'admin') return NextResponse.json({ orders: [] });
  const user = await User.findById(auth.sub);
  return NextResponse.json({ orders: user.orders });
}

export async function POST(req: Request) {
  await dbConnect();
  const auth = await getAuth();
  if (!auth || auth.role === 'admin') return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const { name, email, address } = body || {};
  if (!name || !email || !address?.city) return NextResponse.json({ message: 'name, email, city are required' }, { status: 400 });
  const user = await User.findById(auth.sub);
  if (user.cart.length === 0) return NextResponse.json({ message: 'Cart is empty' }, { status: 400 });

  const ids = user.cart.map((ci: ICartItem) => ci.productId);
  const docs = ids.length ? await Product.find({ _id: { $in: ids } }).lean() : [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const productMap = new Map(docs.map((d: any) => [String(d._id), { price: d.price, name: d.name, image: d.image }]));
  const subtotal = user.cart.reduce((sum: number, ci: ICartItem) => {
    const price = productMap.get(ci.productId)?.price || 0;
    return sum + price * ci.quantity;
  }, 0);
  const deliveryFee = cityFees[address.city] ?? 5.0;
  const grandTotal = subtotal + deliveryFee;

  const newOrder = {
    items: user.cart.map((ci: ICartItem) => ({
      productId: ci.productId,
      quantity: ci.quantity,
      name: productMap.get(ci.productId)?.name,
      image: productMap.get(ci.productId)?.image,
      price: productMap.get(ci.productId)?.price,
    })),
    status: 'pending' as const,
    subtotal,
    deliveryFee,
    grandTotal,
    customer: {
      name,
      email,
      address: { street: address?.street || '', city: address.city },
    },
    createdAt: new Date(),
  };
  
  user.orders.push(newOrder);
  user.cart = [];
  await user.save();
  
  // Send order confirmation email
  const orderId = user.orders[user.orders.length - 1]._id?.toString() || Date.now().toString();
  const emailResult = await sendOrderConfirmationEmail(newOrder, orderId);
  
  if (!emailResult.success) {
    console.error('Failed to send order confirmation email:', emailResult.error);
    // Don't fail the order if email fails, but log it
  }
  
  return NextResponse.json({ 
    message: 'Order placed', 
    orders: user.orders,
    emailSent: emailResult.success 
  });
}


