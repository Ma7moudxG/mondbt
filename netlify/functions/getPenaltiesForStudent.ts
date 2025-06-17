
import { Handler, Context } from '@netlify/functions';
import { supabase } from '../../src/lib/supabase/supabaseClient';

interface ParentPenalty {
  id: string; // Assuming penalty IDs are strings based on db.json
  student_id: number;
  // ... other penalty fields (e.g., amount, paid: "Y" | "N", description)
  amount: number;
  paid: "Y" | "N";
  description: string; // Example field
}

const handler: Handler = async (event, context) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const studentIdParam = event.queryStringParameters?.studentId;

  if (!studentIdParam) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Student ID is required.' }),
    };
  }

  const studentId = parseInt(studentIdParam, 10);
  if (isNaN(studentId)) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid Student ID format. Must be a number.' }),
    };
  }

  try {
    console.log(`Fetching penalties for student ID: ${studentId}`);
    const { data, error } = await supabase
      .from('parentPenalties') // Adjust table name if different in Supabase
      .select('*')
      .eq('student_id', studentId); // Filter directly by student_id

    if (error) {
      console.error(`Supabase error fetching penalties for student ID ${studentId}:`, error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: `Failed to fetch penalties: ${error.message}` }),
      };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data as ParentPenalty[]), // Cast data to array of ParentPenalty
    };
  } catch (apiError) {
    console.error(`API Function error for student ID ${studentId}:`, apiError);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: `Server error: ${(apiError as Error).message}` }),
    };
  }
};

export { handler };