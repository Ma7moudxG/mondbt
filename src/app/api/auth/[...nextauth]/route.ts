// src/app/api/auth/[...nextauth]/route.ts
import { GET, POST } from "@/lib/auth";
import NextAuth from "next-auth";
import { NextRequest, NextResponse } from "next/server";
export { GET, POST };
export const dynamic = "force-dynamic";

const handler = async (req: NextRequest, res: NextResponse) => {
  console.log("\n--- AUTH API CALL ---");
  console.log("URL:", req.url);
  console.log("METHOD:", req.method);
  
  const result = await NextAuth(authOptions).auth(req, res);
  
  console.log("AUTH RESULT STATUS:", (result as Response)?.status);
  return result;
};