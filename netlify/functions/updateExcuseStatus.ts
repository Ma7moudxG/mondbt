// netlify/functions/updateExcuseStatus.ts

import { Handler, Context, APIGatewayProxyEvent } from "@netlify/functions";
import { supabaseAdmin } from "./utils/supabaseAdminClient"; // Your Supabase admin client

// Define the interface for the Excuse structure as it exists in your Supabase 'excuses' table
export interface Excuse {
  id: string; // Assuming UUID or string ID for excuse
  student_id: number;
  excuse_date_g: string; // Gregorian date as YYYY-MM-DD
  excuse_date_h: string; // Hijri date
  status_en: "PENDING" | "APPROVED" | "REJECTED";
  status_ar: "قيد المراجعة" | "مقبول" | "مرفوض"; // Add this field
  type: string;
  reason_id: number;
  created_at?: string;
  // Add any other fields that are in your excuses table
}

const handler: Handler = async (
  event: APIGatewayProxyEvent,
  context: Context
) => {
  if (event.httpMethod !== "PATCH") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const excuseId = event.path.split("/").pop(); // Assumes URL like /netlify/functions/updateExcuseStatus/{excuseId}

  if (!excuseId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Excuse ID is required." }),
    };
  }

  let updateData: { status_en: Excuse['status_en']; status_ar: Excuse['status_ar'] };
  try {
    const { status_en, status_ar } = JSON.parse(event.body || "{}");

    // Basic validation for the received statuses
    if (
      (status_en !== "PENDING" && status_en !== "APPROVED" && status_en !== "REJECTED") ||
      (status_ar !== "قيد المراجعة" && status_ar !== "مقبول" && status_ar !== "مرفوض")
    ) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid status_en or status_ar provided." }),
      };
    }
    updateData = { status_en, status_ar };
  } catch (parseError) {
    console.error("[updateExcuseStatus] Error parsing request body:", parseError);
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON body." }) };
  }

  try {
    console.log(
      `[updateExcuseStatus] Attempting to update excuse ID ${excuseId} status to:`,
      updateData
    );

    const { data, error } = await supabaseAdmin
      .from("excuses") // Replace with your actual table name if different
      .update(updateData)
      .eq("id", excuseId) // Filter by the excuse ID
      .select() // Select the updated row to return it
      .single(); // Expecting one row to be updated

    if (error) {
      console.error("[updateExcuseStatus] Supabase update error:", error);
      return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }

    if (!data) {
      console.warn(`[updateExcuseStatus] No excuse found with ID: ${excuseId} to update.`);
      return { statusCode: 404, body: JSON.stringify({ error: "Excuse not found." }) };
    }

    console.log(`[updateExcuseStatus] Successfully updated excuse ID ${excuseId}.`);
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data), // Return the updated excuse data
    };
  } catch (apiError) {
    console.error("[updateExcuseStatus] Caught unexpected error:", apiError);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: `Server error: ${(apiError as Error).message}` }),
    };
  }
};

export { handler };