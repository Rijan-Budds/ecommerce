import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/lib/models";
import { getAuth } from "@/lib/auth";

export async function DELETE(_req: Request, { params }: { params: Promise<{ userId: string }> }) {
  await connectToDatabase();
  const auth = await getAuth();
  if (!auth || auth.role !== 'admin') return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  const { userId } = await params;
  if (!userId || userId === 'admin') return NextResponse.json({ message: 'Invalid userId' }, { status: 400 });
  const user = await User.findById(userId);
  if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 });
  await User.deleteOne({ _id: userId });
  return NextResponse.json({ message: 'User deleted' });
}


