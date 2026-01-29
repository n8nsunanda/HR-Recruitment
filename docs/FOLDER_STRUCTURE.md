# Folder Structure

```
HR-Recruitment/
├── docs/
│   ├── ARCHITECTURE.md          # This architecture overview
│   ├── FOLDER_STRUCTURE.md      # This file
│   ├── GOOGLE_SETUP.md          # Google Cloud setup steps
│   └── VERCEL_DEPLOYMENT.md     # Vercel deployment steps
├── public/
│   └── phonepe-qr.png           # Placeholder for PhonePe QR (replace with real)
├── src/
│   ├── app/
│   │   ├── layout.tsx           # Root layout
│   │   ├── globals.css          # Global Tailwind styles
│   │   ├── page.tsx             # Public: Registration + Consultant Info + PhonePe
│   │   ├── admin/
│   │   │   ├── layout.tsx       # Admin layout (auth check)
│   │   │   ├── page.tsx         # Dashboard redirect
│   │   │   ├── login/
│   │   │   │   └── page.tsx     # Admin login form
│   │   │   └── dashboard/
│   │   │       └── page.tsx     # Candidate table, filters, update status/notes
│   │   └── api/
│   │       ├── submit-candidate/
│   │       │   └── route.ts     # POST: upload resume + add to Sheet
│   │       ├── candidates/
│   │       │   └── route.ts     # GET: list candidates (admin only)
│   │       ├── update-candidate/
│   │       │   └── route.ts     # POST: update status & notes (admin only)
│   │       └── admin-login/
│   │           └── route.ts     # POST: validate password, set session
│   ├── lib/
│   │   ├── google.ts            # getGoogleAuth() – Service Account client
│   │   ├── drive.ts             # uploadResumeToDrive()
│   │   ├── sheets.ts            # appendCandidate, getCandidates, updateCandidate
│   │   └── auth.ts              # getAdminSession(), validateAdmin()
│   └── types/
│       └── candidate.ts         # Candidate, CandidateRow, etc.
├── .env.example
├── .env.local                   # (git-ignored) Your secrets
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```
