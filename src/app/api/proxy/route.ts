import type { NextApiRequest, NextApiResponse } from "next";

// Disable SSL verification for localhost self-signed certs
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Forward request to your backend
    const backendRes = await fetch("https://127.0.0.1/jwt-api-token-auth/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body), // forward client body
    });

    const data = await backendRes.json();

    if (!backendRes.ok) {
      return res.status(backendRes.status).json({ error: data });
    }

    return res.status(200).json(data);
  } catch (error: any) {
    console.error("Proxy error:", error);
    return res.status(500).json({ error: error.message });
  }
}
