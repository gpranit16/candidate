import dotenv from 'dotenv';
import path from 'path';
import { connectDB, disconnectDB } from '../src/config/db';
import { Job } from '../src/models/Job';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const SAMPLE_JOBS = [
  {
    title: 'Senior Full-Stack Engineer (TypeScript & Next.js)',
    company: 'Kinetix Labs',
    companyDescription:
      'Sample Demonstration Employer — Kinetix Labs builds developer observability and release velocity tooling for product teams.',
    location: 'Bengaluru, Karnataka',
    employmentType: 'Full-time',
    workplaceType: 'Hybrid',
    experienceLevel: 'Senior',
    category: 'Engineering',
    salaryRange: { min: 2800000, max: 3800000, currency: 'INR', period: 'year', isDisclosed: true },
    description:
      'Sample demonstration listing: Lead end-to-end architecture across our Next.js App Router customer workspace and Node.js ingestion APIs. You will collaborate directly with product design and infrastructure leads to ship low-latency workflows.',
    responsibilities: [
      'Architect scalable TypeScript modules across Next.js frontend and Express/MongoDB services.',
      'Own API contract reliability, automated test coverage, and production observability.',
      'Mentor mid-level engineers through thoughtful code reviews and RFCs.',
    ],
    requirements: [
      '5+ years of production full-stack experience with TypeScript, React, and Node.js.',
      'Strong command of relational or document data modeling and indexing strategies.',
      'Experience designing accessible, responsive web interfaces.',
    ],
    skills: ['TypeScript', 'Next.js', 'React', 'Node.js', 'MongoDB', 'REST APIs'],
    status: 'published',
  },
  {
    title: 'Product Designer — Design Systems & Core Workflows',
    company: 'Atelier Grid',
    companyDescription:
      'Sample Demonstration Employer — Atelier Grid crafts financial operations software for fast-scaling Indian enterprises.',
    location: 'Mumbai, Maharashtra',
    employmentType: 'Full-time',
    workplaceType: 'Hybrid',
    experienceLevel: 'Mid',
    category: 'Design',
    salaryRange: { min: 1800000, max: 2500000, currency: 'INR', period: 'year', isDisclosed: true },
    description:
      'Sample demonstration listing: Shape our editorial dark and light interface grammar, maintain design tokens, and partner with frontend engineers to deliver crisp, high-trust enterprise workflows.',
    responsibilities: [
      'Evolve our multi-platform Figma token library and component specifications.',
      'Lead user research interviews and usability audits for core onboarding and reporting.',
      'Collaborate in design-engineering pairing sessions during implementation.',
    ],
    requirements: [
      '3+ years designing B2B SaaS or fintech web products.',
      'Portfolio demonstrating systematic typography, hierarchy, and interaction craft.',
      'Working familiarity with CSS tokens and accessibility contrast standards.',
    ],
    skills: ['Figma', 'Design Systems', 'Interaction Design', 'Prototyping', 'Accessibility'],
    status: 'published',
  },
  {
    title: 'Backend Platform Engineer',
    company: 'Vanguard Ledger',
    companyDescription:
      'Sample Demonstration Employer — Vanguard Ledger provides automated treasury reconciliation APIs.',
    location: 'Hyderabad, Telangana',
    employmentType: 'Full-time',
    workplaceType: 'On-site',
    experienceLevel: 'Mid',
    category: 'Engineering',
    salaryRange: { min: 2000000, max: 2900000, currency: 'INR', period: 'year', isDisclosed: true },
    description:
      'Sample demonstration listing: Build fault-tolerant ledger ingestion pipelines, webhook delivery queues, and idempotent REST APIs handling high-throughput financial events.',
    responsibilities: [
      'Design transactional database workflows and idempotent retry mechanisms.',
      'Write comprehensive integration and contract tests using Vitest and Supertest.',
      'Optimize query latency and establish structured logging and alerting.',
    ],
    requirements: [
      '3+ years building backend services in Node.js/TypeScript or Go.',
      'Deep understanding of authentication, rate limiting, and secure API design.',
      'Experience with MongoDB aggregations or PostgreSQL.',
    ],
    skills: ['Node.js', 'TypeScript', 'Express', 'MongoDB', 'Redis', 'API Security'],
    status: 'published',
  },
  {
    title: 'Associate Product Manager — Candidate Experience',
    company: 'Jobs Territory',
    companyDescription:
      'Sample Demonstration Employer — Jobs Territory connects high-growth startups with vetted talent through streamlined hiring workflows.',
    location: 'Bengaluru, Karnataka',
    employmentType: 'Full-time',
    workplaceType: 'On-site',
    experienceLevel: 'Entry',
    category: 'Product',
    salaryRange: { min: 1000000, max: 1450000, currency: 'INR', period: 'year', isDisclosed: true },
    description:
      'Sample demonstration listing: Partner with engineering and recruiting ops to refine candidate onboarding, job discovery relevance, and transparent application status tracking.',
    responsibilities: [
      'Analyze funnel drop-offs across registration, profile completion, and job applications.',
      'Write clear PRDs, acceptance criteria, and edge-case matrices for product sprints.',
      'Conduct weekly candidate interviews to surface friction points.',
    ],
    requirements: [
      '1–2 years in product management, business analysis, or technical operations.',
      'Strong SQL/analytics literacy and structured problem-solving.',
      'Empathetic written and verbal communication.',
    ],
    skills: ['Product Strategy', 'SQL', 'User Research', 'Roadmapping', 'A/B Testing'],
    status: 'published',
  },
  {
    title: 'Applied Machine Learning Engineer',
    company: 'Synapse Signal',
    companyDescription:
      'Sample Demonstration Employer — Synapse Signal builds semantic retrieval and entity-matching pipelines.',
    location: 'Remote (India)',
    employmentType: 'Full-time',
    workplaceType: 'Remote',
    experienceLevel: 'Senior',
    category: 'Data & AI',
    salaryRange: { min: 3200000, max: 4400000, currency: 'INR', period: 'year', isDisclosed: true },
    description:
      'Sample demonstration listing: Improve candidate-to-role semantic matching, resume parsing accuracy, and explainable ranking signals in production.',
    responsibilities: [
      'Design evaluation harnesses for hybrid lexical + embedding search.',
      'Deploy Python/FastAPI inference microservices with strict latency budgets.',
      'Collaborate with product teams to eliminate algorithmic bias in ranking.',
    ],
    requirements: [
      '4+ years in applied NLP, information retrieval, or ranking systems.',
      'Strong Python, PyTorch, and vector indexing experience.',
      'Track record shipping measurable ML improvements to production.',
    ],
    skills: ['Python', 'NLP', 'Information Retrieval', 'PyTorch', 'FastAPI', 'Vector Search'],
    status: 'published',
  },
  {
    title: 'Frontend Engineer (React & Motion)',
    company: 'Studio Northstar',
    companyDescription:
      'Sample Demonstration Employer — Studio Northstar builds interactive publishing tools for independent media brands.',
    location: 'Pune, Maharashtra',
    employmentType: 'Full-time',
    workplaceType: 'Hybrid',
    experienceLevel: 'Mid',
    category: 'Engineering',
    salaryRange: { min: 1500000, max: 2200000, currency: 'INR', period: 'year', isDisclosed: true },
    description:
      'Sample demonstration listing: Craft ultra-responsive editorial web interfaces with Tailwind CSS, React, and purposeful Framer Motion transitions.',
    responsibilities: [
      'Build reusable UI primitives with full keyboard navigation and ARIA semantics.',
      'Optimize Core Web Vitals, bundle sizes, and client-side state synchronization.',
      'Partner with designers to translate layout grids accurately across breakpoints.',
    ],
    requirements: [
      '2–4 years with React, Next.js, TypeScript, and modern CSS.',
      'Strong eye for typography, spacing, and tactile micro-interactions.',
      'Familiarity with React Hook Form and Zod validation.',
    ],
    skills: ['React', 'Next.js', 'Tailwind CSS', 'Framer Motion', 'TypeScript', 'Accessibility'],
    status: 'published',
  },
  {
    title: 'Technical Recruiter — Engineering & Product',
    company: 'Talent Foundry',
    companyDescription:
      'Sample Demonstration Employer — Talent Foundry supports seed-to-Series B startups across India and SEA.',
    location: 'Delhi NCR',
    employmentType: 'Full-time',
    workplaceType: 'Hybrid',
    experienceLevel: 'Mid',
    category: 'People & Talent',
    salaryRange: { min: 900000, max: 1400000, currency: 'INR', period: 'year', isDisclosed: true },
    description:
      'Sample demonstration listing: Manage full-cycle technical hiring from intake calibration with founders to offer close while maintaining high candidate responsiveness.',
    responsibilities: [
      'Source and evaluate software, data, and product candidates across diverse channels.',
      'Maintain accurate ATS pipelines and timely candidate status updates.',
      'Coach hiring managers on structured interview rubrics.',
    ],
    requirements: [
      '2+ years of technical recruiting experience in high-growth startups or agencies.',
      'Strong grasp of modern software roles and engineering stacks.',
      'Exceptional candidate communication and pipeline hygiene.',
    ],
    skills: ['Technical Recruiting', 'Sourcing', 'ATS Management', 'Stakeholder Alignment'],
    status: 'published',
  },
  {
    title: 'Data Analytics Engineer',
    company: 'MetricPulse',
    companyDescription:
      'Sample Demonstration Employer — MetricPulse turns operational event streams into warehouse-native reporting.',
    location: 'Chennai, Tamil Nadu',
    employmentType: 'Full-time',
    workplaceType: 'Remote',
    experienceLevel: 'Mid',
    category: 'Data & AI',
    salaryRange: { min: 1600000, max: 2300000, currency: 'INR', period: 'year', isDisclosed: true },
    description:
      'Sample demonstration listing: Model clean dbt transformations, maintain data quality tests, and build self-serve metrics layers for finance and growth.',
    responsibilities: [
      'Own dimensional data models in dbt and cloud data warehouses.',
      'Implement automated freshness, uniqueness, and schema drift checks.',
      'Partner with product managers to define standardized KPI definitions.',
    ],
    requirements: [
      '2–5 years working with SQL, dbt, and Python ETL pipelines.',
      'Strong understanding of data modeling best practices.',
      'Experience documenting schemas for cross-functional consumers.',
    ],
    skills: ['SQL', 'dbt', 'Python', 'Data Modeling', 'BigQuery', 'Analytics'],
    status: 'published',
  },
  {
    title: 'Staff Security Engineer — Application & Cloud',
    company: 'ShieldCore Systems',
    companyDescription:
      'Sample Demonstration Employer — ShieldCore provides runtime posture monitoring for cloud-native workloads.',
    location: 'Bengaluru, Karnataka',
    employmentType: 'Full-time',
    workplaceType: 'Hybrid',
    experienceLevel: 'Lead',
    category: 'Engineering',
    salaryRange: { min: 4200000, max: 5600000, currency: 'INR', period: 'year', isDisclosed: true },
    description:
      'Sample demonstration listing: Lead threat modeling, secure SDLC reviews, authentication hardening, and vulnerability remediation across distributed services.',
    responsibilities: [
      'Perform architectural security reviews for new APIs, auth flows, and file pipelines.',
      'Automate SAST, DAST, and dependency checks in CI/CD.',
      'Guide engineering squads on OWASP Top 10 mitigations and least-privilege IAM.',
    ],
    requirements: [
      '6+ years in application security or infrastructure security engineering.',
      'Deep knowledge of JWT/session security, CORS, CSRF, and cloud IAM.',
      'Hands-on fluency in TypeScript, Python, or Go.',
    ],
    skills: ['AppSec', 'Threat Modeling', 'OAuth/JWT', 'OWASP', 'Cloud Security', 'CI/CD'],
    status: 'published',
  },
  {
    title: 'Software Engineering Intern — Full Stack',
    company: 'Jobs Territory',
    companyDescription:
      'Sample Demonstration Employer — Jobs Territory engineering team builds modern hiring and candidate discovery infrastructure.',
    location: 'Bengaluru, Karnataka',
    employmentType: 'Internship',
    workplaceType: 'On-site',
    experienceLevel: 'Entry',
    category: 'Engineering',
    salaryRange: { min: 35000, max: 50000, currency: 'INR', period: 'month', isDisclosed: true },
    description:
      'Sample demonstration listing: Work alongside senior engineers for a 6-month WFO internship building candidate portal modules, automated tests, and API integrations.',
    responsibilities: [
      'Implement modular React/Next.js views and Express REST endpoints.',
      'Write unit and integration tests for features you ship.',
      'Participate in daily standups, sprint demos, and code reviews.',
    ],
    requirements: [
      'Strong fundamentals in JavaScript/TypeScript, HTML/CSS, and Git.',
      'Hands-on project experience with React or Node.js.',
      'Available for full-time WFO internship in Bengaluru.',
    ],
    skills: ['TypeScript', 'React', 'Next.js', 'Node.js', 'MongoDB', 'Git'],
    status: 'published',
  },
  {
    title: 'Growth Marketing Lead — B2B Marketplace',
    company: 'Relay Commerce',
    companyDescription:
      'Sample Demonstration Employer — Relay Commerce connects wholesale manufacturers with regional retail buyers.',
    location: 'Mumbai, Maharashtra',
    employmentType: 'Full-time',
    workplaceType: 'On-site',
    experienceLevel: 'Senior',
    category: 'Growth & Marketing',
    salaryRange: { min: 2200000, max: 3000000, currency: 'INR', period: 'year', isDisclosed: true },
    description:
      'Sample demonstration listing: Own organic SEO, lifecycle CRM campaigns, and paid acquisition efficiency across our B2B supplier and buyer funnels.',
    responsibilities: [
      'Run structured acquisition experiments across search, LinkedIn, and lifecycle email.',
      'Partner with product on landing page conversion optimization.',
      'Report weekly CAC, activation, and retention cohorts to leadership.',
    ],
    requirements: [
      '4+ years leading B2B or marketplace growth programs.',
      'Proven ability to pair quantitative attribution with sharp copywriting.',
      'Experience managing cross-functional creative and analytics contributors.',
    ],
    skills: ['Growth Strategy', 'SEO', 'Lifecycle Marketing', 'Attribution', 'CRO'],
    status: 'published',
  },
  {
    title: 'Contract DevOps & Release Engineer',
    company: 'OrbitMesh',
    companyDescription:
      'Sample Demonstration Employer — OrbitMesh builds multi-region edge routing for media streaming.',
    location: 'Remote (India)',
    employmentType: 'Contract',
    workplaceType: 'Remote',
    experienceLevel: 'Senior',
    category: 'Operations',
    salaryRange: { currency: 'INR', period: 'month', isDisclosed: false },
    description:
      'Sample demonstration listing: 6-month contract engagement to standardize Terraform infrastructure modules, container builds, and zero-downtime release pipelines.',
    responsibilities: [
      'Refactor legacy deployment scripts into declarative Terraform and GitHub Actions.',
      'Set up Prometheus/Grafana dashboards and SLO burn-rate alerts.',
      'Document runbooks and hand over maintainable pipelines to platform staff.',
    ],
    requirements: [
      '4+ years with AWS/GCP, Docker, Kubernetes, and Terraform.',
      'Strong Linux networking and CI/CD debugging skills.',
      'Available for overlapping IST collaboration hours.',
    ],
    skills: ['Terraform', 'Docker', 'Kubernetes', 'GitHub Actions', 'AWS', 'Observability'],
    status: 'published',
  },
  {
    title: 'Lead Product Manager — Enterprise ATS Integrations',
    company: 'HireCraft Cloud',
    companyDescription:
      'Sample Demonstration Employer — HireCraft Cloud unifies candidate communication and interview scheduling.',
    location: 'Delhi NCR',
    employmentType: 'Full-time',
    workplaceType: 'Hybrid',
    experienceLevel: 'Lead',
    category: 'Product',
    salaryRange: { min: 3600000, max: 4800000, currency: 'INR', period: 'year', isDisclosed: true },
    description:
      'Sample demonstration listing: Define the roadmap for bi-directional CRM/ATS sync, webhook marketplaces, and enterprise RBAC permissions.',
    responsibilities: [
      'Lead discovery with enterprise talent acquisition leaders across India.',
      'Prioritize API platform capabilities alongside platform engineering.',
      'Drive adoption and net revenue retention for integration suites.',
    ],
    requirements: [
      '6+ years in B2B SaaS product management, ideally in HR Tech or workflow platforms.',
      'Fluency with REST APIs, webhooks, and enterprise data permissions.',
      'Track record mentoring product managers.',
    ],
    skills: ['Product Leadership', 'HR Tech', 'API Platforms', 'Enterprise SaaS', 'B2B'],
    status: 'published',
  },
  {
    title: 'QA Automation Engineer',
    company: 'Veritas FinTech',
    companyDescription:
      'Sample Demonstration Employer — Veritas FinTech automates compliance auditing for digital lenders.',
    location: 'Hyderabad, Telangana',
    employmentType: 'Full-time',
    workplaceType: 'Hybrid',
    experienceLevel: 'Mid',
    category: 'Engineering',
    salaryRange: { min: 1300000, max: 1900000, currency: 'INR', period: 'year', isDisclosed: true },
    description:
      'Sample demonstration listing: Build resilient end-to-end Playwright test suites and API regression harnesses wired directly into our pull-request checks.',
    responsibilities: [
      'Develop maintainable E2E UI and REST API automation frameworks.',
      'Triage flaky tests, isolate root causes, and partner on release sign-off.',
      'Verify accessibility, responsive breakpoints, and security edge cases.',
    ],
    requirements: [
      '2–4 years in QA automation using Playwright, Cypress, or Vitest/Supertest.',
      'Solid TypeScript/JavaScript coding ability.',
      'Methodical bug reporting and test planning skills.',
    ],
    skills: ['Playwright', 'TypeScript', 'Supertest', 'API Testing', 'CI/CD', 'QA Strategy'],
    status: 'published',
  },
  {
    title: 'Part-Time UX Copywriter & Content Strategist',
    company: 'Monolith Studio',
    companyDescription:
      'Sample Demonstration Employer — Monolith Studio designs clarity-first B2B web products.',
    location: 'Remote (India)',
    employmentType: 'Part-time',
    workplaceType: 'Remote',
    experienceLevel: 'Mid',
    category: 'Design',
    salaryRange: { min: 65000, max: 95000, currency: 'INR', period: 'month', isDisclosed: true },
    description:
      'Sample demonstration listing: Craft concise interface microcopy, empty-state guidance, error messages, and onboarding flows for SaaS client launches.',
    responsibilities: [
      'Audit product interfaces for jargon, ambiguity, and tone consistency.',
      'Write microcopy systems for forms, validation states, and transactional emails.',
      'Collaborate asynchronously with product designers in Figma.',
    ],
    requirements: [
      '2+ years writing UX copy for web applications or developer tools.',
      'Portfolio showing before/after interface clarity improvements.',
      'Ability to commit 20–25 hours per week.',
    ],
    skills: ['UX Writing', 'Content Strategy', 'Microcopy', 'Figma', 'Information Architecture'],
    status: 'published',
  },
  {
    title: 'Operations & Candidate Success Specialist',
    company: 'Jobs Territory',
    companyDescription:
      'Sample Demonstration Employer — Jobs Territory ensures candidates and employers experience responsive, transparent hiring.',
    location: 'Chennai, Tamil Nadu',
    employmentType: 'Full-time',
    workplaceType: 'On-site',
    experienceLevel: 'Entry',
    category: 'Operations',
    salaryRange: { min: 600000, max: 850000, currency: 'INR', period: 'year', isDisclosed: true },
    description:
      'Sample demonstration listing: Coordinate interview logistics, review job listing quality, and help candidates complete high-signal profiles.',
    responsibilities: [
      'Monitor daily application queues and escalate stalled requisitions.',
      'Verify employer job postings for clarity, accuracy, and compliance.',
      'Resolve candidate support inquiries within strict SLA targets.',
    ],
    requirements: [
      '1+ year in operations, customer success, or recruitment coordination.',
      'Strong attention to detail and spreadsheet/CRM proficiency.',
      'Clear, empathetic communication style.',
    ],
    skills: ['Operations', 'Candidate Experience', 'CRM', 'Process Improvement', 'SLA Management'],
    status: 'published',
  },
];

async function seedJobs() {
  await connectDB();

  let inserted = 0;
  let existing = 0;

  for (const jobData of SAMPLE_JOBS) {
    const found = await Job.findOne({ title: jobData.title, company: jobData.company }).lean();
    if (found) {
      existing++;
      continue;
    }

    await Job.create({
      ...jobData,
      postedAt: new Date(),
    });
    inserted++;
  }

  console.info(
    `Sample job seed complete (database: jobs_territory_portal). Inserted: ${inserted}, Already present: ${existing}.`
  );
  await disconnectDB();
}

seedJobs().catch(async (err) => {
  console.error('Job seed failed:', err instanceof Error ? err.message : err);
  await disconnectDB();
  process.exit(1);
});

