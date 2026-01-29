/**
 * POST /api/admin-login
 * Body: { password: string }
 * Validates against ADMIN_PASSWORD and sets session cookie.
 */

import { NextResponse } from "next/server";
import {
  getAdminPassword,
  getAdminSessionCookie,
} from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const password = body?.password;
    const expected = getAdminPassword();
    if (password !== expected) {
      return NextResponse.json(
        { error: "Invalid password." },
        { status: 401 }
      );
    }
    const res = NextResponse.json({ success: true });
    res.headers.set("Set-Cookie", getAdminSessionCookie());
    return res;
  } catch (err) {
    console.error("admin-login error:", err);
    return NextResponse.json(
      { error: "Login failed." },
      { status: 500 }
    );
  }
}
