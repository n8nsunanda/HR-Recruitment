/**
 * Google Drive utility: upload resume and get a "anyone with link can view" URL.
 */

import { Readable } from "stream";
import { google } from "googleapis";
import { getGoogleAuth } from "./google";

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

export interface UploadResumeResult {
  fileId: string;
  webViewLink: string;
}

/**
 * Uploads a buffer to Google Drive in the folder specified by
 * GOOGLE_DRIVE_RESUME_FOLDER_ID. Sets sharing to "anyone with the link can view".
 */
export async function uploadResumeToDrive(
  buffer: Buffer,
  filename: string,
  mimeType: string
): Promise<UploadResumeResult> {
  const folderId = process.env.GOOGLE_DRIVE_RESUME_FOLDER_ID;
  if (!folderId) {
    throw new Error("GOOGLE_DRIVE_RESUME_FOLDER_ID is not set");
  }

  const auth = getGoogleAuth();
  const drive = google.drive({ version: "v3", auth });

  const fileMetadata = {
    name: filename,
    parents: [folderId],
  };
  const media = {
    mimeType,
    body: Readable.from(buffer),
  };

  // supportsAllDrives: true required when folder is in a Shared Drive (Service Accounts have no personal storage quota)
  const res = await drive.files.create({
    requestBody: fileMetadata,
    media,
    fields: "id, webViewLink",
    supportsAllDrives: true,
  });

  const fileId = res.data.id;
  if (!fileId) {
    throw new Error("Drive upload did not return file id");
  }

  // Allow anyone with the link to view (no sign-in). supportsAllDrives for Shared Drive files.
  await drive.permissions.create({
    fileId,
    requestBody: {
      role: "reader",
      type: "anyone",
    },
    supportsAllDrives: true,
  });

  // Prefer webViewLink for opening in browser; fallback to build view link.
  const webViewLink =
    (res.data.webViewLink as string) ||
    `https://drive.google.com/file/d/${fileId}/view`;

  return { fileId, webViewLink };
}
