// netlify/functions/updatePenaltyStatus.ts

import { Handler, Context, APIGatewayProxyEvent } from "@netlify/functions";
import { supabaseAdmin } from "./utils/supabaseAdminClient"; // Your Supabase admin client

// Define the interface for the ParentPenalty structure as it exists in your Supabase 'parentPenalties' table
interface ParentPenalty {
  id: string; // Assuming UUID or string ID
  student_id: number;
  date_g: string; // Gregorian date
  date_h: string; // Hijri date
  amount: number;
  paid: "Y" | "N"; // 'Y' for paid, 'N' for not paid
  reason_en: string;
  reason_ar: string;
  // Add any other fields that are in your parentPenalties table
}

const handler: Handler = async (
  event: APIGatewayProxyEvent,
  context: Context
) => {
  // Only allow PATCH requests
  if (event.httpMethod !== "PATCH") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  // Extract penaltyId from the path parameters
  const penaltyId = event.path.split("/").pop(); // Assumes URL like /netlify/functions/updatePenaltyStatus/{penaltyId}

  if (!penaltyId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Penalty ID is required." }),
    };
  }

  // Parse the request body to get the new paid status
  let newPaidStatus: "Y" | "N";
  try {
    const { paid } = JSON.parse(event.body || "{}");
    if (paid !== "Y" && paid !== "N") {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid 'paid' status provided. Must be 'Y' or 'N'." }),
      };
    }
    newPaidStatus = paid;
  } catch (parseError) {
    console.error("[updatePenaltyStatus] Error parsing request body:", parseError);
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON body." }) };
  }

  try {
    console.log(
      `[updatePenaltyStatus] Attempting to update penalty ID ${penaltyId} status to ${newPaidStatus} in Supabase.`
    );

    // Update the 'parentPenalties' table in Supabase
    const { data, error } = await supabaseAdmin
      .from("parentPenalties") // Replace with your actual table name if different
      .update({ paid: newPaidStatus })
      .eq("id", penaltyId) // Filter by the penalty ID
      .select() // Select the updated row to return it
      .single(); // Expecting one row to be updated

    if (error) {
      console.error("[updatePenaltyStatus] Supabase update error:", error);
      return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }

    if (!data) {
      console.warn(`[updatePenaltyStatus] No penalty found with ID: ${penaltyId} to update.`);
      return { statusCode: 404, body: JSON.stringify({ error: "Penalty not found." }) };
    }

    console.log(`[updatePenaltyStatus] Successfully updated penalty ID ${penaltyId}.`);
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data), // Return the updated penalty data
    };
  } catch (apiError) {
    console.error("[updatePenaltyStatus] Caught unexpected error:", apiError);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: `Server error: ${(apiError as Error).message}` }),
    };
  }
};

export { handler };