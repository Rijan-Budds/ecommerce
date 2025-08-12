import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { AuthUser } from "./types";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

interface JWTPayload {
  sub: string;
  email: string;
  username: string;
  role?: string;
}

export async function getAuth(): Promise<JWTPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;
  try {
    const payload = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return payload;
  } catch {
    return null;
  }
}

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}


