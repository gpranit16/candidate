# Evaluator Demo Guide — Jobs Territory Candidate Job Portal

This guide walks through every candidate and recruiter/admin workflow end to end.

> **Note:** All pre-seeded job postings are sample demonstration listings.

---

## Demo Accounts

- **Candidate Account:** Register a fresh candidate directly via `/register` (e.g., `candidate.demo@example.com`) to experience onboarding, or sign in with any registered candidate account.
- **Recruiter / Admin Account:** Configured via `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `backend/.env` and seeded with `npm run seed:admin` (default demonstration email: `admin@jobsterritory.demo`; password is configured in `backend/.env` and not embedded in repository documentation).

---

## Step-by-Step Evaluation Walkthrough

### 1. Landing Page & Discovery Entry (`/`)
1. Open the application at `/` (locally `http://localhost:3000`).
2. Confirm the editorial dark neo-brutalist layout, featured jobs loaded from MongoDB, and discipline categories.
3. Enter a keyword (e.g., `TypeScript`) and/or location (e.g., `Bengaluru`) in the hero search bar and click **Find Jobs**.

### 2. Job Search, Filters & URL State (`/jobs`)
1. On `/jobs`, verify query parameters appear in the URL (`?q=TypeScript&location=Bengaluru`).
2. Refresh the browser to confirm search state persists via backend query execution.
3. Test filters: **Workplace Model** (`Remote` / `Hybrid` / `On-site`), **Employment Type**, **Experience Level**, **Minimum Salary**, and **Sort Order** (`Newest` vs `Relevance`).
4. Resize to mobile width (`375px`) and open **Filters & Sort** to verify the responsive filter drawer.

### 3. Registration & Redirect-Back Apply Flow (`/jobs/[id]` -> `/register` or `/login`)
1. While logged out, open any job detail page (`/jobs/[id]`) and click **Sign In to Apply**.
2. Notice the redirect query parameter preserves the selected job URL.
3. Register a new candidate on `/register` (verify password visibility toggle and validation rules) — you are automatically signed in with an HTTP-only cookie and returned to the job or dashboard.

### 4. Profile Management & GridFS Resume Upload (`/profile`)
1. Navigate to **Profile** (`/profile`).
2. Fill in **Phone**, **Location**, **Headline**, **Bio**, add/edit **Skills**, and add **Work Experience** and **Education** entries. Click **Save Profile Changes**.
3. Under **Resume Document**, upload a `.pdf`, `.doc`, or `.docx` file (up to 5 MB). Try uploading an invalid file type (e.g., `.txt` or `.js`) to observe validation.
4. Click **Download** to stream the stored file back from MongoDB GridFS.
5. Click **Sign Out**, sign back in on `/login`, and verify all profile fields and the uploaded resume filename persist.

### 5. Job Application & Duplicate Prevention (`/jobs/[id]`)
1. Open a published job on `/jobs/[id]`, click **Apply Now**, add an optional cover note, and click **Confirm & Submit Application**.
2. Observe the confirmation toast and the **Already Applied** banner replacing the apply button.
3. Refresh the page and verify duplicate applications remain blocked.

### 6. Candidate Dashboard & Application Tracker (`/dashboard`, `/applications`, `/applications/[id]`)
1. Visit `/dashboard` to inspect the updated **Profile Completion %**, **Total Applications**, **Recent Application Activity**, and **Recommended Opportunities**.
2. Visit `/applications` and click **View Timeline** on your application to open `/applications/[id]` and inspect the initial `Applied` status history entry.

### 7. Recruiter / Admin Workspace (`/admin`)
1. Sign out and sign in using the configured Admin account on `/login`.
2. On `/admin`, review real-time job and application metrics.
3. Open **Manage Jobs** (`/admin/jobs`) -> **Create Job** (`/admin/jobs/new`) to create a new job (or edit/publish/unpublish/archive an existing one).
4. Open **Manage Applications** (`/admin/applications`), filter by job or status, click **Inspect Profile** and **Resume** download, select a new status (e.g., `Shortlisted` or `Interview`), add a recruiter note, and click **Save Status**.
5. Sign back in as the candidate and open `/applications/[id]` to confirm the new status and recruiter note appear immediately in the candidate's read-only timeline.

