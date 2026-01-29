# Vercel Deployment – HR Recruitment

This project is ready to deploy on Vercel with **no database** and **free tier** usage.

---

## 1. Prerequisites

- [Google Cloud & Blob setup](./GOOGLE_SETUP.md) completed (Service Account, Sheet, Vercel Blob).
- Code in a Git repo (GitHub, GitLab, or Bitbucket).

---

## 2. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in (e.g. with GitHub).
2. Click **Add New** → **Project**.
3. Import your repository (e.g. `HR-Recruitment`).
4. **Framework Preset:** Next.js (auto-detected).
5. **Root Directory:** leave default (or set if your app is in a subfolder).
6. Click **Deploy** (first deploy may fail until env vars are set).

---

## 3. Connect Vercel Blob (Resume Storage)

1. In the Vercel project, open the **Storage** tab.
2. Click **Create Database** / **Connect Store** → choose **Blob**.
3. Create a new Blob store (e.g. `hr-resumes`). Vercel will add **BLOB_READ_WRITE_TOKEN** to your project automatically.

---

## 4. Environment Variables

In the Vercel project: **Settings** → **Environment Variables**. Add:

| Name                          | Value                         | Environments   |
|-------------------------------|-------------------------------|----------------|
| `ADMIN_PASSWORD`              | Your secure admin password    | Production, Preview |
| `GOOGLE_SERVICE_ACCOUNT_JSON`| Full JSON key (one line)      | Production, Preview |
| `GOOGLE_SHEET_ID`            | Your Google Sheet ID          | Production, Preview |

- **BLOB_READ_WRITE_TOKEN** is added automatically when you connect a Blob store (step 3). No need to add it by hand.
- For **GOOGLE_SERVICE_ACCOUNT_JSON**: paste the entire JSON; you can minify it to a single line. In Vercel UI you can paste multi-line and it will be stored correctly.
- Mark secrets as sensitive if the UI offers it.
- Redeploy after saving env vars (**Deployments** → **⋯** → **Redeploy**).

---

## 5. Build and Run

- **Build Command:** `next build` (default).
- **Output Directory:** `.next` (default).
- **Install Command:** `npm install` (default).

No extra config needed for Next.js App Router.

---

## 6. Post-Deploy Checklist

- [ ] Visit `https://your-project.vercel.app` → candidate registration form loads.
- [ ] Submit a test candidate (name, email, mobile, resume PDF/DOCX) → success message.
- [ ] Check Google Sheet: new row with candidate data and resume link (link points to Vercel Blob).
- [ ] Visit `https://your-project.vercel.app/admin/login` → log in with `ADMIN_PASSWORD`.
- [ ] Open dashboard → candidate list from Sheet; click "View / Download" to open resume from Blob.

---

## 7. Free Tier Notes

- **Vercel:** Hobby plan is free (bandwidth and build limits apply).
- **Vercel Blob:** 1 GB storage free; see [pricing](https://vercel.com/docs/storage/vercel-blob/usage-and-pricing).
- **Google Sheets:** Free for typical HR/recruitment usage.
- **No database:** All data in Google Sheet; resumes in Blob.

---

## 8. Custom Domain (Optional)

In Vercel: **Settings** → **Domains** → add your domain and follow DNS instructions.

---

## 9. PhonePe QR Image

Replace the placeholder QR:

1. Add your PhonePe payment QR image as `public/phonepe-qr.png` (or keep using `phonepe-qr.svg` and replace its content).
2. Commit and push; Vercel will redeploy and serve the new image.
