/**
 * POST /api/submit-candidate
 * Multipart: fullName, email, mobile, city (optional), resume (file PDF/DOCX).
 * Uploads resume to Vercel Blob, appends row to Google Sheets.
 */

import { NextResponse } from "next/server";
import {
  uploadResumeToBlob,
  getResumeMimeType,
  RESUME_MIME_TYPES,
} from "@/lib/blob";
import { appendCandidateToSheets } from "@/lib/sheets";
import type { CandidateRow } from "@/types/candidate";

const ALLOWED_MIME = new Set(RESUME_MIME_TYPES);

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const fullName = formData.get("fullName") as string | null;
    const email = formData.get("email") as string | null;
    const mobile = formData.get("mobile") as string | null;
    const city = (formData.get("city") as string | null) ?? "";
    const file = formData.get("resume") as File | null;

    if (!fullName?.trim() || !email?.trim() || !mobile?.trim()) {
      return NextResponse.json(
        { error: "Full name, email, and mobile are required." },
        { status: 400 }
      );
    }
    if (!file || file.size === 0) {
      return NextResponse.json(
        { error: "Resume file (PDF or DOCX) is required." },
        { status: 400 }
      );
    }

    const mimeType = getResumeMimeType(file.name);
    if (!mimeType || !ALLOWED_MIME.has(mimeType)) {
      return NextResponse.json(
        { error: "Resume must be PDF or DOCX only." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const { url } = await uploadResumeToBlob(buffer, file.name, mimeType);

    const row: CandidateRow = {
      name: fullName.trim(),
      email: email.trim(),
      mobile: mobile.trim(),
      city: city.trim(),
      resumeLink: url,
      status: "New",
      hrNotes: "",
      createdAt: new Date().toISOString(),
    };
    await appendCandidateToSheets(row);

    return NextResponse.json({
      success: true,
      message: "Registration successful. We will get in touch soon.",
    });
  } catch (err) {
    console.error("submit-candidate error:", err);
    const message =
      err instanceof Error ? err.message : "Registration failed. Please try again.";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
