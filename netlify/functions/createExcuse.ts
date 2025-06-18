// netlify/functions/createExcuse.ts

import { Handler, Context, APIGatewayProxyEvent } from "@netlify/functions";
import { supabaseAdmin } from "./utils/supabaseAdminClient"; // Make sure this path is correct for your project
import formidable from "formidable"; // Ensure formidable is installed: npm install formidable
import { Readable } from "stream";
import { readFile } from "fs/promises";

// --- Interfaces (ensure these match your Supabase table schemas) ---
interface Excuse {
  id: string; // Supabase generates this as UUID/text
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
  id?: string; // Supabase usually generates this (UUID)
  excuse_id: string; // Foreign key to Excuse.id (UUID)
  file_url: string;
  uploaded_at: string;
}

// --- Helper function to parse multipart/form-data ---
// This handles the file upload from the incoming Netlify function event body.
const parseMultipartForm = (event: APIGatewayProxyEvent) => {
  return new Promise<{ fields: formidable.Fields; files: formidable.Files }>(
    (resolve, reject) => {
      const form = formidable({
        multiples: false, // Expecting single file upload for 'attachmentFile'
        keepExtensions: true, // Keep file extensions
        maxFileSize: 5 * 1024 * 1024, // Max 5MB file size
        uploadDir: "/tmp", // Crucial for Netlify Functions: temporary files are written to /tmp
      });

      // Formidable expects a Node.js IncomingMessage. Netlify's event body needs to be streamed.
      const req = new Readable() as any;
      req.headers = event.headers;
      req.method = event.httpMethod;
      req.url = event.path;

      // Convert base64 body (from Netlify event) to Buffer and push to the readable stream
      req.push(
        event.isBase64Encoded ? Buffer.from(event.body || "", "base64") : event.body
      );
      req.push(null); // Signal end of the stream

      form.parse(req, (err, fields, files) => {
        if (err) {
          console.error("[Formidable] Error parsing form:", err);
          return reject(err);
        }
        console.log("[Formidable Parse Result] Fields:", fields);
        console.log("[Formidable Parse Result] Files:", files);
        resolve({ fields, files });
      });
    }
  );
};

