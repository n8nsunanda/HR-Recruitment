/**
 * POST /api/update-candidate
 * Admin only. Body: { rowIndex: number, status?: string, hrNotes?: string }
 * Updates the row in Google Sheets.
 */

import { NextResponse } from "next/server";
import { validateAdminCookie } from "@/lib/auth";
import { updateCandidateInSheets } from "@/lib/sheets";
import type { CandidateStatus } from "@/types/candidate";

const VALID_STATUSES: CandidateStatus[] = [
  "New",
  "CV Shared",
  "Interview Scheduled",
  "Selected",
  "Rejected",
];

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
    const status =
      body.status != null && VALID_STATUSES.includes(body.status)
        ? (body.status as CandidateStatus)
        : undefined;
    const hrNotes =
      typeof body.hrNotes === "string" ? body.hrNotes : undefined;
    if (status === undefined && hrNotes === undefined) {
      return NextResponse.json(
        { error: "Provide status and/or hrNotes to update." },
        { status: 400 }
      );
    }
    await updateCandidateInSheets(rowIndex, { status, hrNotes });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("update-candidate error:", err);
    return NextResponse.json(
      { error: "Failed to update candidate." },
      { status: 500 }
    );
  }
}
