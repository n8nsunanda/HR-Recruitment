/**
 * Simple admin auth: password from env, session via cookie.
 * For serverless we use a signed cookie or simple token in cookie.
 */

const ADMIN_COOKIE_NAME = "hr_admin_session";
const ADMIN_COOKIE_VALUE = "authenticated"; // In production use a signed token

export function getAdminPassword(): string {
  const p = process.env.ADMIN_PASSWORD;
  if (!p) throw new Error("ADMIN_PASSWORD is not set");
  return p;
}

/** Validate that the request is from an authenticated admin (cookie). */
export function validateAdminCookie(cookieHeader: string | null): boolean {
  if (!cookieHeader) return false;
  const cookies = Object.fromEntries(
    cookieHeader.split(";").map((c) => {
      const [k, v] = c.trim().split("=");
      return [k, v ?? ""];
    })
  );
  return cookies[ADMIN_COOKIE_NAME] === ADMIN_COOKIE_VALUE;
}

/** Cookie string to set after successful login (max-age 24h). */
export function getAdminSessionCookie(): string {
  return `${ADMIN_COOKIE_NAME}=${ADMIN_COOKIE_VALUE}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400`;
}

/** Cookie to clear session (logout). */
export function getAdminLogoutCookie(): string {
  return `${ADMIN_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`;
}
