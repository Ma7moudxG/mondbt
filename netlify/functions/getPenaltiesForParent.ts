// netlify/functions/getPenaltiesForParent.ts

import { Handler, Context, APIGatewayEvent } from '@netlify/functions';
import { supabaseAdmin } from "./utils/supabaseAdminClient"; // <--- CHANGE THIS IMPORT

interface ParentPenalty {
  id: string;
  student_id: number;
  amount: number;
  paid: "Y" | "N";
  description: string;
}

interface Student {
  student_id: number;
  parent_id: number; // This column might not exist directly on 'students' if 'parent_students' is the linker
  first_name_en: string;
  last_name_en: string;
  first_name_ar: string;
  last_name_ar: string;
}

// You no longer need to import the local JSON file here.
// import schoolDataJson from "@/data/merged_school_data.json";
// import { MergedSchoolData } from '@/services/dataService';
// const schoolData: MergedSchoolData = schoolDataJson as MergedSchoolData; 

// --- CORRECTED HELPER FUNCTION: getStudentsByParentId (uses Supabase with two queries) ---
// This function now precisely mirrors your original two-step lookup logic using Supabase.
async function getStudentsByParentId(parentId: number): Promise<Student[]> {
  console.log(`[getStudentsByParentId Helper] Fetching student IDs from 'parent_students' for parent ID: ${parentId}.`);
  try {
    // Step 1: Query the 'parent_students' (relationship) table to get relevant student_ids
    const { data: parentStudentRelations, error: relationsError } = await supabaseAdmin
      .from('parent_students') // <<< IMPORTANT: Ensure this is the correct name of your relationship table in Supabase!
      .select('student_id')    // Select only the student_id
      .eq('parent_id', parentId);

    if (relationsError) {
      console.error(`[getStudentsByParentId Helper] Supabase error fetching parent_students relations:`, relationsError);
      throw new Error(`Failed to fetch student relations from Supabase: ${relationsError.message}`);
    }

    if (!parentStudentRelations || parentStudentRelations.length === 0) {
      console.log(`[getStudentsByParentId Helper] No student relations found for parent ID ${parentId}.`);
      return []; // No students linked to this parent, return empty array
    }

    // Extract just the student_id values into an array
    const studentIds = parentStudentRelations.map(rel => rel.student_id);
    console.log(`[getStudentsByParentId Helper] Found student IDs via relations:`, studentIds);

    // Step 2: Query the 'students' table to get the full details for these specific student_ids
    const { data: students, error: studentsError } = await supabaseAdmin
      .from('students') // <<< IMPORTANT: Ensure this is the correct name of your students table in Supabase!
      .select('*')      // Select all columns for the students
      .in('student_id', studentIds); // Use the 'in' operator to filter by multiple IDs

    if (studentsError) {
      console.error(`[getStudentsByParentId Helper] Supabase error fetching student details:`, studentsError);
      throw new Error(`Failed to fetch student details from Supabase: ${studentsError.message}`);
    }

    return (students || []) as Student[]; // Return the array of full Student objects
  } catch (error) {
    console.error(`[getStudentsByParentId Helper] Unexpected error during student data fetch:`, error);
    // Re-throw the error so it can be caught by the main handler's try/catch block
    throw error; 
  }
}
// --- END CORRECTED HELPER FUNCTION ---


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

    // Call the helper function that now fetches students from Supabase via two queries
    const parentStudents = await getStudentsByParentId(parentId); 

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

    // Fetch penalties from Supabase using the student IDs
    console.log(`[getPenaltiesForParent] Fetching penalties from 'parentPenalties' table for student IDs.`);
    const { data: penalties, error: penaltiesError } = await supabaseAdmin
      .from('parentPenalties') // Ensure this is your correct parentPenalties table name
      .select('*')
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