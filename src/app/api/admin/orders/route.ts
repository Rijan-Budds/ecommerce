import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/lib/models";
import { getAuth } from "@/lib/auth";
import { Order, User as UserType } from "@/lib/types";

interface LeanUser extends Omit<UserType, '_id'> {
  _id: string | { toString(): string };
  orders?: Order[];
}

interface LeanOrder extends Omit<Order, '_id'> {
  _id: string | { toString(): string };
}

export async function GET() {
  await connectToDatabase();
  const auth = await getAuth();
  if (!auth || auth.role !== 'admin') return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  const users = await User.find({}).lean() as unknown as LeanUser[];
  const allOrders: Array<{
    orderId: string;
    userId: string;
    username: string;
    email: string;
    status: Order['status'];
    createdAt: Date;
    subtotal: number;
    deliveryFee: number;
    grandTotal: number;
    customer: Order['customer'];
    items: Order['items'];
  }> = [];
  
  for (const u of users) {
    (u.orders || []).forEach((o: LeanOrder) => {
      allOrders.push({
        orderId: o._id?.toString() || '',
        userId: u._id.toString(),
        username: u.username,
        email: u.email,
        status: o.status,
        createdAt: o.createdAt,
        subtotal: o.subtotal,
        deliveryFee: o.deliveryFee,
        grandTotal: o.grandTotal,
        customer: o.customer,
        items: o.items,
      });
    });
  }
  return NextResponse.json({ orders: allOrders });
}


