// middleware.ts (in your project root folder, next to package.json, next.config.js, src/)
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Import the 'auth' helper from your auth configuration file
// Adjust the path based on where your 'lib' folder is relative to middleware.ts
// If 'src' is at the root and 'lib' is inside 'src':
import { auth } from "@/lib/auth"; // <--- This path is typically correct

// If 'lib' is directly in the root (like 'middleware.ts'):
// import { auth } from "./lib/auth";

export default auth(async (req: NextRequest) => {
  const { pathname } = req.nextUrl;
  const session = await auth();
  if (!session?.user) {
    console.log("No session found");
  } else {
    console.log("Session user:", session.user);
  }

  // --- START MIDDLEWARE DEBUGGING LOGS ---
  console.log(`\n--- MIDDLEWARE DEBUG ---`);
  console.log(`Path: ${pathname}`);
  console.log(`Session Active: ${!!session}`);
  console.log(`Session Role: ${session?.user?.role || "N/A"}`);
  console.log(`Request URL: ${req.url}`);
  console.log(`--- END MIDDLEWARE DEBUG ---\n`);
  // --- END MIDDLEWARE DEBUGGING LOGS ---

  // 1. Allow internal Next.js paths, static files, and API routes to pass
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // 2. If user is NOT authenticated and NOT on the login page, redirect to login
  if (!session && pathname !== "/login") {
    console.log(
      `MIDDLEWARE: Redirecting unauthenticated user from ${pathname} to /login`
    );
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // 3. If user IS authenticated and on the login page, redirect to their dashboard
  if (session && pathname === "/login") {
    const role = session.user?.role;
    let redirectPath = "/dashboard";

    if (role === "admin") redirectPath = "/admin/dashboard";
    else if (role === "minister") redirectPath = "/minister/dashboard";
    else if (role === "parent") redirectPath = "/parent/dashboard";
    else if (role === "manager") redirectPath = "/manager";

    console.log(
      `MIDDLEWARE: Authenticated user (${role}) on /login, redirecting to: ${redirectPath}`
    );
    return NextResponse.redirect(new URL(redirectPath, req.url));
  }

  console.log("FULL SESSION OBJECT:", JSON.stringify(session, null, 2));
  if (session?.user) {
    console.log("USER ROLE TYPE:", typeof session.user.role);
  }

  // 4. If user is authenticated and on the root path ('/'), redirect to their role-specific dashboard
  if (session && pathname === "/") {
    const role = session.user?.role;
    let redirectPath = "/dashboard";

    if (role === "admin") redirectPath = "/admin/dashboard";
    else if (role === "minister") redirectPath = "/minister/dashboard";
    else if (role === "parent") redirectPath = "/parent/dashboard";
    else if (role === "manager") redirectPath = "/manager";

    console.log(
      `MIDDLEWARE: Authenticated user (${role}) on /, redirecting to: ${redirectPath}`
    );
    return NextResponse.redirect(new URL(redirectPath, req.url));
  }

  // 5. Prevent authenticated users from accessing unauthorized role-specific paths
  if (session && session.user?.role) {
    const role = session.user.role;
    if (!pathname.startsWith(`/${role}`)) {
      console.warn(
        `MIDDLEWARE: ⛔ Unauthorized access to ${pathname} by role ${role}, redirecting to /${role}/dashboard.`
      );
      return NextResponse.redirect(new URL(`/${role}`, req.url));
    }
  }

  // 6. Allow all other requests to proceed
  console.log(`MIDDLEWARE: ✅ Allowing access to: ${pathname}`);
  return NextResponse.next();
});

// THIS 'config' BLOCK MUST BE IN middleware.ts
export const config = {
  matcher: [
    "/((?!api|_next/static|favicon.ico|background.png|w-logo.svg|m-logo.svg).*)",
  ],
  runtime: "nodejs", // This is what tells Next.js to use the Node.js runtime for the middleware
};
