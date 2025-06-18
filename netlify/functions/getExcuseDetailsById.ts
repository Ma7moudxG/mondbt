import { Handler, Context } from '@netlify/functions';
import { supabaseAdmin } from "./utils/supabaseAdminClient"; // <--- CHANGE THIS IMPORT

interface Excuse {
  id: string; // Adjusted to string as per your db.json
  student_id: number;
  parent_id: number;
  reason_id: number;
  excuse_date_g: string;
  excuse_date_h: string;
  submitted_at: string;
  remarks_en: string;
  remarks_ar: string;
  status_en: "PENDING" | "APPROVED" | "REJECTED";
  status_ar: string;
}

const handler: Handler = async (event, context) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  // Get the ID from query parameters, e.g., /.netlify/functions/get-excuse-details-by-id?id=ec58
  const excuseId = event.queryStringParameters?.id;

  if (!excuseId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Excuse ID is required.' }),
    };
  }

  try {
    console.log(`Fetching excuse details for ID: ${excuseId}`);
    const { data, error } = await supabaseAdmin // <-- Changed from supabase to supabaseAdmin
      .from('excuses')
      .select('*')
      .eq('id', excuseId)
      .single();

    if (error && error.code === 'PGRST116') { // PostgreSQL error code for no rows found
      console.warn(`Excuse with ID ${excuseId} not found.`);
      return { statusCode: 404, body: JSON.stringify({ error: 'Excuse not found.' }) };
    } else if (error) {
      console.error(`Supabase error fetching excuse ID ${excuseId}:`, error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: `Failed to fetch excuse: ${error.message}` }),
      };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data as Excuse), // Cast data to Excuse
    };
  } catch (apiError) {
    console.error(`API Function error for ID ${excuseId}:`, apiError);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: `Server error: ${(apiError as Error).message}` }),
    };
  }
};

export { handler };