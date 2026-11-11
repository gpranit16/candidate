# Jobs Territory — Candidate Job Portal

A full-stack candidate-facing job portal and supporting recruiter/admin workspace built for **Jobs Territory**. Candidates can discover opportunities with server-side search and filters, maintain structured profiles with resume uploads stored in MongoDB GridFS, submit applications with duplicate prevention, and track every hiring stage in real time.

> **Sample Demonstration Data Notice:** Seeded job listings represent sample demonstration opportunities created to showcase the platform lifecycle and should not be interpreted as verified live vacancies.

---

## Key Features

### Candidate Experience
- **Editorial Neo-Brutalist UI:** High-contrast dark interface (`#101010` canvas, `#C6F36B` primary accent, Space Grotesk + Inter typography) across desktop, tablet, and mobile breakpoints.
- **Job Discovery & Filtering (`/jobs`):** Server-side keyword search (title, company, skills, category), location, employment type, workplace model (Remote/Hybrid/On-site), experience level, disclosed salary range, sorting (`newest` / `relevance`), pagination, and shareable URL query parameters.
- **Job Details & Guided Apply (`/jobs/[id]`):** Full role breakdown, redirect-to-login preservation, duplicate application guard, and instant status banner if already applied.
- **Candidate Dashboard (`/dashboard`):** Profile completion indicator, application counts by stage, recent activity, skill-matched recommended roles, and quick actions.
- **Profile & GridFS Resume Vault (`/profile`):** Manage personal details, skills (add/edit/remove), education history, work experience, and upload/replace/download PDF, DOC, or DOCX resumes stored in MongoDB GridFS (validated by extension, MIME type, size limit, and magic bytes).
- **Application Tracker (`/applications`, `/applications/[id]`):** Read-only 6-stage status progression (`Applied`, `Under Review`, `Shortlisted`, `Interview`, `Rejected`, `Hired`) with immutable recruiter notes and timestamps.

### Protected Recruiter / Admin Workspace
- **Overview (`/admin`):** Real-time MongoDB aggregations for job totals, application counts by status, and recent activity.
- **Job Management (`/admin/jobs`, `/admin/jobs/new`, `/admin/jobs/[id]/edit`):** Create, edit, publish, unpublish (draft), and safely archive jobs while preserving existing candidate application histories.
- **Application Management (`/admin/applications`):** Filter applications by job or status, inspect candidate profiles, download candidate resumes from GridFS, and update statuses with recruiter notes.

---

## Technology Stack

| Layer | Technology |
| --- | --- |
| **Frontend** | Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4, Framer Motion, Lucide React, React Hook Form, Zod, Radix UI primitives |
| **Backend** | Node.js, Express.js, TypeScript, Mongoose, Multer, Zod, Helmet, express-rate-limit |
| **Database & Files** | MongoDB Atlas (`jobs_territory_portal`), MongoDB GridFS (`resumes` bucket) |
| **Authentication** | JWT stored in HTTP-only cookies, `bcryptjs` password hashing, RBAC (`candidate` / `admin`), CORS + CSRF origin protection |
| **Testing** | Vitest, Supertest, ESLint, TypeScript compiler checks, Next.js production build |
| **Deployment** | Vercel (Frontend), Render (Backend), MongoDB Atlas (Database) |

---

## Project Structure

```text
jobs-territory-portal/
├── frontend/                  # Next.js App Router application (port 3000)
│   ├── app/                   # Public, candidate, and admin routes
│   ├── components/            # Design system primitives, layout, job & status components
│   ├── hooks/                 # AuthProvider & session state hook
│   ├── lib/                   # Formatting utilities & class helpers
│   ├── services/              # Typed REST API client with credentials
│   └── types/                 # Shared TypeScript interfaces
├── backend/                   # Express REST API application (port 5000)
│   ├── src/
│   │   ├── config/            # Environment & MongoDB connection (jobs_territory_portal)
│   │   ├── controllers/       # Route handlers
│   │   ├── middleware/        # Auth, RBAC, CSRF, sanitization, upload, error handling
│   │   ├── models/            # Mongoose schemas & indexes
│   │   ├── routes/            # Express route definitions
│   │   ├── services/          # Business logic & GridFS integration
│   │   ├── validators/        # Zod request schemas
│   │   ├── utils/             # AppError, asyncHandler, GridFS helpers
│   │   └── tests/             # Vitest + Supertest integration test suites
│   └── scripts/               # Idempotent seedAdmin.ts and seedJobs.ts
├── docs/                      # ARCHITECTURE.md & TESTING.md
├── submission/                # Assignment deliverables & submission guide
├── render.yaml                # Render backend deployment blueprint
└── package.json               # Root orchestration scripts
```

