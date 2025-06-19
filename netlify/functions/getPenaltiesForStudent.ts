// netlify/functions/getPenaltiesForStudent.ts

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
  // Only allow GET requests
  if (event.httpMethod !== "GET") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  // Get studentId from query parameters
  const studentIdStr = event.queryStringParameters?.studentId;

  if (!studentIdStr) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Student ID is required." }),
    };
  }

  const studentId = parseInt(studentIdStr, 10);
  if (isNaN(studentId)) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid Student ID format." }),
    };
  }

  try {
    console.log(`[getPenaltiesForStudent] Fetching penalties for student ID: ${studentId} from Supabase.`);

    // Query the 'parentPenalties' table for records linked to the studentId
    // IMPORTANT: Avoid using orderBy() in Netlify functions with Supabase if it requires an index
    // that you haven't explicitly created, as it can cause build/runtime errors.
    // Filter and sort in memory if complex sorting is needed and you don't want to manage indexes.
    const { data: penalties, error } = await supabaseAdmin
      .from("parentPenalties") // Replace with your actual table name
      .select("*") // Select all columns
      .eq("student_id", studentId); // Filter by student_id

    if (error) {
      console.error("[getPenaltiesForStudent] Supabase fetch error:", error);
      return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }

    console.log(`[getPenaltiesForStudent] Found ${penalties?.length || 0} penalties for student ID ${studentId}.`);
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(penalties || []), // Return the array of penalties (empty array if null)
    };
  } catch (apiError) {
    console.error("[getPenaltiesForStudent] Caught unexpected error:", apiError);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: `Server error: ${(apiError as Error).message}` }),
    };
  }
};

export { handler };