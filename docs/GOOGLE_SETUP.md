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
2. Use the **exact tab name** shown at the bottom of the sheet (e.g. **Sheet1** or **Candidates**). Set `GOOGLE_SHEET_TAB_NAME` in your env to match (e.g. `GOOGLE_SHEET_TAB_NAME=Sheet1`). If you omit it, the app assumes **Candidates**.
3. In the first row, add exactly these headers (order matters):

   | A           | B     | C     | D      | E    | F          | G      | H         | I           | J      | K        | L         | M       |
   |-------------|-------|-------|--------|------|------------|--------|-----------|-------------|--------|----------|-----------|---------|
   | CandidateId | Name  | Email | Mobile | City | Experience | Skills | ShortNote | ResumeLink  | Status | HRNotes  | CreatedAt | Payment |

   **Experience** (optional): e.g. Fresher, 0-1 years, 1-3 years. **Skills** (optional): e.g. .NET Core, SQL, React. **ShortNote** (optional): brief note ~30–40 words.

4. Share the sheet with the **Service Account email** (from the JSON: `client_email`) with **Editor** access.
5. Copy the **Sheet ID** from the URL:  
   `https://docs.google.com/spreadsheets/d/SHEET_ID/edit`
6. Set `GOOGLE_SHEET_ID=SHEET_ID` in your env.
7. Set `GOOGLE_SHEET_TAB_NAME` to the **exact** tab name (e.g. `Sheet1` or `Candidates`). If the tab is "Sheet1", use `GOOGLE_SHEET_TAB_NAME=Sheet1`.

---

## 6b. Optional: LinkedIn Recommendations (same spreadsheet)

To show LinkedIn-style recommendations on the **candidate page** (copied from your LinkedIn profile):

1. In the **same** Google Sheet, add a new tab named **Recommendations**.
2. In the first row, add headers: **Author** | **Text** | **Date** (columns A, B, C).
3. Add rows: paste recommendation text from LinkedIn, with author name and optional date.
4. The sheet is already shared with the Service Account, so the app will read this tab.
5. Optionally set **LINKEDIN_PROFILE_URL** in env to your LinkedIn profile URL – a "View on LinkedIn" link will appear.

**Note:** LinkedIn does not provide a public API to fetch recommendations. This flow uses your Google Sheet so you can copy recommendations from LinkedIn and they appear on the site.

---

## 6c. Optional: Consultant Services text (same spreadsheet)

To show **Recruitment & Interview Support – Consultant Services** content from the sheet (so you can change the text without code changes):

1. In the **same** Google Sheet, add a new tab named **ConsultantInfo**.
2. In the first row, add headers: **Key** | **Value** (columns A, B).
3. Add rows with these keys (exact names, lowercase in the app). You can put any text in the Value column. For line breaks inside a cell, either press **Enter** in the cell or type **\n** (backslash + n); the site will show them as new lines.

   | Key         | Value |
   |-------------|--------|
   | title       | Recruitment & Interview Support – Consultant Services |
   | description | I am an independent recruitment consultant. I provide interview opportunities, job referrals, CV circulation, and LinkedIn job applications support based on candidate profile and experience. |
   | charges     | Registration Fee: ₹1000 (Non-Refundable)\n₹500 → CV processing, LinkedIn job applications & lead sharing\n₹500 → Interview scheduling & negotiation support\nAfter Selection: 25% of first salary (after receiving the first salary) |
   | notes       | Charges are negotiable\nPlease check LinkedIn recommendations\nCV circulation depends on profile quality\nRegistration fee is non-refundable\nI will apply from my side, but selection depends on candidate CV |
   | disclaimer  | This fee is for my professional work effort and services. |

4. The sheet is already shared with the Service Account, so the app will read this tab.
5. If the **ConsultantInfo** tab is missing or empty, the site shows the default hardcoded consultant text.

**Tip:** Edit the Value cells in Google Sheets whenever you want to change the consultant section text on the site; no code or deploy needed.

---

## 7. Summary of Env Variables

| Variable                      | Description                                  |
|------------------------------|----------------------------------------------|
| `ADMIN_PASSWORD`             | Password for admin dashboard login           |
| `BLOB_READ_WRITE_TOKEN`      | From Vercel Blob store – **must be all caps** (auto-added on Vercel) |
| `GOOGLE_SERVICE_ACCOUNT_JSON`| Full JSON key (single line)                  |
| `GOOGLE_SHEET_ID`            | Google Sheet ID for candidate data           |
| `GOOGLE_SHEET_TAB_NAME`      | Tab name at bottom of sheet (e.g. `Sheet1` or `Candidates`). Default: Candidates |
| `LINKEDIN_PROFILE_URL`       | Optional. Your LinkedIn profile URL for "View on LinkedIn" link on candidate page |
| `LINKEDIN_RECOMMENDATIONS_JSON` | Optional. JSON array of `{author, text, date}` to show instead of Sheet tab "Recommendations" |

---

## 8. Optional: Gmail Notifications

Not implemented in this starter. To add later:

- Use a Gmail account and an [App Password](https://support.google.com/accounts/answer/185833) or OAuth2.
- Send email from an API route after candidate submission.

---

## Troubleshooting

- **Blob upload fails / "token" error:** Ensure `BLOB_READ_WRITE_TOKEN` is set. On Vercel, connect a Blob store; locally, run `vercel env pull .env.local` or copy the token from Vercel.
- **403 / Permission denied (Sheets):** Ensure the Service Account email has **Editor** access on the Google Sheet.
- **"Unable to parse range: Candidates!A:H" / 404 Sheet:** Set `GOOGLE_SHEET_TAB_NAME` to the **exact** name of the tab at the bottom of your sheet (e.g. `Sheet1` or `Candidates`). Ensure the sheet is shared with the Service Account.
- **Invalid JSON:** Ensure `GOOGLE_SERVICE_ACCOUNT_JSON` is valid JSON (prefer copy-paste from the downloaded file).
