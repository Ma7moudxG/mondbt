// netlify/functions/get-students-by-parent-id.ts
import { Handler, Context } from '@netlify/functions';
import { supabase } from './supabaseClient';

interface Student {
  student_id: number; // Assuming this is the primary ID
  parent_id: number;
  first_name_en: string;
  last_name_en: string;
  first_name_ar: string;
  last_name_ar: string;
}

const handler: Handler = async (event, context) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const parentIdParam = event.queryStringParameters?.parentId;

  if (!parentIdParam) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Parent ID is required.' }),
    };
  }

  const parentId = parseInt(parentIdParam, 10);
  if (isNaN(parentId)) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid Parent ID format. Must be a number.' }),
    };
  }

  try {
    console.log(`Fetching students for parent ID: ${parentId}`);
    const { data, error } = await supabase
      .from('students') // Adjust table name
      .select('*')
      .eq('parent_id', parentId); // Filter by parent_id

    if (error) {
      console.error(`Supabase error fetching students for parent ID ${parentId}:`, error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: `Failed to fetch students: ${error.message}` }),
      };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data as Student[]),
    };
  } catch (apiError) {
    console.error(`API Function error for parent ID ${parentId}:`, apiError);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: `Server error: ${(apiError as Error).message}` }),
    };
  }
};

export { handler };