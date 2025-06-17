import { Handler, Context, APIGatewayEvent } from '@netlify/functions';
import { supabaseAdmin } from '../../src/lib/supabase/supabaseClient'; // <-- Changed to supabaseAdmin

interface Excuse {
  id: string; // <-- ENSURE THIS IS STRING IF YOUR DB COLUMN IS TEXT/UUID
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

  // Get the ID from query parameters, e.g., /.netlify/functions/get-excuse-details-by-id?id=1
  // This 'excuseId' is already a string, which is what we want if DB ID is text.
  const excuseId = event.queryStringParameters?.id;

  if (!excuseId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Excuse ID is required.' }),
    };
  }

  try {
    // Add console logs for extreme debugging clarity
    console.log(`[getExcuseDetailsById] Function received request.`);
    console.log(`[getExcuseDetailsById] Attempting to fetch excuse details for ID: '${excuseId}' (type: ${typeof excuseId})`);

    const { data, error } = await supabaseAdmin // Or supabaseAdmin
      .from('excuses')
      .select('*')
      .eq('id', excuseId) // Pass the string ID directly
      .single();

    if (error && error.code === 'PGRST116') { // PostgreSQL error code for no rows found
      console.warn(`[getExcuseDetailsById] Excuse with ID '${excuseId}' not found (PGRST116).`);
      return { statusCode: 404, body: JSON.stringify({ error: 'Excuse not found.' }) };
    } else if (error) {
      console.error(`[getExcuseDetailsById] Supabase error fetching excuse ID '${excuseId}':`, error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: `Failed to fetch excuse: ${error.message}` }),
      };
    }

    console.log(`[getExcuseDetailsById] Successfully fetched data for ID: '${excuseId}'.`);
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data as Excuse),
    };
  } catch (apiError) {
    console.error(`[getExcuseDetailsById] API Function caught unexpected error for ID '${excuseId}':`, apiError);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: `Server error: ${(apiError as Error).message}` }),
    };
  }
};

export { handler };