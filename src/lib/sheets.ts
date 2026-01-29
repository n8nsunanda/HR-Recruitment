/**
 * Google Sheets utility: append candidate, get all candidates, update row.
 * Sheet must have header row: Name | Email | Mobile | City | Resume Link | Status | HR Notes | Created Date
 */

import { google } from "googleapis";
import { getGoogleAuth } from "./google";
import type { CandidateRow, CandidateStatus } from "@/types/candidate";

const SHEET_NAME = "Candidates"; // or your sheet tab name

function getSheetId(): string {
  const id = process.env.GOOGLE_SHEET_ID;
  if (!id) throw new Error("GOOGLE_SHEET_ID is not set");
  return id;
}

function rowToCandidateRow(values: string[]): CandidateRow {
  return {
    name: values[0] ?? "",
    email: values[1] ?? "",
    mobile: values[2] ?? "",
    city: values[3] ?? "",
    resumeLink: values[4] ?? "",
    status: (values[5] ?? "New") as CandidateStatus,
    hrNotes: values[6] ?? "",
    createdAt: values[7] ?? "",
  };
}

/** Append one candidate row to the sheet. */
export async function appendCandidateToSheets(
  row: CandidateRow
): Promise<void> {
  const auth = getGoogleAuth();
  const sheets = google.sheets({ version: "v4", auth });
  const spreadsheetId = getSheetId();

  const values = [
    [
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

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${SHEET_NAME}!A:H`,
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

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${SHEET_NAME}!A:H`,
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

/** Update status and/or HR notes for a row by 1-based row index. */
export async function updateCandidateInSheets(
  rowIndex: number,
  updates: { status?: CandidateStatus; hrNotes?: string }
): Promise<void> {
  const auth = getGoogleAuth();
  const sheets = google.sheets({ version: "v4", auth });
  const spreadsheetId = getSheetId();

  const updatesList: { range: string; values: string[][] }[] = [];
  if (updates.status !== undefined) {
    updatesList.push({
      range: `${SHEET_NAME}!F${rowIndex}`,
      values: [[updates.status]],
    });
  }
  if (updates.hrNotes !== undefined) {
    updatesList.push({
      range: `${SHEET_NAME}!G${rowIndex}`,
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
