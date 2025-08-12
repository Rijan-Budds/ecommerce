import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/lib/models";
import { getAuth } from "@/lib/auth";

export async function PATCH(req: Request, { params }: { params: Promise<{ orderId: string }> }) {
  await connectToDatabase();
  const auth = await getAuth();
  if (!auth || auth.role !== 'admin') return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  const { orderId } = await params;
  const { status } = await req.json();
  if (!['pending', 'canceled', 'delivered'].includes(status)) return NextResponse.json({ message: 'Invalid status' }, { status: 400 });
  const users = await User.find({});
  for (const u of users) {
    const order = u.orders.id(orderId);
    if (order) {
      order.status = status;
      await u.save();
      return NextResponse.json({ message: 'Order updated' });
    }
  }
  return NextResponse.json({ message: 'Order not found' }, { status: 404 });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ orderId: string }> }) {
  await connectToDatabase();
  const auth = await getAuth();
  if (!auth || auth.role !== 'admin') return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  const { orderId } = await params;
  const users = await User.find({});
  for (const u of users) {
    const order = u.orders.id(orderId);
    if (order) {
      order.deleteOne();
      await u.save();
      return NextResponse.json({ message: 'Order deleted' });
    }
  }
  return NextResponse.json({ message: 'Order not found' }, { status: 404 });
}


