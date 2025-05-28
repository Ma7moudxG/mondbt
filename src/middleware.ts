import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth(async (req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  console.log("🔒 Middleware triggered on:", pathname);
  console.log("🔑 Session:", session);

  // Allow login page for unauthenticated users
  if (pathname === "/login") {
    return session
      ? NextResponse.redirect(new URL(`/${session.user?.role}`, req.url))
      : NextResponse.next();
  }

  // Redirect unauthenticated users to login
  if (!session) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const role = session.user?.role;
  const rolePath = `/${role}`;

  // Redirect to role-specific dashboard if accessing root
  if (pathname === "/") {
    return NextResponse.redirect(new URL(rolePath, req.url));
  }

  // Prevent accessing other roles' dashboards
  const allowedPrefix = `/${role}`;
  if (!pathname.startsWith(allowedPrefix)) {
    console.warn(`⛔ Unauthorized access to ${pathname} by role ${role}`);
    return NextResponse.redirect(new URL(rolePath, req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/",
    "/login",
    "/:path*",
  ],
};
