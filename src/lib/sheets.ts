/**
 * Google Sheets utility: append candidate, get all candidates, update row.
 * Sheet columns (A–I): CandidateId, Name, Email, Mobile, City, ResumeLink, Status, HRNotes, CreatedAt
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

// Your sheet: A=CandidateId, B=Name, C=Email, D=Mobile, E=City, F=ResumeLink, G=Status, H=HRNotes, I=CreatedAt
function rowToCandidateRow(values: string[]): CandidateRow {
  return {
    candidateId: values[0] ?? "",
    name: values[1] ?? "",
    email: values[2] ?? "",
    mobile: values[3] ?? "",
    city: values[4] ?? "",
    resumeLink: values[5] ?? "",
    status: (values[6] ?? "New") as CandidateStatus,
    hrNotes: values[7] ?? "",
    createdAt: values[8] ?? "",
  };
}

/** Append one candidate row to the sheet (9 columns A:I). */
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
      row.resumeLink,
      row.status,
      row.hrNotes,
      row.createdAt,
    ],
  ];

  const range = `${sheetName}!A:I`;
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

  const range = `${sheetName}!A:I`;
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

/** Update status (G) and/or HR notes (H) for a row by 1-based row index. */
export async function updateCandidateInSheets(
  rowIndex: number,
  updates: { status?: CandidateStatus; hrNotes?: string }
): Promise<void> {
  const auth = getGoogleAuth();
  const sheets = google.sheets({ version: "v4", auth });
  const spreadsheetId = getSheetId();
  const sheetName = getSheetTabName();

  const updatesList: { range: string; values: string[][] }[] = [];
  if (updates.status !== undefined) {
    updatesList.push({
      range: `${sheetName}!G${rowIndex}`,
      values: [[updates.status]],
    });
  }
  if (updates.hrNotes !== undefined) {
    updatesList.push({
      range: `${sheetName}!H${rowIndex}`,
      values: [[updates.hrNotes]],
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