---

## Database Structure (`jobs_territory_portal`)

1. **`users`**: `name`, `email` (unique index), `passwordHash` (`select: false`), `role` (`candidate` | `admin`), timestamps.
2. **`candidateprofiles`**: `userId` (unique ref), `phone`, `location`, `headline`, `bio`, `skills`, `education[]`, `experience[]`, `resumeFileId` (GridFS ObjectId), `profileCompletion`, `updatedAt`.
3. **`jobs`**: `title`, `company`, `companyDescription`, `location`, `employmentType`, `workplaceType`, `experienceLevel`, `category`, `salaryRange`, `description`, `responsibilities[]`, `requirements[]`, `skills[]`, `status` (`draft` | `published` | `archived`), `postedAt`, timestamps. Indexed with weighted text search and filter indexes.
4. **`applications`**: `candidateId`, `jobId` (compound unique index `{ candidateId: 1, jobId: 1 }`), `resumeFileId`, `coverLetter`, `status`, `statusHistory[]`, `appliedAt`, `updatedAt`.
5. **GridFS (`resumes.files` / `resumes.chunks`)**: Binary resume storage for PDF, DOC, and DOCX files.

---

## API Overview

| Group | Endpoints |
| --- | --- |
| **Health** | `GET /api/health` |
| **Auth** | `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me` |
| **Profile** | `GET /api/profile/me`, `PUT /api/profile/me`, `POST /api/profile/resume`, `GET /api/profile/resume` |
| **Jobs** | `GET /api/jobs`, `GET /api/jobs/:id`, `POST /api/jobs` (Admin), `PUT /api/jobs/:id` (Admin), `DELETE /api/jobs/:id` (Admin) |
| **Applications** | `POST /api/applications`, `GET /api/applications/me`, `GET /api/applications/:id` |
| **Admin** | `GET /api/admin/dashboard`, `GET /api/admin/jobs`, `GET /api/admin/applications`, `PATCH /api/admin/applications/:id/status`, `GET /api/admin/resumes/:fileId` |

---

## Local Setup & Commands

### 1. Environment Configuration
Copy the example environment files and populate your local values:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

Ensure `backend/.env` connects to database **`jobs_territory_portal`**:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/jobs_territory_portal?retryWrites=true&w=majority
JWT_SECRET=<at-least-32-chars-random-secret>
CLIENT_URL=http://localhost:3000
ADMIN_EMAIL=admin@jobsterritory.demo
ADMIN_PASSWORD=<your-admin-password>
```

### 2. Install Dependencies
```bash
npm run install:all
```

### 3. Seed Sample Jobs & Admin User
```bash
npm run seed:admin
npm run seed:jobs
```

### 4. Run Development Servers
```bash
# Run frontend (port 3000) and backend (port 5000) together
npm run dev

# Or run independently
npm run dev:backend
npm run dev:frontend
```

### 5. Run Checks, Tests & Production Builds
```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

---

## Deployment Preparation

- **Backend (Render):** Blueprint provided in `render.yaml` (`rootDir: backend`, `buildCommand: npm install && npm run build`, `startCommand: npm run start`, `healthCheckPath: /api/health`). Set `NODE_ENV=production`, `MONGODB_URI`, `JWT_SECRET`, and `CLIENT_URL=https://<your-vercel-domain>` in Render environment variables.
- **Frontend (Vercel):** Config provided in `frontend/vercel.json`. Deploy with Root Directory set to `frontend` and environment variable `NEXT_PUBLIC_API_URL=https://<your-render-api>/api`.
- **Cross-Origin Cookies:** In production (`NODE_ENV=production`), cookies automatically use `httpOnly: true`, `secure: true`, and `sameSite: 'none'`, paired with strict `CLIENT_URL` CORS allowlist and `X-Requested-With` / Origin CSRF validation.

