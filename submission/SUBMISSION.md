# Submission Summary — Jobs Territory Candidate Job Portal

- **Project Name:** Jobs Territory — Candidate Job Portal
- **Description:** Full-stack candidate-facing job portal with candidate registration/login, profile & GridFS resume management, server-side job discovery & filtering, application submission with duplicate prevention, real-time status tracking, and a protected recruiter/admin workspace.
- **Live Frontend URL:** `[PENDING VERCEL DEPLOYMENT — deploy frontend/ on Vercel with NEXT_PUBLIC_API_URL]`
- **Backend Health URL:** `[PENDING RENDER DEPLOYMENT — deploy backend/ via render.yaml and verify /api/health]`
- **GitHub Repository URL:** `https://github.com/gpranit16/candidate`

## Main Features
1. **Authentication & Security:** Candidate registration and login using JWT in HTTP-only cookies, `bcryptjs` hashing, CORS allowlist, CSRF origin validation, Helmet, rate limiting, and NoSQL input sanitization.
2. **Job Discovery (`/jobs`, `/jobs/[id]`):** Server-side keyword search, location, category, employment type, workplace model (Remote/Hybrid/On-site), experience level, salary filter, sorting, pagination, and URL query state.
3. **Candidate Profile & Resume Vault (`/profile`):** Structured personal details, skills editor, education & experience history, dynamic profile completion indicator, and MongoDB GridFS storage for PDF/DOC/DOCX resumes.
4. **Application Lifecycle & Tracker (`/dashboard`, `/applications`, `/applications/[id]`):** Guided apply flow with login redirect preservation, compound-index duplicate prevention, and read-only 6-stage timeline with recruiter notes.
5. **Protected Recruiter/Admin Console (`/admin/*`):** Real-time pipeline overview, job creation/editing/publishing/archiving, candidate profile & resume inspection, and status progression updates.

## Technology Stack
- **Frontend:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4, Framer Motion, Lucide React, React Hook Form, Zod, Radix UI
- **Backend:** Node.js, Express.js, TypeScript, Mongoose, Multer, Zod
- **Database:** MongoDB Atlas (`jobs_territory_portal`) + MongoDB GridFS (`resumes`)

## Demo Account Instructions
- **Candidate:** Register any new account via `/register` to test onboarding, profile updates, resume uploads, and job applications.
- **Recruiter / Admin:** Seeded via `npm run seed:admin` from `backend/.env` (`ADMIN_EMAIL` / `ADMIN_PASSWORD`). See [DEMO_GUIDE.md](./DEMO_GUIDE.md) for the full walkthrough.

## Testing Summary
- **Backend Integration Tests (Vitest + Supertest):** 5 test suites, 13/13 tests passed.
- **Live Server & Atlas E2E Verification:** Passed across `/api/health`, all 14 frontend routes, job search, candidate registration, GridFS resume upload, application submission, duplicate guard, and admin status progression.
- **TypeScript, ESLint & Production Builds:** Passed with 0 errors on both `backend/` and `frontend/`.
- **Note:** Automated Chrome DevTools browser click-through was blocked locally because Chrome remote debugging (`DevToolsActivePort`) was unavailable.
