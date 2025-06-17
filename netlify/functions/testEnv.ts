// netlify/functions/testEnv.ts
import { Handler, Context, APIGatewayEvent } from '@netlify/functions';
// Import the client from its new shared location
// Make sure this path is correct based on where you moved supabaseClient.ts
// For example: '../../src/lib/supabase/supabaseClient'
import { supabase } from '../../src/lib/supabase/supabaseClient'; 

const handler: Handler = async (event: APIGatewayEvent, context: Context) => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Supabase environment variables missing. This should not happen if previous test passed.",
        supabaseUrlPresent: !!supabaseUrl,
        supabaseAnonKeyPresent: !!supabaseAnonKey,
      }),
    };
  }

  try {
    // --- IMPORTANT: Replace 'excuses' with a table name you know exists in your Supabase DB. ---
    // --- Select a minimal column (e.g., 'id') and limit to 1 to reduce data transfer. ---
    const { data, error } = await supabase
      .from('excuses') // <-- Use an actual table name from your Supabase DB
      .select('id')    // <-- Select a simple column
      .limit(1);      // <-- Only retrieve one record to test connectivity

    if (error) {
      console.error("Supabase query error:", error);
      return {
        statusCode: 500,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "Failed to connect to Supabase or query table. Check credentials and RLS.",
          errorDetails: error.message,
          supabaseUrlPresent: true,
          supabaseAnonKeyPresent: true,
        }),
      }),
      body: JSON.stringify({
        message: "Failed to connect to Supabase or query table. Check credentials and RLS.",
        errorDetails: error.message,
        supabaseUrlPresent: true,
        supabaseAnonKeyPresent: true,
      }),
    };
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        message: "Supabase connection and query successful!",
        dataReceived: data ? data.length > 0 : false, // True if at least one record was found
      }),
    };
  } catch (e) {
    console.error("General function error during Supabase test:", e);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "An unexpected error occurred during Supabase test.",
        errorDetails: (e as Error).message,
        supabaseUrlPresent: true,
        supabaseAnonKeyPresent: true,
      }),
    };
  }
};

export { handler };