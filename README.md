# HR Recruitment & Consultant Website

A professional HR / Recruitment Consultant site built with **Next.js (App Router)**, **TypeScript**, and **Tailwind CSS**. Resumes are stored in **Vercel Blob** and candidate data in **Google Sheets**; no traditional database. Free to host on **Vercel**.

## Features

- **Public candidate registration** – Form with name, email, mobile, city, resume (PDF/DOCX); upload to Vercel Blob and save to Sheets
- **Consultant info & pricing** – Clear charges and disclaimer
- **PhonePe payment section** – QR code placeholder (replace with your QR)
- **Admin dashboard** – Password-protected; view candidates, update status and HR notes; data from Google Sheets
- **API routes** – `submit-candidate`, `candidates`, `update-candidate`, `admin-login`

## Tech Stack

- Next.js 15 (App Router), React 19, TypeScript
- Tailwind CSS
- Vercel Blob (resumes), Google Sheets API (Service Account)
- Vercel Serverless

## Quick Start

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Environment variables**

   Copy `.env.example` to `.env.local` and fill in:

   - `ADMIN_PASSWORD` – Admin dashboard password
   - `BLOB_READ_WRITE_TOKEN` – From Vercel Blob store (run `vercel env pull` after connecting Blob)
   - `GOOGLE_SERVICE_ACCOUNT_JSON` – Full Service Account JSON (one line)
   - `GOOGLE_SHEET_ID` – Google Sheet ID

   See [docs/GOOGLE_SETUP.md](docs/GOOGLE_SETUP.md) for Google Cloud and Vercel Blob setup.

3. **Run locally**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) for the registration page and [http://localhost:3000/admin/login](http://localhost:3000/admin/login) for the admin.

4. **Deploy to Vercel**

   See [docs/VERCEL_DEPLOYMENT.md](docs/VERCEL_DEPLOYMENT.md).

## Docs

- [Architecture](docs/ARCHITECTURE.md)
- [Folder structure](docs/FOLDER_STRUCTURE.md)
- [Google Cloud setup](docs/GOOGLE_SETUP.md)
- [Vercel deployment](docs/VERCEL_DEPLOYMENT.md)

## License

Private / use as needed.
