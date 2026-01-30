/**
 * GET /api/consultant-content
 * Public. Returns consultant section content for the candidate page.
 * Source: Google Sheet tab "ConsultantInfo" (Key, Value). Keys: title, description, charges, notes, disclaimer.
 */

import { NextResponse } from "next/server";
import { getConsultantContentFromSheets } from "@/lib/sheets";

export async function GET() {
  try {
    const content = await getConsultantContentFromSheets();
    return NextResponse.json(content ?? {});
  } catch (err) {
    console.error("consultant-content GET error:", err);
    return NextResponse.json({}, { status: 200 });
  }
}
