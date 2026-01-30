/**
 * Google Sheets utility: append candidate, get all candidates, update row.
 * Sheet columns (A–M): CandidateId, Name, Email, Mobile, City, Experience, Skills, ShortNote, ResumeLink, Status, HRNotes, CreatedAt, Payment
 */

import { google } from "googleapis";
import { getGoogleAuth } from "./google";
import type { CandidateRow, CandidateStatus } from "@/types/candidate";

// Tab name at the bottom of your Google Sheet (e.g. "Sheet1" or "Candidates"). Set via GOOGLE_SHEET_TAB_NAME.
function getSheetTabName(): string {
  return process.env.GOOGLE_SHEET_TAB_NAME || "Candidates";
}

function getSheetId(): string {
  const id = process.env.GOOGLE_SHEET_ID;
  if (!id) throw new Error("GOOGLE_SHEET_ID is not set");
  return id;
}

// Your sheet: A=CandidateId, B=Name, C=Email, D=Mobile, E=City, F=Experience, G=Skills, H=ShortNote, I=ResumeLink, J=Status, K=HRNotes, L=CreatedAt, M=Payment
function rowToCandidateRow(values: string[]): CandidateRow {
  return {
    candidateId: values[0] ?? "",
    name: values[1] ?? "",
    email: values[2] ?? "",
    mobile: values[3] ?? "",
    city: values[4] ?? "",
    experience: values[5] ?? "",
    skills: values[6] ?? "",
    shortNote: values[7] ?? "",
    resumeLink: values[8] ?? "",
    status: (values[9] ?? "New") as CandidateStatus,
    hrNotes: values[10] ?? "",
    createdAt: values[11] ?? "",
    payment: values[12] ?? "",
  };
}

/** Append one candidate row to the sheet (10 columns A:J). */
export async function appendCandidateToSheets(
  row: CandidateRow
): Promise<void> {
  const auth = getGoogleAuth();
  const sheets = google.sheets({ version: "v4", auth });
  const spreadsheetId = getSheetId();
  const sheetName = getSheetTabName();

  const candidateId = row.candidateId ?? `CAND-${Date.now()}`;
  const values = [
    [
      candidateId,
      row.name,
      row.email,
      row.mobile,
      row.city,
      row.experience ?? "",
      row.skills ?? "",
      row.shortNote ?? "",
      row.resumeLink,
      row.status,
      row.hrNotes,
      row.createdAt,
      row.payment ?? "",
    ],
  ];

  const range = `${sheetName}!A:M`;
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values },
  });
}

/** Get all candidate rows (skip header). */
export async function getCandidatesFromSheets(): Promise<
  { row: CandidateRow; rowIndex: number }[]
> {
  const auth = getGoogleAuth();
  const sheets = google.sheets({ version: "v4", auth });
  const spreadsheetId = getSheetId();
  const sheetName = getSheetTabName();

  const range = `${sheetName}!A:M`;
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
  });

  const rows = (res.data.values as string[][]) ?? [];
  if (rows.length === 0) return [];

  // First row is header
  const dataRows = rows.slice(1);
  return dataRows.map((values, i) => ({
    row: rowToCandidateRow(values),
    rowIndex: i + 2, // 1-based + header
  }));
}

/** Update status (J), HR notes (K), and/or payment (M) for a row by 1-based row index. */
export async function updateCandidateInSheets(
  rowIndex: number,
  updates: { status?: CandidateStatus; hrNotes?: string; payment?: string }
): Promise<void> {
  const auth = getGoogleAuth();
  const sheets = google.sheets({ version: "v4", auth });
  const spreadsheetId = getSheetId();
  const sheetName = getSheetTabName();

  const updatesList: { range: string; values: string[][] }[] = [];
  if (updates.status !== undefined) {
    updatesList.push({
      range: `${sheetName}!J${rowIndex}`,
      values: [[updates.status]],
    });
  }
  if (updates.hrNotes !== undefined) {
    updatesList.push({
      range: `${sheetName}!K${rowIndex}`,
      values: [[updates.hrNotes]],
    });
  }
  if (updates.payment !== undefined) {
    updatesList.push({
      range: `${sheetName}!M${rowIndex}`,
      values: [[updates.payment]],
    });
  }
  if (updatesList.length === 0) return;

  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId,
    requestBody: {
      valueInputOption: "USER_ENTERED",
      data: updatesList,
    },
  });
}

