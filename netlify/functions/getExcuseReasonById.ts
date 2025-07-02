// netlify/functions/getExcuseReasonById.ts

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

  const reasonId = event.path.split("/").pop(); // Assumes URL like /netlify/functions/getExcuseReasonById/{reasonId}

  if (!reasonId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Excuse Reason ID is required." }),
    };
  }

  try {
    console.log(`[getExcuseReasonById] Attempting to fetch excuse reason with ID: ${reasonId}`);

    const { data, error } = await supabaseAdmin
      .from("excuseReasons") // Replace with your actual table name if different
      .select("*")
      .eq("id", reasonId) // Filter by ID
      .single(); // Expecting a single result

    if (error) {
      if (error.code === 'PGRST116') { // Supabase code for "No rows found"
        console.log(`[getExcuseReasonById] Excuse Reason with ID ${reasonId} not found.`);
        return { statusCode: 404, body: JSON.stringify({ error: "Excuse reason not found." }) };
      }
      console.error("[getExcuseReasonById] Supabase fetch error:", error);
      return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }

    console.log(`[getExcuseReasonById] Successfully fetched excuse reason:`, data);
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    };
  } catch (apiError) {
    console.error("[getExcuseReasonById] Caught unexpected error:", apiError);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: `Server error: ${(apiError as Error).message}` }),
    };
  }
};

export { handler };