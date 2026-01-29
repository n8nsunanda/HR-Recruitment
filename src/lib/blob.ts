/**
 * Vercel Blob utility: upload resume and return public URL.
 * Uses BLOB_READ_WRITE_TOKEN (set automatically when Blob store is connected in Vercel).
 */

import { put } from "@vercel/blob";

const MIME_PDF = "application/pdf";
const MIME_DOCX =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

/** Allowed resume MIME types. */
export const RESUME_MIME_TYPES = [MIME_PDF, MIME_DOCX];

export function getResumeMimeType(filename: string): string | null {
  const lower = filename.toLowerCase();
  if (lower.endsWith(".pdf")) return MIME_PDF;
  if (lower.endsWith(".docx")) return MIME_DOCX;
  return null;
}

/**
 * Uploads resume to Vercel Blob under folder "resumes/".
 * Returns the public URL for viewing/downloading.
 */
export async function uploadResumeToBlob(
  buffer: Buffer,
  filename: string,
  mimeType: string
): Promise<{ url: string }> {
  // Sanitize filename for path (avoid path traversal)
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 100);
  const pathname = `resumes/${Date.now()}-${safeName}`;

  const blob = await put(pathname, buffer, {
    access: "public",
    contentType: mimeType,
    addRandomSuffix: true,
  });

  return { url: blob.url };
}
