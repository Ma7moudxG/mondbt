import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const pathname = req.nextUrl.pathname;

  console.log("TOKEN:", token);

  // Allow static files and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Redirect unauthenticated users
  if (!token && pathname !== "/login") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Redirect logged-in users from login page to their dashboard
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
  matcher: ["/((?!api|_next/static|favicon.ico).*)"],
};
