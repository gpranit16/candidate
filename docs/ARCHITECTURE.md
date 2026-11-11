# System Architecture — Jobs Territory Candidate Job Portal

## 1. High-Level Topology

The application is structured as two decoupled TypeScript services:

- **Frontend (`frontend/`):** Next.js 15 App Router web application served on port `3000` (Vercel in production). Communicates with the REST API using `fetch` with `credentials: 'include'` and `X-Requested-With: XMLHttpRequest`.
- **Backend (`backend/`):** Express.js REST API served on port `5000` (Render in production), backed by MongoDB Atlas database `jobs_territory_portal` and GridFS bucket `resumes`.

```text
Browser (Next.js App Router :3000)
   │  HTTPS + HTTP-only Cookie (jt_token) + Origin / X-Requested-With
   ▼
Express API Server (:5000)
   ├── Security Middleware (Helmet, CORS allowlist, Rate Limit, Sanitize, CSRF Origin)
   ├── Auth & RBAC Middleware (JWT Cookie verification -> req.user)
   ├── Validation Layer (Zod schemas)
   ├── Service Layer (Auth, Profile, Jobs, Applications, Admin)
   └── Mongoose ODM + GridFSBucket ("resumes")
         │
         ▼
MongoDB Atlas (Database: jobs_territory_portal)
```

---

## 2. Layered Backend Responsibilities

1. **Routes (`src/routes/`):** Bind HTTP verbs/paths to validation, auth/admin guards, and controllers.
2. **Validators (`src/validators/`):** Zod schemas validate and coerce request bodies and query parameters before business logic executes.
3. **Middleware (`src/middleware/`):**
   - `auth.ts`: Verifies signed JWT from `jt_token` HTTP-only cookie, loads user role from DB (never trusting client-sent role or ID), and exposes `requireAuth`, `optionalAuth`, and `requireAdmin`.
   - `sanitize.ts`: Recursively strips keys starting with `$` or containing `.` from `body`, `query`, and `params` to prevent NoSQL operator injection.
   - `csrf.ts`: Enforces `Origin`/`Referer` allowlist matching `CLIENT_URL` on all state-changing requests (`POST`, `PUT`, `PATCH`, `DELETE`).
   - `upload.ts`: Enforces 5 MB size cap, allowed extensions (`.pdf`, `.doc`, `.docx`), MIME types, and binary magic-byte verification (`%PDF`, `D0 CF 11 E0`, `PK\x03\x04`).
   - `errorHandler.ts`: Maps `AppError`, `ZodError`, `MulterError`, `CastError`, and Mongo duplicate key (`11000`) errors to uniform JSON payloads without leaking stack traces.
4. **Services (`src/services/`):** Encapsulate transactional registration, profile completion calculation, MongoDB GridFS streaming, search/filter/pagination queries, duplicate-application checks, and admin aggregations.
5. **Models (`src/models/`):** Enforce schema constraints and indexes (`users`, `candidateprofiles`, `jobs`, `applications`).

---

## 3. Data Integrity & Security Guarantees

- **Strict Database Isolation:** `backend/src/config/db.ts` enforces `dbName: 'jobs_territory_portal'` and rejects any URI referencing `pricepilot`.
- **Candidate Data Isolation:** `GET /api/applications/:id` verifies `application.candidateId === req.user.id` unless `req.user.role === 'admin'`.
- **Immutable Status Control:** Candidates cannot submit or mutate `status` or `statusHistory`; only `admin` users can call `PATCH /api/admin/applications/:id/status`.
- **Safe Job Archival:** `DELETE /api/jobs/:id` archives jobs to `status: 'archived'` by default (or whenever applications exist) so candidate application history never breaks.
- **No Secret Leakage:** `User` schema excludes `passwordHash` by default (`select: false`) and strips it in `toJSON`. Logs omit request bodies, cookies, and authorization headers.

