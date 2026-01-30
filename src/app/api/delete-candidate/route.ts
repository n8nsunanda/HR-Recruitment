/**
 * POST /api/delete-candidate
 * Admin only. Body: { rowIndex: number }
 * Deletes the row from Google Sheets and the resume file from Vercel Blob (if any).
 */

import { del } from "@vercel/blob";
import { NextResponse } from "next/server";
import { validateAdminCookie } from "@/lib/auth";
import {
  deleteCandidateFromSheets,
  getCandidatesFromSheets,
} from "@/lib/sheets";

const BLOB_URL_PREFIX = "blob.vercel-storage.com";

export async function POST(request: Request) {
  const cookieHeader = request.headers.get("cookie");
  if (!validateAdminCookie(cookieHeader)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  try {
    const body = await request.json();
    const rowIndex = Number(body?.rowIndex);
    if (!Number.isInteger(rowIndex) || rowIndex < 2) {
      return NextResponse.json(
        { error: "Valid rowIndex is required." },
        { status: 400 }
      );
    }

    // Get candidate to find resume URL before deleting the row
    const list = await getCandidatesFromSheets();
    const candidate = list.find((c) => c.rowIndex === rowIndex);
    const resumeLink = candidate?.row.resumeLink?.trim() ?? "";

    // Delete resume from Vercel Blob if it's a blob URL
    if (resumeLink && resumeLink.includes(BLOB_URL_PREFIX)) {
      try {
        await del(resumeLink);
      } catch (blobErr) {
        console.error("delete-candidate: blob delete failed", blobErr);
        // Continue to delete the sheet row even if blob delete fails (e.g. already deleted)
      }
    }

    await deleteCandidateFromSheets(rowIndex);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("delete-candidate error:", err);
    return NextResponse.json(
      { error: "Failed to delete candidate." },
      { status: 500 }
    );
  }
}
