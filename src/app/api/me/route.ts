import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

export async function GET(req: Request) {
  const cookie = req.headers.get("cookie") || "";
  const token = cookie.split(";").map(s => s.trim()).find(s => s.startsWith("token="))?.split("=")[1];
  if (!token) return NextResponse.json({ user: null });
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { sub: string; email: string; username: string; role?: string };
    return NextResponse.json({ user: { id: payload.sub, email: payload.email, username: payload.username, role: payload.role || 'user' } });
  } catch {
    return NextResponse.json({ user: null });
  }
}


