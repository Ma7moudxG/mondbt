import { Handler, Context } from '@netlify/functions';
import { supabase } from '../../src/lib/supabase/supabaseClient';

interface ParentPenalty {
  id: string;
  student_id: number;
  amount: number;
  paid: "Y" | "N"; // Ensure this matches your Supabase column type
  description: string;
}

const handler: Handler = async (event, context) => {
  if (event.httpMethod !== 'PATCH') { // Ensure this matches the frontend method
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const penaltyId = event.queryStringParameters?.penaltyId; // Get ID from query
  // Or if sent in body: const penaltyId = JSON.parse(event.body || '{}').id;

  if (!penaltyId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Penalty ID is required.' }),
    };
  }

  let newPaidStatus: 'Y' | 'N';
  try {
    const body = JSON.parse(event.body || '{}');
    if (body.paid !== 'Y' && body.paid !== 'N') {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid new paid status. Must be "Y" or "N".' }),
      };
    }
    newPaidStatus = body.paid;
  } catch (parseError) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid JSON body or missing "paid" field.' }),
    };
  }

  try {
    console.log(`Updating penalty ID ${penaltyId} status to ${newPaidStatus}`);
    const { data, error } = await supabase
      .from('parentPenalties') // Adjust table name
      .update({ paid: newPaidStatus }) // Update only the 'paid' field
      .eq('id', penaltyId) // Filter by ID
      .select() // Select the updated row to return it
      .single(); // Expecting a single updated row

    if (error && error.code === 'PGRST116') {
      console.warn(`Penalty with ID ${penaltyId} not found for update.`);
      return { statusCode: 404, body: JSON.stringify({ error: 'Penalty not found for update.' }) };
    } else if (error) {
      console.error(`Supabase error updating penalty ID ${penaltyId}:`, error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: `Failed to update penalty: ${error.message}` }),
      };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data as ParentPenalty),
    };
  } catch (apiError) {
    console.error(`API Function error for penalty ID ${penaltyId}:`, apiError);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: `Server error: ${(apiError as Error).message}` }),
    };
  }
};

export { handler };