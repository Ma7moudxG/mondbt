// src/app/api/proxy/route.ts
import { NextResponse } from "next/server";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { url, method = "GET", headers = {}, data } = body;

    if (!url) {
      return NextResponse.json({ error: "Missing target URL" }, { status: 400 });
    }

    const backendRes = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers, // allow Authorization
      },
      body: method !== "GET" ? JSON.stringify(data) : undefined,
    });

    const text = await backendRes.text();
    let responseData;
    try {
      responseData = JSON.parse(text);
    } catch {
      responseData = { raw: text };
    }

    return NextResponse.json(responseData, { status: backendRes.status });
  } catch (error: any) {
    console.error("Proxy error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
