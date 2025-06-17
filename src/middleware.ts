// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  
  // Always allow auth routes and error pages
  if (pathname.startsWith("/api/auth") || pathname === "/login") {
    return NextResponse.next();
  }

  const token = await getToken({ 
    req, 
    secret: process.env.NEXTAUTH_SECRET || "default_secret" 
  });

  // Allow static files
  if (
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Redirect unauthenticated users to login
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Redirect authenticated users away from login
  if (token && pathname === "/login") {
    const role = token.role;
    let redirect = "/dashboard";
    if (role === "admin") redirect = "/admin/dashboard";
    else if (role === "minister") redirect = "/minister/dashboard";
    else if (role === "parent") redirect = "/parent/dashboard";
    else if (role === "manager") redirect = "/manager";
    return NextResponse.redirect(new URL(redirect, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};