// netlify/functions/createExcuse.ts

import { Handler, Context, APIGatewayEvent } from '@netlify/functions';
import { supabaseAdmin } from '../../src/lib/supabase/supabaseClient'; // Ensure this path is correct
import formidable from 'formidable'; // Import formidable
import { Readable } from 'stream'; // Node.js stream for file buffer handling
import { fileURLToPath } from 'url';
import path from 'path';

// Helper to get __dirname in ES Modules (Netlify Functions are ESM by default with esbuild)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Interfaces (ensure these match your Supabase table schemas) ---
interface Excuse {
  id: string; // Assuming Supabase generates this as UUID/text
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

interface ExcuseAttachment {
  id?: string; // Supabase usually generates this
  excuse_id: string; // Foreign key to Excuse.id
  file_url: string;
  uploaded_at: string;
  file_name: string; // Original file name
  file_type: string; // Mime type
  file_size: number; // Size in bytes
}

// --- Helper function to parse multipart/form-data ---
// This handles the file upload parsing for the Netlify Function
const parseMultipartForm = (event: APIGatewayEvent) => {
  return new Promise<{ fields: formidable.Fields; files: formidable.Files }>((resolve, reject) => {
    // If body is base64 encoded (which it is for Netlify Functions POST requests)
    const body = event.isBase64Encoded ? Buffer.from(event.body || '', 'base64') : event.body;

    const form = formidable({
      multiples: false, // Expect only one file attachment per field
      keepExtensions: true, // Keep original file extensions
      maxFileSize: 5 * 1024 * 1024, // Max 5MB file size (adjust as needed)
    });

    // formidable expects a Node.js stream, convert buffer/string body to stream
    const readStream = new Readable();
    readStream.push(body);
    readStream.push(null); // Mark end of stream

    form.parse(readStream, (err, fields, files) => {
      if (err) {
        console.error("[Formidable] Error parsing form:", err);
        return reject(err);
      }
      resolve({ fields, files });
    });
  });
};

// --- Main Handler for creating an excuse ---
const handler: Handler = async (event: APIGatewayEvent, context: Context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let fields: formidable.Fields;
  let files: formidable.Files;

  try {
    // Parse the incoming multipart/form-data
    ({ fields, files } = await parseMultipartForm(event));
    console.log("[createExcuse] Parsed form fields:", fields);
    console.log("[createExcuse] Parsed form files:", files);
  } catch (error) {
    console.error("[createExcuse] Error parsing multipart form data:", error);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: `Failed to parse form data: ${(error as Error).message}` }),
    };
  }

  // Extract required fields - ensure they match your form input names
  const student_id_str = fields.studentId?.[0]; // formidable fields are arrays
  const parent_id_str = fields.parentId?.[0];
  const reason_id_str = fields.reasonId?.[0];
  const remarks_en = fields.remarksEn?.[0] || ''; // assuming one remarks field
  const remarks_ar = fields.remarksAr?.[0] || ''; // or if just one, use remarks_en
  const excuse_date_g = fields.excuseDateG?.[0];
  const excuse_date_h = fields.excuseDateH?.[0];

  // Validate required fields
  if (!student_id_str || !parent_id_str || !reason_id_str || !excuse_date_g || !excuse_date_h) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing required excuse fields.' }),
    };
  }

  const student_id = parseInt(student_id_str, 10);
  const parent_id = parseInt(parent_id_str, 10);
  const reason_id = parseInt(reason_id_str, 10);

  if (isNaN(student_id) || isNaN(parent_id) || isNaN(reason_id)) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid ID format for studentId, parentId, or reasonId.' }),
    };
  }

  // Get the file attachment if present
  const attachmentFile = files.attachmentFile?.[0]; // 'attachmentFile' is the name of your file input field

  let finalAttachmentUrl: string | undefined;
  let newAttachmentRecord: ExcuseAttachment | undefined;

  try {
    // --- Step 1: Handle attachment upload to Supabase Storage ---
    if (attachmentFile) {
      console.log("[createExcuse] Uploading attachment to Supabase Storage...");
      const filePath = `public/excuse_attachments/${Date.now()}-${attachmentFile.originalFilename}`; // Define your storage path
      const fileBuffer = await fs.promises.readFile(attachmentFile.filepath); // Read file from temp path

      const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from('excuse-attachments') // YOUR SUPABASE STORAGE BUCKET NAME
        .upload(filePath, fileBuffer, {
          contentType: attachmentFile.mimetype || 'application/octet-stream',
          upsert: false, // Set to true if you want to overwrite existing files
        });

      if (uploadError) {
        console.error("[createExcuse] Supabase Storage upload error:", uploadError);
        throw new Error(`Failed to upload attachment to storage: ${uploadError.message}`);
      }

      // Get the public URL of the uploaded file
      const { data: publicUrlData } = supabaseAdmin.storage
        .from('excuse-attachments')
        .getPublicUrl(filePath);

      finalAttachmentUrl = publicUrlData.publicUrl;
      console.log("[createExcuse] Attachment uploaded successfully, URL:", finalAttachmentUrl);
    }

    // --- Step 2: Create the excuse record in Supabase DB ---
    const now = new Date().toISOString(); // Use ISO string for consistent timestamp
    const newExcuseData: Omit<Excuse, 'id'> = { // Omit 'id' as Supabase will generate it
      student_id,
      parent_id,
      reason_id,
      excuse_date_g,
      excuse_date_h,
      submitted_at: now,
      remarks_en,
      remarks_ar,
      status_en: "PENDING",
      status_ar: "قيد المراجعة",
    };

    console.log("[createExcuse] Inserting new excuse record:", newExcuseData);
    const { data: newExcuse, error: excuseError } = await supabaseAdmin
      .from('excuses')
      .insert([newExcuseData])
      .select() // Select the newly inserted record to get its ID
      .single(); // Expecting one inserted record

    if (excuseError) {
      console.error("[createExcuse] Supabase DB excuse insert error:", excuseError);
      throw new Error(`Failed to create excuse record: ${excuseError.message}`);
    }

    console.log("[createExcuse] Excuse record created successfully:", newExcuse);

    // --- Step 3: Create the attachment record if a file was uploaded ---
    if (attachmentFile && finalAttachmentUrl && newExcuse?.id) {
      const newAttachmentData: Omit<ExcuseAttachment, 'id'> = {
        excuse_id: newExcuse.id, // Link to the newly created excuse
        file_url: finalAttachmentUrl,
        uploaded_at: now,
        file_name: attachmentFile.originalFilename || 'unnamed',
        file_type: attachmentFile.mimetype || 'application/octet-stream',
        file_size: attachmentFile.size || 0,
      };

      console.log("[createExcuse] Inserting new attachment record:", newAttachmentData);
      const { data: attachmentRecord, error: attachmentError } = await supabaseAdmin
        .from('excuseAttachments') // YOUR EXCUSE ATTACHMENTS TABLE NAME
        .insert([newAttachmentData])
        .select() // Select the newly inserted record
        .single(); // Expecting one inserted record

      if (attachmentError) {
        console.error("[createExcuse] Supabase DB attachment insert error:", attachmentError);
        // Do not throw fatal error here if excuse was created successfully.
        // Log it and proceed without attachment or return partial success.
        // For this example, we'll still throw to signify overall failure if attachment fails.
        throw new Error(`Failed to create attachment record: ${attachmentError.message}`);
      }
      newAttachmentRecord = attachmentRecord;
      console.log("[createExcuse] Attachment record created successfully:", newAttachmentRecord);
    }

    // --- Return the created excuse and attachment info ---
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        newExcuse,
        newAttachment: newAttachmentRecord,
      }),
    };

  } catch (apiError) {
    console.error("[createExcuse] API Function caught unexpected error:", apiError);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: `Server error: ${(apiError as Error).message}` }),
    };
  }
};

export { handler };