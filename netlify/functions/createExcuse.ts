// netlify/functions/createExcuse.ts

import { Handler, Context, APIGatewayProxyEvent } from '@netlify/functions'; // Use APIGatewayProxyEvent
import { supabaseAdmin } from '../../src/lib/supabase/supabaseClient'; // Ensure this path is correct
import formidable from 'formidable';
import { Readable } from 'stream';
import { readFile } from 'fs/promises'; // Import readFile directly for promise-based file reading
import path from 'path';
import { fileURLToPath } from 'url';

// Helper to get __dirname in ES Modules (Netlify Functions are ESM by default with esbuild)
// These lines are fine for ESM. The warning earlier was about the 'cjs' output format.
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
// This is adjusted to better handle how formidable expects input in a serverless context.
const parseMultipartForm = (event: APIGatewayProxyEvent) => {
  return new Promise<{ fields: formidable.Fields; files: formidable.Files }>((resolve, reject) => {
    const form = formidable({
      multiples: false,
      keepExtensions: true,
      maxFileSize: 5 * 1024 * 1024, // Max 5MB file size
      // formidable needs header and body. event.headers are sufficient.
      // The `event.body` comes in as base64 encoded for binary data in Netlify.
      // formidable handles the parsing of the stream from a request.
    });

    // Create a mock IncomingMessage as formidable expects it
    const req = new Readable() as any; // Cast to any to add properties
    req.headers = event.headers;
    req.method = event.httpMethod;
    req.url = event.path;

    // Convert base64 body to buffer and push to stream
    req.push(event.isBase64Encoded ? Buffer.from(event.body || '', 'base64') : event.body);
    req.push(null); // Mark end of stream

    form.parse(req, (err, fields, files) => {
      if (err) {
        console.error("[Formidable] Error parsing form:", err);
        return reject(err);
      }
      resolve({ fields, files });
    });
  });
};

// --- Main Handler for creating an excuse ---
const handler: Handler = async (event: APIGatewayProxyEvent, context: Context) => { // Use APIGatewayProxyEvent
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let fields: formidable.Fields;
  let files: formidable.Files;

  try {
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

  const student_id_str = fields.studentId?.[0];
  const parent_id_str = fields.parentId?.[0];
  const reason_id_str = fields.reasonId?.[0];
  const remarks_en = fields.remarksEn?.[0] || '';
  const remarks_ar = fields.remarksAr?.[0] || '';
  const excuse_date_g = fields.excuseDateG?.[0];
  const excuse_date_h = fields.excuseDateH?.[0];

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

  const attachmentFile = files.attachmentFile?.[0];

  let finalAttachmentUrl: string | undefined;
  let newAttachmentRecord: ExcuseAttachment | undefined;

  try {
    if (attachmentFile) {
      console.log("[createExcuse] Uploading attachment to Supabase Storage...");
      const filePath = `public/excuseAttachments/${Date.now()}-${attachmentFile.originalFilename}`;
      // Use readFile directly from 'fs/promises'
      const fileBuffer = await readFile(attachmentFile.filepath); 

      const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from('excuseAttachments')
        .upload(filePath, fileBuffer, {
          contentType: attachmentFile.mimetype || 'application/octet-stream',
          upsert: false,
        });

      if (uploadError) {
        console.error("[createExcuse] Supabase Storage upload error:", uploadError);
        throw new Error(`Failed to upload attachment to storage: ${uploadError.message}`);
      }

      const { data: publicUrlData } = supabaseAdmin.storage
        .from('excuseAttachments')
        .getPublicUrl(filePath);

      finalAttachmentUrl = publicUrlData.publicUrl;
      console.log("[createExcuse] Attachment uploaded successfully, URL:", finalAttachmentUrl);
    }

    const now = new Date().toISOString();
    const newExcuseData: Omit<Excuse, 'id'> = {
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
      .select()
      .single();

    if (excuseError) {
      console.error("[createExcuse] Supabase DB excuse insert error:", excuseError);
      throw new Error(`Failed to create excuse record: ${excuseError.message}`);
    }

    console.log("[createExcuse] Excuse record created successfully:", newExcuse);

    if (attachmentFile && finalAttachmentUrl && newExcuse?.id) {
      const newAttachmentData: Omit<ExcuseAttachment, 'id'> = {
        excuse_id: newExcuse.id,
        file_url: finalAttachmentUrl,
        uploaded_at: now,
        file_name: attachmentFile.originalFilename || 'unnamed',
        file_type: attachmentFile.mimetype || 'application/octet-stream',
        file_size: attachmentFile.size || 0,
      };

      console.log("[createExcuse] Inserting new attachment record:", newAttachmentData);
      const { data: attachmentRecord, error: attachmentError } = await supabaseAdmin
        .from('excuseAttachments')
        .insert([newAttachmentData])
        .select()
        .single();

      if (attachmentError) {
        console.error("[createExcuse] Supabase DB attachment insert error:", attachmentError);
        throw new Error(`Failed to create attachment record: ${attachmentError.message}`);
      }
      newAttachmentRecord = attachmentRecord;
      console.log("[createExcuse] Attachment record created successfully:", newAttachmentRecord);
    }

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