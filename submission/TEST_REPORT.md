# Test Report — Jobs Territory Candidate Job Portal

| Area | Test Case | Expected Result | Actual Result | Status |
| --- | --- | --- | --- | --- |
| **Auth** | Register valid candidate | `201`, HTTP-only `jt_token` cookie, `role: candidate`, no `passwordHash` | Verified in `auth.test.ts` & live E2E | **PASS** |
| **Auth** | Duplicate email registration | `409 EMAIL_EXISTS` | Verified in `auth.test.ts` | **PASS** |
| **Auth** | Invalid email & weak password | `400 VALIDATION_ERROR` | Verified in `auth.test.ts` | **PASS** |
| **Auth** | Login, invalid login, `/me`, logout | Valid login `200`, invalid `401`, logout clears session | Verified in `auth.test.ts` | **PASS** |
| **Auth** | Unauthenticated protected access | `401 UNAUTHORIZED` | Verified in `auth.test.ts` & `profile.test.ts` | **PASS** |
| **Profile** | Fetch, update & persist profile | Profile fields & `profileCompletion` persist across logins | Verified in `profile.test.ts` & live E2E | **PASS** |
| **Profile** | Upload valid PDF to GridFS & download | Stored in `resumes` bucket and streamed back | Verified in `profile.test.ts` & live E2E | **PASS** |
| **Profile** | Reject invalid file & spoofed PDF | `400` (`INVALID_FILE_TYPE` / `INVALID_FILE_SIGNATURE`) | Verified in `profile.test.ts` | **PASS** |
| **Jobs** | Public listing excludes drafts | Only `published` jobs returned | Verified in `jobs.test.ts` | **PASS** |
| **Jobs** | Search, filters & pagination | `q`, `location`, `employmentType`, `experienceLevel`, `page/limit` filter in MongoDB | Verified in `jobs.test.ts` & live E2E | **PASS** |
| **Jobs** | Job detail & invalid/draft ID | `200` for published, `400` malformed ID, `404` draft | Verified in `jobs.test.ts` | **PASS** |
| **Applications** | Apply, duplicate guard & isolation | `201` on first apply, `409` duplicate, `403` cross-candidate & status tamper | Verified in `applications.test.ts` & live E2E | **PASS** |
| **Admin** | Role guard, job lifecycle & status history | Candidate blocked (`403`); admin creates/publishes/archives jobs & appends `statusHistory` | Verified in `admin.test.ts` & live E2E | **PASS** |
| **Builds** | TypeScript, ESLint & Production Builds | Zero errors across frontend and backend | Backend `tsc`/lint/build & Next.js `next build` passed | **PASS** |
| **Frontend Routes** | All 14 Next.js App Router pages | HTTP `200` rendered by Next.js server | All 14 routes returned `200` | **PASS** |
| **Browser UI** | Automated Chrome DevTools click-through | Interactive desktop/mobile visual & DOM walk | Chrome remote debugging (`DevToolsActivePort`) not enabled on host | **NOT RUN** |

## Outstanding Notes
- Automated API integration tests (13/13), static type/lint checks, production builds, and live server HTTP/Atlas E2E lifecycle checks all passed.
- Interactive Chrome DevTools visual click-through could not connect on the local host without Chrome remote debugging enabled (`chrome://inspect/#remote-debugging`).
