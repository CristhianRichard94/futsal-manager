import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

const PROTECTED_PREFIXES = ["/me", "/admin"];
const ADMIN_ONLY_PREFIXES = ["/admin"];
const BOOK_PAGE_PATTERN = /^\/venues\/[^/]+\/book(\/.*)?$/;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const requiresAuth =
    PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix)) ||
    BOOK_PAGE_PATTERN.test(pathname);
  if (!requiresAuth) {
    return NextResponse.next();
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const requiresAdmin = ADMIN_ONLY_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );
  if (requiresAdmin && token.role !== "venue_admin") {
    const forbiddenUrl = new URL("/403", request.url);
    return NextResponse.redirect(forbiddenUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/me/:path*", "/admin/:path*", "/venues/:id/book/:path*"],
};
