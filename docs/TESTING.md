# Testing & Quality Verification — Jobs Territory Candidate Job Portal

## 1. Automated Backend Integration Suite (Vitest + Supertest)

Command:
```bash
# Default (MongoMemoryServer)
npm run test

# Isolated MongoDB Atlas test database (jobs_territory_portal_test)
USE_ATLAS_TEST_DB=true npm --prefix backend test
```

### Coverage Across 5 Test Files (13 Test Cases — All Passing)

1. **`src/tests/auth.test.ts` (5 tests):**
   - Registers candidate, ignores client-supplied `role: 'admin'`, omits `passwordHash`, sets `jt_token` HTTP-only cookie.
   - Rejects duplicate email registration (`409 EMAIL_EXISTS`).
   - Rejects invalid email and weak passwords (`400 VALIDATION_ERROR`).
   - Authenticates valid credentials, rejects invalid password (`401`), accesses `/api/auth/me`, clears cookie on `/api/auth/logout`, and rejects subsequent `/api/auth/me`.
   - Blocks unauthenticated access to `/api/auth/me` (`401`).

2. **`src/tests/profile.test.ts` (3 tests):**
   - Blocks unauthorized access to `/api/profile/me` (`401`).
   - Fetches, updates, recalculates `profileCompletion`, and persists profile data across re-login.
   - Uploads a valid PDF to MongoDB GridFS, streams it back via `GET /api/profile/resume`, and rejects unsupported file types and spoofed `.pdf` magic bytes (`400 INVALID_FILE_SIGNATURE`).

3. **`src/tests/jobs.test.ts` (2 tests):**
   - Excludes `draft` jobs from public listing; verifies keyword (`q`), `location`, `employmentType`, `experienceLevel`, and `page`/`limit` pagination.
   - Fetches single published job details; returns `400` for malformed ObjectIds and `404` for draft/non-existent jobs.

4. **`src/tests/applications.test.ts` (1 test):**
   - Submits application, ignores client-provided `status`, prevents duplicate `(candidateId, jobId)` submission (`409 DUPLICATE_APPLICATION`), fetches candidate applications, blocks candidate status modification (`403`), and prevents another candidate from reading an application (`403`).

5. **`src/tests/admin.test.ts` (2 tests):**
   - Blocks candidate accounts from `/api/admin/*` and `POST /api/jobs` (`403`).
   - Verifies full admin lifecycle: create draft job -> publish -> candidate applies -> filter admin applications -> advance status (`Under Review` -> `Shortlisted`) with notes -> verify dashboard metrics and `statusHistory` -> archive job safely.

---

## 2. Static Analysis & Production Builds

- **Backend TypeScript Check:** `npm --prefix backend run typecheck` (`tsc --noEmit`) — Passed (0 errors).
- **Backend Lint:** `npm --prefix backend run lint` (`eslint src scripts --ext .ts`) — Passed (0 errors, 0 warnings).
- **Backend Build:** `npm --prefix backend run build` (`tsc -p tsconfig.json`) — Passed.
- **Frontend TypeScript Check:** `npm --prefix frontend run typecheck` (`tsc --noEmit`) — Passed (0 errors).
- **Frontend Lint:** `npm --prefix frontend run lint` (`next lint`) — Passed (0 warnings, 0 errors).
- **Frontend Production Build:** `npm --prefix frontend run build` (`next build`) — Passed (all 14 App Router routes compiled).
- **UI Anti-Slop Heuristic Lint:** `python ui_lint.py frontend/app` — AI Slop Risk `2.5/10`.

---

## 3. Live Full-Stack Integration Verification

Executed against live servers (`http://localhost:3000` and `http://localhost:5000`) connected to MongoDB Atlas database `jobs_territory_portal`:
- `GET /api/health` confirmed `{ status: "healthy", database: { name: "jobs_territory_portal", state: "connected" } }`.
- All 14 frontend routes returned HTTP `200`.
- Live job search (`?q=TypeScript&location=Bengaluru&sort=relevance`) returned matching seeded jobs.
- End-to-end candidate registration, profile update, GridFS PDF upload, job application, duplicate prevention (`409`), admin login, status update (`Shortlisted`), and candidate timeline verification all passed.

---

## 4. Known Unexecuted Check

- **Interactive Headless Chrome DevTools Walkthrough:** Attempted via Chrome DevTools MCP (`browser` subagent), but could not connect because Chrome remote debugging (`DevToolsActivePort`) was not active on the host environment. Interactive visual inspection in a live browser remains recommended after deployment or when Chrome remote debugging is enabled.

