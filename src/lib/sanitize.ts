/**
 * Sanitize optional text fields (shortNote, skills) for safe storage in the sheet.
 * Enforces max length and strips HTML, URLs, file paths, and other unsafe content.
 */

export const MAX_SHORT_NOTE = 300;
export const MAX_SKILLS = 200;

/**
 * Strip HTML tags.
 */
function stripHtml(s: string): string {
  return s.replace(/<[^>]*>/g, "");
}

/**
 * Remove URL-like strings (http://, https://, ftp://, www.).
 */
function stripUrls(s: string): string {
  return s
    .replace(/https?:\/\/[^\s]*/gi, "")
    .replace(/ftp:\/\/[^\s]*/gi, "")
    .replace(/\bwww\.[^\s]*/gi, "");
}

/**
 * Remove file-path-like strings (Windows: C:\, D:\, Unix: /path, \path, and paths ending in image/file extensions).
 */
function stripPaths(s: string): string {
  // Windows drive paths: C:\, D:\something
  let out = s.replace(/\b[A-Za-z]:\\[^\s]*/g, "");
  // Unix/URL paths starting with / or \ (e.g. /images/foo.png, \uploads\file.pdf)
  out = out.replace(/[/\\][^\s]*(?:\.(?:png|jpg|jpeg|gif|svg|webp|bmp|ico|pdf|docx?))(?:\s|$)/gi, "");
  // Any remaining path-like token with a file extension (e.g. "file.png" as word)
  out = out.replace(/\b[^\s]*(?:\.(?:png|jpg|jpeg|gif|svg|webp|bmp|ico|pdf|docx?))(?=\s|$)/gi, "");
  return out;
}

/**
 * Normalize whitespace: trim and collapse multiple spaces/newlines to single space.
 */
function normalizeWhitespace(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}

/**
 * Sanitize a text field for storage: strip HTML, URLs, paths, enforce max length.
 * Returns the sanitized string (may be empty).
 */
export function sanitizeTextForSheet(value: string, maxLength: number): string {
  if (typeof value !== "string") return "";
  let s = value;
  s = stripHtml(s);
  s = stripUrls(s);
  s = stripPaths(s);
  s = normalizeWhitespace(s);
  return s.slice(0, maxLength);
}