/** Recommendation row from the "Recommendations" tab. Columns: Author, Text, Date */
export interface RecommendationRow {
  author: string;
  text: string;
  date: string;
}

const RECOMMENDATIONS_TAB = "Recommendations";

/** Get LinkedIn-style recommendations from the "Recommendations" tab (same spreadsheet). Columns: Author, Text, Date */
export async function getRecommendationsFromSheets(): Promise<RecommendationRow[]> {
  try {
    const auth = getGoogleAuth();
    const sheets = google.sheets({ version: "v4", auth });
    const spreadsheetId = getSheetId();
    const range = `${RECOMMENDATIONS_TAB}!A:C`;
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });
    const rows = (res.data.values as string[][]) ?? [];
    if (rows.length <= 1) return [];
    const dataRows = rows.slice(1);
    return dataRows
      .map((values) => ({
        author: (values[0] ?? "").trim(),
        text: (values[1] ?? "").trim(),
        date: (values[2] ?? "").trim(),
      }))
      .filter((r) => r.text.length > 0);
  } catch {
    return [];
  }
}

/** Consultant info content from the "ConsultantInfo" tab. Columns: Key, Value */
export interface ConsultantContent {
  title: string;
  description: string;
  charges: string;
  notes: string;
  disclaimer: string;
}

const CONSULTANT_INFO_TAB = "ConsultantInfo";

/** Get consultant section content from the "ConsultantInfo" tab (same spreadsheet). Columns: Key (A), Value (B). Keys: title, description, charges, notes, disclaimer */
export async function getConsultantContentFromSheets(): Promise<ConsultantContent | null> {
  try {
    const auth = getGoogleAuth();
    const sheets = google.sheets({ version: "v4", auth });
    const spreadsheetId = getSheetId();
    const range = `${CONSULTANT_INFO_TAB}!A:B`;
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });
    const rows = (res.data.values as string[][]) ?? [];
    if (rows.length <= 1) return null;
    const dataRows = rows.slice(1);
    const map: Record<string, string> = {};
    for (const values of dataRows) {
      const key = (values[0] ?? "").trim().toLowerCase();
      const value = (values[1] ?? "").trim();
      if (key) map[key] = value;
    }
    if (Object.keys(map).length === 0) return null;
    return {
      title: map.title ?? "",
      description: map.description ?? "",
      charges: map.charges ?? "",
      notes: map.notes ?? "",
      disclaimer: map.disclaimer ?? "",
    };
  } catch {
    return null;
  }
}

/** Get the sheet's grid ID (gid) by tab name for deleteDimension. */
async function getSheetGridId(sheets: ReturnType<typeof google.sheets>, spreadsheetId: string): Promise<number> {
  const res = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: "sheets(properties(sheetId,title))",
  });
  const sheetName = getSheetTabName();
  const sheet = (res.data.sheets ?? []).find(
    (s) => (s.properties?.title ?? "") === sheetName
  );
  if (sheet?.properties?.sheetId == null) {
    throw new Error(`Sheet tab "${sheetName}" not found`);
  }
  return sheet.properties.sheetId;
}

/** Delete one candidate row from the sheet by 1-based row index. */
export async function deleteCandidateFromSheets(rowIndex: number): Promise<void> {
  const auth = getGoogleAuth();
  const sheets = google.sheets({ version: "v4", auth });
  const spreadsheetId = getSheetId();
  const sheetId = await getSheetGridId(sheets, spreadsheetId);
  // Row index is 1-based; API uses 0-based. Row 2 = index 1.
  const startIndex = rowIndex - 1;
  const endIndex = rowIndex;
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId,
              dimension: "ROWS",
              startIndex,
              endIndex,
            },
          },
        },
      ],
    },
  });
}
