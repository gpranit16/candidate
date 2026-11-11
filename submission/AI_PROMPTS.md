# AI Prompt Examples Used During Development

> **Note:** The examples below are direct excerpts from the structured master prompt provided to **Google Antigravity** for building the Jobs Territory Candidate Job Portal. They are presented as categorized excerpts from that single engineering brief.

---

## Example 1: Product Architecture, Stack & API Boundaries

> *Excerpt — System Architecture & Backend API Specification*

```text
Build a professional candidate portal that allows candidates to discover job opportunities,
maintain their profiles, apply for jobs and track application progress. Also create a small
protected recruiter/admin workspace to demonstrate the complete application lifecycle,
including creating jobs and changing application statuses. Do not attempt to build a complete
CRM or ATS.

Keep frontend and backend as separate applications (Frontend: Next.js App Router, React,
TypeScript, Tailwind CSS, port 3000; Backend: Node.js, Express.js, TypeScript, Mongoose,
MongoDB Atlas database jobs_territory_portal, GridFS for resume storage, port 5000).

Implement controllers, routes, middleware, services, models and validators as separate
responsibilities, with centralized error handling, Zod request validation, HTTP-only JWT
cookie authentication, admin authorization, rate limiting, Helmet, input sanitization,
and secure file upload handling.
```

---

## Example 2: UI/UX Design System & Anti-Generic Direction

> *Excerpt — Visual Direction, Typography, Tokens & Page Craft*

```text
Create a PREMIUM DARK EDITORIAL NEO-BRUTALIST DESIGN. The visual quality must be
comparable to a professionally designed, funded startup's web product.

COLOUR SYSTEM:
- Main Background: #101010
- Secondary Background: #151515
- Card Surface: #1B1B1B
- Elevated Surface: #222222
- Primary Accent: #C6F36B
- Secondary Accent: #FF895D
- Tertiary Accent: #A78BFA
- Main Text: #F5F5F0
- Muted Text: #969696
- Border: #383838

TYPOGRAPHY: Headings: Space Grotesk; Body: Inter.
Use strong section hierarchy, large editorial headings, deliberate grid layouts, sharp
borders, purposeful hover and focus states, and consistent iconography. Avoid excessive
glassmorphism, excessive gradients, random glowing elements, rounded-card clichés, fake
statistics, and placeholder functionality.
```

---

## Example 3: Testing, Security Verification & Quality Audit

> *Excerpt — Mandatory Verification & Quality Gates*

```text
Create and run actual tests covering:
- Authentication (valid/duplicate registration, invalid email, weak password, login, logout,
  protected routes)
- Profile & GridFS resume upload/download (valid PDF/DOC/DOCX vs rejected invalid files)
- Job discovery (published filtering, keyword search, location, employment type, experience,
  pagination, invalid ID handling)
- Applications (submission, duplicate prevention, status history, candidate status
  modification blocked, cross-candidate isolation)
- Admin workspace (role restriction, job creation/editing/publishing/archiving, application
  status transitions)

Execute backend tests, TypeScript checks, lint, and production builds, fix all errors found
during testing, and verify complete user journeys before delivery.
```

