// netlify/functions/getExcuseReasons.ts

import { Handler, Context, APIGatewayProxyEvent } from "@netlify/functions";
import { supabaseAdmin } from "./utils/supabaseAdminClient"; // Your Supabase admin client

// Make sure this interface matches your ExcuseReason structure in Supabase
export interface ExcuseReason {
  id: string;
  reason_id: number;
  code: string;
  description_en: string;
  description_ar: string;
}

const handler: Handler = async (
  event: APIGatewayProxyEvent,
  context: Context
) => {
  if (event.httpMethod !== "GET") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    console.log("[getExcuseReasons] Attempting to fetch all excuse reasons.");

    const { data, error } = await supabaseAdmin
      .from("excuseReasons") // Replace with your actual table name if different
      .select("*");

    if (error) {
      console.error("[getExcuseReasons] Supabase fetch error:", error);
      return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }

    console.log(`[getExcuseReasons] Successfully fetched ${data?.length || 0} excuse reasons.`);
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    };
  } catch (apiError) {
    console.error("[getExcuseReasons] Caught unexpected error:", apiError);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: `Server error: ${(apiError as Error).message}` }),
    };
  }
};

export { handler };