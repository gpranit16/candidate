# AI-Assisted Development Approach

## Tool Selected: Google Antigravity
**Google Antigravity** was used as the primary agentic engineering environment because it can plan across a multi-service workspace, edit decoupled frontend and backend codebases, execute shell builds and test suites directly, and inspect live browser rendering through integrated tooling.

## How the Prompt Was Structured
Rather than prompting ad hoc component by component, the work was driven from a single structured specification covering:
1. **Product Scope & Constraints:** Clear boundaries for candidate self-service plus a minimal recruiter/admin lifecycle workspace without over-building a full ATS/CRM.
2. **Design System Tokens First:** Defining the exact dark editorial neo-brutalist color palette (`#101010`, `#1B1B1B`, `#C6F36B`, `#FF895D`, `#A78BFA`, `#383838`), Space Grotesk + Inter font pairing, and sharp border geometry before generating UI pages.
3. **Layered Architecture & Security Rules:** Separating Express routes, Zod validators, middleware (JWT HTTP-only cookies, CSRF origin check, NoSQL sanitization, GridFS magic-byte checks), services, and Mongoose schemas.
4. **Verification Gates:** Requiring Vitest + Supertest integration tests, TypeScript checks, ESLint, and Next.js production builds before completion.

## Modular Implementation & Integration
- **Foundation & Contracts:** Root orchestration (`package.json`), separate `backend/` and `frontend/` TypeScript configs, and `.env` isolation (`jobs_territory_portal` database).
- **Backend First:** Mongoose models with compound indexes (`candidateId + jobId`), GridFS upload/stream utilities, layered services, and idempotent seed scripts (`seedAdmin.ts`, `seedJobs.ts`).
- **Frontend Design System & Routes:** Shared UI primitives, `AuthProvider`, `ToastProvider`, `ConfirmDialog`, and all 14 public, candidate, and admin routes wired to real REST endpoints via `fetch(..., { credentials: 'include' })`.

## Debugging, Review & Verification
- **Type & Lint Checks:** Initial backend `tsc --noEmit` surfaced `@types/express` v5 `string | string[]` param typing and a `mongodb` vs `mongoose.mongo` `GridFSBucket` type mismatch; both were resolved cleanly.
- **Test Execution:** Integration suites using Vitest + Supertest verified auth, GridFS upload validation (rejecting spoofed `.pdf` headers), server-side job filtering, duplicate application prevention, and admin RBAC.
- **Browser & End-to-End Verification:** Verified live frontend and backend servers together across desktop and mobile viewports, inspecting real MongoDB Atlas persistence, redirects, and console/network cleanliness.
- **Manual Configuration Boundary:** External secrets (`MONGODB_URI` in `backend/.env`, `ADMIN_EMAIL` / `ADMIN_PASSWORD`), GitHub remote publishing, and Vercel/Render hosting credentials remain outside source control.

