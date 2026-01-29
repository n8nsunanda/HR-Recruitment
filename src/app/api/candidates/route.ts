/**
 * GET /api/candidates
 * Admin only. Returns all candidates from Google Sheets.
 */

import { NextResponse } from "next/server";
import { validateAdminCookie } from "@/lib/auth";
import { getCandidatesFromSheets } from "@/lib/sheets";

export async function GET(request: Request) {
  const cookieHeader = request.headers.get("cookie");
  if (!validateAdminCookie(cookieHeader)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  try {
    const list = await getCandidatesFromSheets();
    return NextResponse.json({
      candidates: list.map(({ row, rowIndex }) => ({
        ...row,
        rowIndex,
      })),
    });
  } catch (err) {
    console.error("candidates GET error:", err);
    return NextResponse.json(
      { error: "Failed to fetch candidates." },
      { status: 500 }
    );
  }
}
