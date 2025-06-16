// app/api/upload/route.ts or pages/api/upload.ts

import { writeFile } from 'fs/promises';
import path from 'path';

// Define the maximum file size (e.g., 5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB in bytes

export async function POST(req: Request) {
  try {
    // Check if the request body is valid (e.g., if it's a FormData instance)
    if (!req.body) {
      return new Response(JSON.stringify({ message: 'No request body found' }), { status: 400 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return new Response(JSON.stringify({ message: 'No file uploaded' }), { status: 400 });
    }

    // Basic file type validation (e.g., only images)
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return new Response(JSON.stringify({ message: 'Invalid file type. Only images (JPG, PNG, GIF, WEBP) are allowed.' }), { status: 400 });
    }

    // File size validation
    if (file.size > MAX_FILE_SIZE) {
      return new Response(JSON.stringify({ message: `File size exceeds the limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB.` }), { status: 400 });
    }

    // Read the file into a Buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Define the target directory inside public
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');

    // Generate a unique filename to prevent overwrites and provide a clear name
    // We'll use a timestamp and clean up the original name.
    const fileExtension = path.extname(file.name);
    const baseName = path.basename(file.name, fileExtension);
    const uniqueFilename = `${baseName}${fileExtension}`;
    const filePath = path.join(uploadsDir, uniqueFilename);

    // Write the file to the server's file system
    await writeFile(filePath, buffer);

    // Construct the URL that can be accessed publicly
    const fileUrl = `/uploads/${uniqueFilename}`;

    return new Response(JSON.stringify({ fileUrl }), { status: 200 });

  } catch (error) {
    console.error('File upload error:', error);
    // Provide a more generic error message to the client for security
    return new Response(JSON.stringify({ message: 'Internal server error during file upload.' }), { status: 500 });
  }
}

// For Pages Router, you would typically export a default function like this:
// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   // ... rest of the POST logic from above ...
//   // For Pages Router, you'd use req.method === 'POST' and res.status().json()
// }