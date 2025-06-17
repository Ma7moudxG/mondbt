import { Handler, Context, APIGatewayEvent } from '@netlify/functions';

const handler: Handler = async (event: APIGatewayEvent, context: Context) => {
  // Access your Supabase environment variables
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  let message = "Test Function Ran!";
  let status = 200;

  if (!supabaseUrl) {
    message += " WARNING: SUPABASE_URL not found!";
    status = 500; // Indicate a problem
  }
  if (!supabaseAnonKey) {
    message += " WARNING: SUPABASE_ANON_KEY not found!";
    status = 500; // Indicate a problem
  }

  return {
    statusCode: status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*", // Be restrictive in production
    },
    body: JSON.stringify({
      status: "success",
      message: message,
      supabaseUrlPresent: !!supabaseUrl, // True if defined, false otherwise
      supabaseAnonKeyPresent: !!supabaseAnonKey,
      // DO NOT log actual keys in production! This is for debugging only.
      // supabaseUrlValue: supabaseUrl,
      // supabaseAnonKeyValue: supabaseAnonKey,
    }),
  };
};

export { handler };