// --- Main Handler for creating an excuse ---
const handler: Handler = async (event: APIGatewayProxyEvent, context: Context) => {
  // Ensure the request is a POST request
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  let fields: formidable.Fields;
  let files: formidable.Files;

  // Parse the multipart form data (text fields and files)
  try {
    ({ fields, files } = await parseMultipartForm(event));
    console.log("[createExcuse] Parsed form fields:", fields);
    console.log("[createExcuse] Parsed form files:", files);
  } catch (error) {
    console.error("[createExcuse] Error parsing multipart form data:", error);
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: `Failed to parse form data: ${(error as Error).message}`,
      }),
    };
  }

  // Extract form fields, handling potential array wrapping by formidable
  const student_id_str = fields.studentId?.[0];
  const parent_id_str = fields.parentId?.[0];
  const reason_id_str = fields.reasonId?.[0];
  const remarks_en = fields.remarksEn?.[0] || "";
  const remarks_ar = fields.remarksAr?.[0] || "";
  const excuse_date_g = fields.excuseDateG?.[0];
  const excuse_date_h = fields.excuseDateH?.[0];

  // Validate required fields
  if (
    !student_id_str ||
    !parent_id_str ||
    !reason_id_str ||
    !excuse_date_g ||
    !excuse_date_h
  ) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing required excuse fields." }),
    };
  }

  // Parse numeric IDs
  const student_id = parseInt(student_id_str, 10);
  const parent_id = parseInt(parent_id_str, 10);
  const reason_id = parseInt(reason_id_str, 10);

  if (isNaN(student_id) || isNaN(parent_id) || isNaN(reason_id)) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: "Invalid ID format for studentId, parentId, or reasonId.",
      }),
    };
  }

  // Get the attachment file object (if present)
  const attachmentFile = files.attachmentFile?.[0];

  let finalAttachmentUrl: string | undefined;
  let newAttachmentRecord: ExcuseAttachment | undefined; // To hold the created attachment record

  try {
    // --- Step 1: Upload attachment to Supabase Storage if a file is provided ---
    if (attachmentFile) {
      console.log("[createExcuse] Attachment file object found. Details:", {
        originalFilename: attachmentFile.originalFilename,
        filepath: attachmentFile.filepath, // Path to the temporary file
        mimetype: attachmentFile.mimetype,
        size: attachmentFile.size,
      });

      if (!attachmentFile.filepath) {
        console.error(
          "[createExcuse] ERROR: attachmentFile.filepath is undefined AFTER formidable parsing!"
        );
        throw new Error("Missing attachment file path after upload parsing.");
      }

      console.log("[createExcuse] Uploading attachment to Supabase Storage...");
      // Define the storage path within the 'excuse-attachments' bucket
      const filePath = `public/excuse_attachments/${Date.now()}-${
        attachmentFile.originalFilename
      }`;
      // Read the temporary file into a buffer
      const fileBuffer = await readFile(attachmentFile.filepath);

      // Perform the upload to Supabase Storage
      const { data: uploadData, error: uploadError } =
        await supabaseAdmin.storage
          .from("excuse-attachments") // Your Supabase Storage bucket name
          .upload(filePath, fileBuffer, {
            contentType: attachmentFile.mimetype || "application/octet-stream",
            upsert: false, // Do not overwrite existing files with the same name
          });

      if (uploadError) {
        console.error(
          "[createExcuse] Supabase Storage upload error:",
          uploadError
        );
        throw new Error(
          `Failed to upload attachment to storage: ${uploadError.message}`
        );
      }

      // Get the public URL for the uploaded file
      const { data: publicUrlData } = supabaseAdmin.storage
        .from("excuse-attachments")
        .getPublicUrl(filePath);

      finalAttachmentUrl = publicUrlData.publicUrl;
      console.log(
        "[createExcuse] Attachment uploaded successfully, URL:",
        finalAttachmentUrl
      );
    }

    // --- Step 2: Insert the new excuse record into the 'excuses' table ---
    const now = new Date().toISOString();
    const newExcuseData: Omit<Excuse, "id"> = { // Omit 'id' as Supabase will generate it
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
      .from("excuses")
      .insert([newExcuseData])
      .select() // Select the newly inserted row
      .single(); // Expecting one row back

    if (excuseError) {
      console.error(
        "[createExcuse] Supabase DB excuse insert error:",
        excuseError
      );
      throw new Error(`Failed to create excuse record: ${excuseError.message}`);
    }

    console.log(
      "[createExcuse] Excuse record created successfully:",
      newExcuse // This object includes the Supabase-generated UUID for 'id'
    );

    // --- Step 3: Insert attachment record into 'excuseAttachments' table if file was uploaded ---
    if (attachmentFile && finalAttachmentUrl && newExcuse?.id) {
      const newAttachmentData: Omit<ExcuseAttachment, "id"> = { // Omit 'id' for attachment, as DB generates
        excuse_id: newExcuse.id, // Use the UUID from the newly created excuse
        file_url: finalAttachmentUrl,
        uploaded_at: now,
      };

      console.log("[createExcuse] Inserting new attachment record:", newAttachmentData);
      const { data: attachmentRecord, error: attachmentError } =
        await supabaseAdmin
          .from("excuseAttachments")
          .insert([newAttachmentData])
          .select() // Select the newly inserted row
          .single(); // Expecting one row back

      if (attachmentError) {
        console.error(
          "[createExcuse] Supabase DB attachment insert error:",
          attachmentError
        );
        throw new Error(
          `Failed to create attachment record: ${attachmentError.message}`
        );
      }
      newAttachmentRecord = attachmentRecord; // Store the newly created attachment record
      console.log(
        "[createExcuse] Attachment record created successfully:",
        newAttachmentRecord
      );
    }

    // --- Final Response: Return the newly created excuse and attachment records ---
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        newExcuse, // Contains the UUID of the newly created excuse
        newAttachment: newAttachmentRecord, // Contains details of the newly created attachment
      }),
    };
  } catch (apiError) {
    console.error(
      "[createExcuse] API Function caught unexpected error:",
      apiError
    );
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: `Server error: ${(apiError as Error).message}`,
      }),
    };
  }
};

export { handler };