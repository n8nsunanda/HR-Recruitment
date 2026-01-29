/**
 * POST /api/admin-logout
 * Clears admin session cookie.
 */

import { NextResponse } from "next/server";
import { getAdminLogoutCookie } from "@/lib/auth";

export async function POST() {
  const res = NextResponse.json({ success: true });
  res.headers.set("Set-Cookie", getAdminLogoutCookie());
  return res;
}
