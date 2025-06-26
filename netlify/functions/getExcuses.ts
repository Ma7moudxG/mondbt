// netlify/functions/getExcuses.ts

import { Handler, Context, APIGatewayProxyEvent } from "@netlify/functions";
import { supabaseAdmin } from "./utils/supabaseAdminClient"; // Your Supabase admin client

// Define the interface for the Excuse structure as it exists in your Supabase 'excuses' table
export interface Excuse {
  id: string; // Assuming UUID or string ID for excuse
  student_id: number;
  excuse_date_g: string; // Gregorian date as YYYY-MM-DD
  excuse_date_h: string; // Hijri date
  status_en: "PENDING" | "APPROVED" | "REJECTED"; // Example statuses
  type: string; // e.g., "Medical", "Travel", "Family"
  reason_id: number; // Foreign key to a reasons table if applicable
  created_at?: string; // Optional: Supabase default timestamp
  // Add any other fields that are in your excuses table
}

const handler: Handler = async (
  event: APIGatewayProxyEvent,
  context: Context
) => {
  if (event.httpMethod !== "GET") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const { studentId, studentIds, startDate, endDate, status } = event.queryStringParameters || {};

  try {
    let query = supabaseAdmin.from("excuses").select("*"); // Replace with your actual table name

    // Case 1: Filter by a single studentId
    if (studentId) {
      const parsedStudentId = parseInt(studentId, 10);
      if (isNaN(parsedStudentId)) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: "Invalid single student ID format." }),
        };
      }
      query = query.eq("student_id", parsedStudentId);
      console.log(`[getExcuses] Fetching for single student ID: ${parsedStudentId}`);
    }
    // Case 2: Filter by multiple studentIds
    else if (studentIds) {
      const parsedStudentIds = studentIds.split(",").map(id => parseInt(id.trim(), 10));
      if (parsedStudentIds.some(isNaN)) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: "Invalid multiple student IDs format." }),
        };
      }
      query = query.in("student_id", parsedStudentIds);
      console.log(`[getExcuses] Fetching for multiple student IDs: ${parsedStudentIds.join(', ')}`);
    }
    // Case 3: Filter by status (e.g., "PENDING" for getExcuses())
    else if (status) {
      query = query.eq("status_en", status);
      console.log(`[getExcuses] Fetching for status: ${status}`);
    }
    // Fallback: If no specific filters, just fetch all (or apply a default like 'PENDING')
    // For your getExcuses() case, it implies status_en === "PENDING"
    else {
    //   query = query.eq("status_en", "PENDING"); // Default for getExcuses()
      console.log(`[getExcuses] No specific ID or status provided, defaulting to PENDING excuses.`);
    }

    // Apply date range filters if provided
    if (startDate && endDate) {
      // Assuming excuse_date_g is stored as 'YYYY-MM-DD' in Supabase
      query = query.gte("excuse_date_g", startDate);
      query = query.lte("excuse_date_g", endDate);
      console.log(`[getExcuses] Applying date range from ${startDate} to ${endDate}`);
    }

    const { data: excuses, error } = await query;

    if (error) {
      console.error("[getExcuses] Supabase fetch error:", error);
      return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }

    console.log(`[getExcuses] Found ${excuses?.length || 0} excuses.`);
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(excuses || []),
    };
  } catch (apiError) {
    console.error("[getExcuses] Caught unexpected error:", apiError);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: `Server error: ${(apiError as Error).message}` }),
    };
  }
};

export { handler };