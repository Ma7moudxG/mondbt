// netlify/functions/getRewardsForStudent.ts

import { Handler, Context, APIGatewayProxyEvent } from "@netlify/functions";
import { supabaseAdmin } from "./utils/supabaseAdminClient"; // Your Supabase admin client

// Ensure this interface matches your Reward structure in Supabase
export interface RewardType {
  reward_type_id: number;
  description_en: string;
  description_ar: string;
}

export interface Reward {
  sid: number;
  student_id: number;
  reward_type_id: number;
  month_number: number;
  month: string;
  year: number;
  issued_at: string;
  performance_percentage?: string;
  description?: string;
}

const handler: Handler = async (
  event: APIGatewayProxyEvent,
  context: Context
) => {
  if (event.httpMethod !== "GET") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const studentId = event.queryStringParameters?.studentId;
  const startDateStr = event.queryStringParameters?.startDate;
  const endDateStr = event.queryStringParameters?.endDate;

  if (!studentId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Student ID is required." }),
    };
  }

  const studentIdNum = parseInt(studentId, 10);
  if (isNaN(studentIdNum)) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid Student ID provided." }),
    };
  }

  try {
    console.log(
      `[getRewardsForStudent] Attempting to fetch rewards for student ID: ${studentIdNum}`
    );

    let query = supabaseAdmin
      .from("rewards") // Replace with your actual rewards table name if different
      .select("*")
      .eq("student_id", studentIdNum);

    // Apply date filters if provided
    if (startDateStr) {
      // Ensure your 'reward_date' column in Supabase is of a timestamp type (e.g., 'timestamp with time zone')
      query = query.gte("reward_date", startDateStr);
      console.log(`[getRewardsForStudent] Applying startDate filter: >= ${startDateStr}`);
    }
    if (endDateStr) {
      query = query.lte("reward_date", endDateStr);
      console.log(`[getRewardsForStudent] Applying endDate filter: <= ${endDateStr}`);
    }

    const { data, error } = await query;

    if (error) {
      console.error("[getRewardsForStudent] Supabase fetch error:", error);
      return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }

    console.log(`[getRewardsForStudent] Successfully fetched ${data?.length || 0} rewards.`);
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    };
  } catch (apiError) {
    console.error("[getRewardsForStudent] Caught unexpected error:", apiError);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: `Server error: ${(apiError as Error).message}` }),
    };
  }
};

export { handler };