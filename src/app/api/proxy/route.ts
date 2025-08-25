// src/app/api/proxy/route.ts
import { NextResponse } from "next/server";
import https from "https";

export async function POST(req: Request) {
  const body = await req.json();

  try {
    const res = await fetch("https://127.0.0.1/jwt-api-token-auth/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      // 👇 allow self-signed certificate
      agent: new https.Agent({ rejectUnauthorized: false }),
    });

    const text = await res.text(); // grab raw text in case it's not JSON
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }

    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    console.error("Proxy error:", err);
    return NextResponse.json(
      { error: err.message, stack: err.stack },
      { status: 500 }
    );
  }
}
