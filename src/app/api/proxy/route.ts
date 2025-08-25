// src/app/api/proxy/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();

  try {
    // Forward request to your local backend
    const res = await fetch("https://127.0.0.1/jwt-api-token-auth/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      // Disable SSL check (self-signed cert) 👇
      agent: new (require("https").Agent)({ rejectUnauthorized: false }),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
