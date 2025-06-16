import { Handler, Context } from '@netlify/functions';
import { supabase } from './supabaseClient';

interface ParentPenalty {
  id: string;
  student_id: number;
  amount: number;
  paid: "Y" | "N";
  description: string;
}

interface Student {
  student_id: number;
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
    console.log(`Fetching students for parent ID ${parentId} to get their penalties.`);
    // Step 1: Get student IDs associated with this parent from Supabase
    const { data: students, error: studentsError } = await supabase
      .from('students') // Adjust table name
      .select('student_id') // Only select the student_id
      .eq('parent_id', parentId);

    if (studentsError) {
      console.error(`Supabase error fetching student IDs for parent ID ${parentId}:`, studentsError);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: `Failed to fetch student IDs: ${studentsError.message}` }),
      };
    }

    if (!students || students.length === 0) {
      console.log(`No students found for parent ID ${parentId}, returning no penalties.`);
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([]), // No students, so no penalties
      };
    }

    const studentIds = students.map(s => s.student_id);
    console.log(`Found student IDs for parent ${parentId}:`, studentIds);

    // Step 2: Get penalties for these student IDs
    const { data: penalties, error: penaltiesError } = await supabase
      .from('parentPenalties') // Adjust table name
      .select('*')
      .in('student_id', studentIds); // Use the 'in' operator to filter by multiple IDs

    if (penaltiesError) {
      console.error(`Supabase error fetching penalties for student IDs ${studentIds}:`, penaltiesError);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: `Failed to fetch penalties: ${penaltiesError.message}` }),
      };
    }

    console.log(`Found ${penalties?.length || 0} penalties for parent ID ${parentId}.`);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(penalties as ParentPenalty[]),
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