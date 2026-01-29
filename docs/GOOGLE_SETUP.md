# Google Cloud & Vercel Blob Setup for HR Recruitment

- **Resumes** → stored in **Vercel Blob** (no Google Drive needed).
- **Candidate data** → stored in **Google Sheets** (Service Account).

---

## 1. Vercel Blob – Resume Storage

Resumes are uploaded to Vercel Blob. Works with **personal Gmail**; no Google Workspace required.

### On Vercel (after you deploy or in your Vercel project)

1. Open your project on [vercel.com](https://vercel.com) → **Storage** tab.
2. Click **Connect Database / Create Database** → choose **Blob**.
3. Create a new Blob store (e.g. name it `hr-resumes`).
4. Vercel will add **BLOB_READ_WRITE_TOKEN** to your project env automatically.

### Local development

1. Install [Vercel CLI](https://vercel.com/docs/cli): `npm i -g vercel`
2. Link the project: `vercel link` (in your project folder).
3. Pull env vars (includes the Blob token): `vercel env pull .env.local`

Or copy **BLOB_READ_WRITE_TOKEN** from Vercel Dashboard → Project → Settings → Environment Variables and add it to `.env.local`.

---

## 2. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Click **Select a project** → **New Project**.
3. Name it (e.g. `hr-recruitment`) and click **Create**.

---

## 3. Enable Google Sheets API

1. In the project, go to **APIs & Services** → **Library**.
2. Search for **Google Sheets API** → **Enable**.  
   (You do **not** need Google Drive API for this app.)

---

## 4. Create a Service Account

1. Go to **APIs & Services** → **Credentials**.
2. Click **Create Credentials** → **Service account**.
3. Name it (e.g. `hr-recruitment-bot`) → **Create and Continue**.
4. Skip optional steps → **Done**.
5. Open the created service account → **Keys** tab.
6. **Add Key** → **Create new key** → **JSON** → **Create**.  
   A JSON file will download. **Keep it secret.**

---

## 5. Use the Service Account JSON in the App

- Paste the **entire** JSON content into `GOOGLE_SERVICE_ACCOUNT_JSON` in your environment variables (e.g. `.env.local`). You can minify it to one line.
- On Vercel: **Settings** → **Environment Variables** → add `GOOGLE_SERVICE_ACCOUNT_JSON` with the JSON value.

---

## 6. Google Sheet – Candidate Data

1. Create a new Google Sheet.
2. Rename the first tab to **Candidates** (or change `SHEET_NAME` in `src/lib/sheets.ts` to match).
3. In the first row, add exactly these headers (order matters):

   | A     | B     | C      | D    | E            | F      | G        | H            |
   |-------|-------|--------|------|--------------|--------|----------|--------------|
   | Name  | Email | Mobile | City | Resume Link  | Status | HR Notes | Created Date |

4. Share the sheet with the **Service Account email** (from the JSON: `client_email`) with **Editor** access.
5. Copy the **Sheet ID** from the URL:  
   `https://docs.google.com/spreadsheets/d/SHEET_ID/edit`
6. Set `GOOGLE_SHEET_ID=SHEET_ID` in your env.

---

## 7. Summary of Env Variables

| Variable                      | Description                                  |
|------------------------------|----------------------------------------------|
| `ADMIN_PASSWORD`             | Password for admin dashboard login           |
| `BLOB_READ_WRITE_TOKEN`      | From Vercel Blob store (auto-added on Vercel)|
| `GOOGLE_SERVICE_ACCOUNT_JSON`| Full JSON key (single line)                  |
| `GOOGLE_SHEET_ID`            | Google Sheet ID for candidate data           |

---

## 8. Optional: Gmail Notifications

Not implemented in this starter. To add later:

- Use a Gmail account and an [App Password](https://support.google.com/accounts/answer/185833) or OAuth2.
- Send email from an API route after candidate submission.

---

## Troubleshooting

- **Blob upload fails / "token" error:** Ensure `BLOB_READ_WRITE_TOKEN` is set. On Vercel, connect a Blob store; locally, run `vercel env pull .env.local` or copy the token from Vercel.
- **403 / Permission denied (Sheets):** Ensure the Service Account email has **Editor** access on the Google Sheet.
- **404 Sheet:** Check that the tab name is **Candidates** (or matches `SHEET_NAME` in code) and the sheet is shared with the SA.
- **Invalid JSON:** Ensure `GOOGLE_SERVICE_ACCOUNT_JSON` is valid JSON (prefer copy-paste from the downloaded file).
