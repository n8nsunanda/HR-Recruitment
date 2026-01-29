# HR Recruitment Website – Architecture Overview

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           VERCEL (Hosting)                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│  Next.js App Router                                                          │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────────────┐  │
│  │ Public Pages     │  │ API Routes       │  │ Admin (Protected)        │  │
│  │ /                │  │ /api/*           │  │ /admin/*                 │  │
│  │ - Registration   │  │ - submit-candidate│  │ - Login                  │  │
│  │ - Consultant Info │  │ - candidates     │  │ - Dashboard              │  │
│  │ - PhonePe QR     │  │ - update-candidate│  │ - Candidate table        │  │
│  └────────┬─────────┘  │ - admin-login    │  └────────────┬─────────────┘  │
│           │             └────────┬─────────┘               │                 │
│           │                      │                          │                 │
│           └──────────────────────┼──────────────────────────┘                 │
│                                  ▼                                            │
│  ┌───────────────────────────────────────────────────────────────────────┐   │
│  │  Serverless Lib (src/lib/)                                             │   │
│  │  - getGoogleAuth() → Service Account JWT                               │   │
│  │  - uploadResumeToBlob() → Vercel Blob                                  │   │
│  │  - appendCandidateToSheets() / getCandidates() / updateCandidate()     │   │
│  └───────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  Vercel Blob + Google Cloud (FREE tier)                                      │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────────┐  │
│  │ Vercel Blob     │  │ Google Sheets   │  │ Service Account             │  │
│  │ - Resumes       │  │ - Candidate     │  │ - No user OAuth             │  │
│  │ - PDF/DOCX      │  │   data (CRUD)   │  │ - Server-to-server only     │  │
│  │ - Public URL    │  │ - Status, Notes │  │ - Keys in env (Vercel)      │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Data Flow

### Candidate Registration
1. User fills form on `/` → POST `/api/submit-candidate` (multipart: fields + file).
2. API: validate file (PDF/DOCX), get Google auth, upload file to Drive, set sharing to "anyone with link".
3. API: append row to Google Sheet (name, email, mobile, city, resume link, status=New, notes=empty, created date).
4. Response: success message; errors returned with status 4xx/5xx.

### Admin Dashboard
1. Admin visits `/admin` → redirect to `/admin/login` if no session.
2. POST `/api/admin-login` with password → compare with `ADMIN_PASSWORD`; set HTTP-only cookie or return token (stored in memory for demo).
3. GET `/api/candidates` (with auth) → read Google Sheet, return JSON.
4. POST `/api/update-candidate` (with auth) → find row by identifier, update status & notes in Sheet.

## Security

- **Admin:** Password in `ADMIN_PASSWORD`; no DB – session via cookie or simple token.
- **Google:** Service Account JSON in env; never exposed to client.
- **Blob:** Only server uploads; public URLs stored in Sheet for admin view/download.
- **Sheets:** Writes/reads only from server-side API routes.

## Tech Stack Summary

| Layer        | Technology                |
|-------------|---------------------------|
| Frontend    | Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS |
| Backend     | Next.js API Routes (serverless on Vercel) |
| Storage     | Google Drive (resumes), Google Sheets (candidate data) |
| Auth        | Google Service Account; admin password (env) |
| Hosting     | Vercel (free tier)        |

## No Database

- All candidate data lives in **one Google Sheet** (columns: Name, Email, Mobile, City, Resume Link, Status, HR Notes, Created Date).
- Resumes are **files in Vercel Blob**; Sheet holds only the blob URL.
- No PostgreSQL, MongoDB, or any paid DB – 100% free to host.
