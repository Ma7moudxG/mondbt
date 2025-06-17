import { Handler, Context, APIGatewayEvent } from '@netlify/functions';
import { supabaseAdmin } from '../../src/lib/supabase/supabaseClient'; // Using supabaseAdmin for backend functions

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

// --- NEW HELPER FUNCTION: getStudentsByParentId (now uses Supabase) ---
// This replaces the old 'this.getStudentsByParentId' method from your DataService
async function getStudentsByParentId(parentId: number): Promise<Student[]> {
  console.log(`[getStudentsByParentId Helper] Fetching students for parent ID: ${parentId} from Supabase.`);
  try {
    const { data: students, error } = await supabaseAdmin
      .from('students') // Ensure this is your correct 'students' table name
      .select('*') // Select all student details
      .eq('parent_id', parentId);

    if (error) {
      console.error(`[getStudentsByParentId Helper] Supabase error fetching students:`, error);
      throw new Error(`Failed to fetch students: ${error.message}`);
    }

    return (students || []) as Student[];
  } catch (error) {
    console.error(`[getStudentsByParentId Helper] Unexpected error:`, error);
    throw error; // Re-throw to be caught by the main handler's try/catch
  }
}
// --- END NEW HELPER FUNCTION ---


const handler: Handler = async (event: APIGatewayEvent, context: Context) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const parentIdParam = event.queryStringParameters?.parentId;

  if (!parentIdParam) {
    console.warn('[getPenaltiesForParent] Parent ID is required.');
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Parent ID is required.' }),
    };
  }

  const parentId = parseInt(parentIdParam, 10);
  if (isNaN(parentId)) {
    console.warn(`[getPenaltiesForParent] Invalid Parent ID format: '${parentIdParam}'. Must be a number.`);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid Parent ID format. Must be a number.' }),
    };
  }

  try {
    console.log(`[getPenaltiesForParent] Starting main handler for parent ID: ${parentId}.`);

    // --- This part is kept as similar as possible to your request ---
    // Now calling our new helper function instead of 'this.getStudentsByParentId'
    const parentStudents = await getStudentsByParentId(parentId); // Added 'await' as helper is async

    if (!parentStudents || parentStudents.length === 0) {
      console.log(`[getPenaltiesForParent] No students found for parent ID ${parentId}, returning no penalties.`);
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([]), // No students, so no penalties
      };
    }

    const studentIdStrings = new Set(
      parentStudents.map((student) => String(student.student_id))
    );
    console.log(`[getPenaltiesForParent] Converted student IDs to set of strings:`, Array.from(studentIdStrings));
    // --- End of part kept similar ---

    // --- CHANGED: Fetch penalties from Supabase (instead of JSON_SERVER_BASE_URL) ---
    console.log(`[getPenaltiesForParent] Fetching penalties from 'parentPenalties' table for student IDs.`);
    const { data: penalties, error: penaltiesError } = await supabaseAdmin
      .from('parentPenalties') // Ensure this is your correct parentPenalties table name
      .select('*')
      // Use Array.from(Set) to convert the Set of strings to an array for the .in() operator
      .in('student_id', Array.from(studentIdStrings)); 

    if (penaltiesError) {
      console.error(`[getPenaltiesForParent] Supabase error fetching penalties for student IDs ${Array.from(studentIdStrings)}:`, penaltiesError);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: `Failed to fetch penalties: ${penaltiesError.message}` }),
      };
    }

    console.log(`[getPenaltiesForParent] Found ${penalties?.length || 0} penalties for parent ID ${parentId}.`);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(penalties as ParentPenalty[]),
    };

  } catch (apiError) {
    console.error(`[getPenaltiesForParent] API Function caught unexpected error for parent ID ${parentId}:`, apiError);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: `Server error: ${(apiError as Error).message}` }),
    };
  }
};

export { handler };