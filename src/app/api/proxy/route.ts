// src/app/api/proxy/route.ts
import { NextResponse } from "next/server";

// Disable SSL verification for self-signed localhost certs
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const backendRes = await fetch("https://127.0.0.1/jwt-api-token-auth/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const text = await backendRes.text(); // get raw response
    let data;

    try {
      data = JSON.parse(text); // try JSON parse
    } catch {
      data = { raw: text }; // fallback for non-JSON
    }

    if (!backendRes.ok) {
      return NextResponse.json({ error: data }, { status: backendRes.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("Proxy error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
