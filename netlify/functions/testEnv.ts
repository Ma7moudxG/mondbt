// netlify/functions/testSupabaseConn.ts (or update testEnv.ts)
import { Handler, Context, APIGatewayEvent } from '@netlify/functions';
import { supabase } from '../../src/lib/supabase/supabaseClient'; // Adjust path if needed

const handler: Handler = async (event: APIGatewayEvent, context: Context) => {
  // No need to re-check env vars here, as your previous test confirmed them.
  // But keep the conditional check in your actual functions for robustness.

  try {
    // IMPORTANT: Replace 'your_test_table' with a small, existing table in your Supabase DB.
    // A good candidate would be 'excuses' or a simple 'profiles' table if you have one,
    // but pick one that you know for sure exists and has some data.
    const { data, error } = await supabase
      .from('excuses') // <-- REPLACE 'excuses' WITH YOUR ACTUAL TABLE NAME
      .select('id') // Just select 'id' or any single column to keep it light
      .limit(1); // Only fetch one row to confirm connectivity

    if (error) {
      console.error("Supabase query error:", error);
      // Return a 500 with error details if the query fails
      return {
        statusCode: 500,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "Failed to query Supabase table.",
          errorDetails: error.message,
          errorCode: error.code, // Supabase error codes can be helpful
        }),
      };
    }

    // If no error, the connection and query were successful
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*", // Restrict this in production
      },
      body: JSON.stringify({
        message: "Supabase connection and test query successful!",
        dataFetched: data && data.length > 0, // True if data was returned
        // If you want to see the data (for debugging only, don't return sensitive data):
        // rawData: data
      }),
    };
  } catch (e) {
    console.error("General function error during Supabase test:", e);
    // Catch any unexpected errors during function execution
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "An unexpected error occurred in the Supabase test function.",
        errorDetails: (e as Error).message,
      }),
    };
  }
};

export { handler };