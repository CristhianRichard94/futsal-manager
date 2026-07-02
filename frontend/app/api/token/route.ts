import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import jwt from "jsonwebtoken";

import { authOptions } from "@/lib/authOptions";

// Mints a short-lived, plain HS256 JWT (contract required by the FastAPI
// backend — see backend/auth.py) from the current NextAuth session. NextAuth's
// own session cookie is an encrypted JWE and cannot be verified by the
// backend directly, so this route bridges the two.
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ token: null }, { status: 401 });
  }

  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    return NextResponse.json(
      { token: null, error: "Server misconfiguration" },
      { status: 500 }
    );
  }

  const token = jwt.sign({ email: session.user.email }, secret, {
    algorithm: "HS256",
    expiresIn: "5m",
  });

  return NextResponse.json({ token });
}
