/**
 * GET /api/recommendations
 * Public. Returns LinkedIn-style recommendations for the candidate page.
 * Source: Google Sheet tab "Recommendations" (Author, Text, Date), or env LINKEDIN_RECOMMENDATIONS_JSON.
 */

import { NextResponse } from "next/server";
import { getRecommendationsFromSheets } from "@/lib/sheets";

export async function GET() {
  try {
    // Optional: use env JSON instead of sheet (e.g. [{"author":"Name","text":"Quote","date":""}])
    const envJson = process.env.LINKEDIN_RECOMMENDATIONS_JSON;
    if (envJson) {
      try {
        const parsed = JSON.parse(envJson) as { author?: string; text?: string; date?: string }[];
        const list = Array.isArray(parsed)
          ? parsed
            .map((r) => ({
              author: (r.author ?? "").trim(),
              text: (r.text ?? "").trim(),
              date: (r.date ?? "").trim(),
            }))
            .filter((r) => r.text.length > 0)
          : [];
        return NextResponse.json({
          recommendations: list,
          linkedInProfileUrl: process.env.LINKEDIN_PROFILE_URL ?? null,
        });
      } catch {
        // Fall through to sheet
      }
    }

    const recommendations = await getRecommendationsFromSheets();
    const linkedInProfileUrl = process.env.LINKEDIN_PROFILE_URL ?? null;

    return NextResponse.json({
      recommendations,
      linkedInProfileUrl,
    });
  } catch (err) {
    console.error("recommendations GET error:", err);
    return NextResponse.json(
      { recommendations: [], linkedInProfileUrl: null },
      { status: 200 }
    );
  }
}
