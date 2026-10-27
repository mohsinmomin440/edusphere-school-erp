# EduSphere School ERP + CRM — Project Plan

> **Project type:** Advanced School ERP + CRM  
> **Stack:** React + Vite + TypeScript, Node.js + Express + TypeScript, MongoDB Atlas  
> **Development environment:** Windows 10/11, PowerShell  
> **Repository style:** npm workspaces monorepo  
> **Design direction:** Premium, modern SaaS dashboard  
> **Status:** Planning / Phase 0

---

## 1. Product Vision

Build **EduSphere**, a modern, secure, responsive School ERP + CRM that helps school administrators manage students, guardians, staff, academics, attendance, fees, admissions, communication, and reports from one application.

This must become a working full-stack product, not just a static UI mockup. Build in small, verifiable phases. Do not claim a feature works until its frontend, backend, database behavior, and relevant tests are implemented.

### Primary goals

- Premium and consistent user experience across desktop, tablet, and mobile.
- Secure role-based access and school-level data isolation.
- Modular architecture that is straightforward to maintain.
- Real database-backed CRUD operations, validation, loading states, and error handling.
- Useful automated tests, documentation, and GitHub Actions.
- Safe demo data only; never use real student records in public demos.

### Initial user roles

- Super Admin
- School Admin
- Principal
- Accountant
- Teacher
- Admission Officer
- Parent
- Student

Access must be checked on the backend. Hiding a frontend button is not security.

---

## 2. Design Reference and Design System

### Reference image

Save the provided UI preview image in the project folder using this filename:

`design-reference.png`

Recommended project directory:

`D:\Applications\School CRM\EduSphere School ERP Design System`

Keep this file beside `PROJECT_PLAN.md`. If the image is stored under another name, update this plan or tell Claude Code the exact filename.

The reference image is visual guidance. **Do not use the image itself as the website UI**; implement the interface with reusable React components.

### Brand direction

- Product name: **EduSphere**
- Product description: School ERP + CRM
- Tagline option: “Smarter Schools. Stronger Relationships.”
- Look and feel: polished, calm, trustworthy, data-focused, modern SaaS.

### Design tokens

| Token | Value |
|---|---|
| Primary | `#3882F6` |
| Secondary | `#64748B` |
| Success | `#10B981` |
| Warning | `#F59E0B` |
| Error | `#EF4444` |
| Info | `#06B6D4` |
| Main background | `#F8FAFC` |
| Surface | `#FFFFFF` |
| Main text | `#0F172A` |
| Muted text | `#64748B` |
| Border | `#E2E8F0` |

Use Inter or a similar clean sans-serif font. Centralize color, spacing, typography, radius, shadow, and state tokens. Avoid arbitrary one-off styling values.

### UI principles

- Deep navy sidebar with clear active navigation state.
- Light content canvas, white cards, restrained shadows, subtle borders.
- Strong hierarchy for page title, description, primary action, and content.
- Consistent icon sizing and Lucide icons.
- Tables with search, filters, pagination, empty states, and loading skeletons.
- Accessible forms, keyboard navigation, focus states, and contrast.
- Responsive sidebar/navigation and mobile-friendly tables.
- No fake success toasts or non-functional controls.
- Add dark mode only after the light theme is consistent.

### Shared components

- Application shell, sidebar, top bar, breadcrumbs, page header.
- Buttons, inputs, selects, checkboxes, badges, tabs, dialogs, dropdowns.
- Stat cards, charts, data tables, pagination, search/filter toolbar.
- Toasts, skeletons, empty states, error states, confirmation dialogs.
- Avatar/profile menu and notification indicator.

---

## 3. Technology Stack

### Frontend

- React + Vite + TypeScript
- Tailwind CSS
- shadcn/ui where useful
- Lucide React
- React Router
- TanStack Query
- React Hook Form + Zod
- Recharts

### Backend

- Node.js LTS + Express + TypeScript
- MongoDB Atlas + Mongoose
- Zod (or another single consistent validation approach)
- Centralized error handling
- REST API under `/api/v1`
- Structured logging and health endpoint

### Quality and operations

- npm workspaces monorepo
- ESLint + Prettier
- Vitest + Supertest
- Playwright for critical browser journeys
- GitHub Actions for lint, type-check, and tests
- `.env.example`, `.gitignore`, README and architecture docs

Use mutually compatible stable package versions. Do not blindly install the latest versions if they conflict with each other.

---

## 4. Repository Structure

Use this target structure. It can evolve when there is a clear technical reason.

```text
edusphere/
├── apps/
│   ├── web/
│   │   ├── public/
│   │   └── src/
│   │       ├── app/
│   │       ├── components/
│   │       │   ├── layout/
│   │       │   └── ui/
│   │       ├── features/
│   │       │   ├── auth/
│   │       │   ├── dashboard/
│   │       │   ├── students/
│   │       │   ├── guardians/
│   │       │   ├── staff/
│   │       │   ├── academics/
│   │       │   ├── attendance/
│   │       │   ├── fees/
│   │       │   ├── admissions/
│   │       │   ├── exams/
│   │       │   ├── communication/
│   │       │   └── settings/
│   │       ├── hooks/
│   │       ├── lib/
│   │       ├── types/
│   │       └── main.tsx
│   └── api/
│       └── src/
│           ├── config/
│           ├── middleware/
│           ├── modules/
│           │   ├── auth/
│           │   ├── users/
│           │   ├── students/
│           │   ├── guardians/
│           │   ├── staff/
│           │   ├── academics/
│           │   ├── attendance/
│           │   ├── fees/
│           │   ├── admissions/
│           │   ├── exams/
│           │   └── reports/
│           ├── jobs/
│           ├── utils/
│           ├── app.ts
│           └── server.ts
├── packages/
│   └── shared/
├── tests/
│   ├── integration/
│   └── e2e/
├── docs/
│   ├── architecture.md
│   ├── database-design.md
│   └── api-reference.md
├── .github/
│   └── workflows/
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

### Backend module pattern

Use a consistent pattern where it makes the module easier to maintain:

```text
students/
├── student.model.ts
├── student.validation.ts
├── student.repository.ts
├── student.service.ts
├── student.controller.ts
├── student.routes.ts
└── student.test.ts
```

Keep HTTP concerns in controllers and business rules in services. Do not over-engineer simple modules with unnecessary layers.

---

## 5. Core Product Modules

### Dashboard
- Total students, teachers, parents, classes.
- Attendance overview.
- Enrollment trend.
- Fee collection and outstanding balances.
- Recent activities, upcoming events.
- Admission conversion funnel.

### Students and guardians
- Student profiles, admission numbers, contact and guardian links.
- Search, filtering, sorting, pagination.
- Add/edit/archive workflows.
- Academic enrollment history.
- Attendance, fees, results, and document metadata.

### Staff and academics
- Staff/teacher profiles and employee identifiers.
- Academic years, classes, sections, subjects.
- Class teacher and subject assignments.
- Student enrollment by academic year.
- Timetable foundation.

### Attendance
- Daily class-wise attendance.
- Present, absent, late, and excused statuses.
- Duplicate prevention.
- Date/class filters and reports.
- Leave workflow foundation.

### Fees
- Fee structures and installments.
- Student invoices, payment records, receipts.
- Outstanding balances, concessions and refunds.
- Collection reports and reconciliation.
- Financial changes must be auditable.

### Admissions CRM
- Enquiry records and lead source.
- Assigned admission officer.
- Pipeline stages, application status, campus visits.
- Follow-up tasks and reminders.
- Conversion analytics.

### Exams and results
- Exam schedules, subjects, marks and grades.
- Report cards and student result history.
- Validation of marks and permissions.

### Communication
- Announcements and notice board.
- Audience-based visibility.
- Notification preferences.
- Email/SMS/WhatsApp integration only after provider credentials and consent requirements are handled.

### Administration and reporting
- User and role management.
- School settings.
- Audit log viewer.
- Attendance, finance, enrollment and admissions reports.

### Later expansion
Library, transport, hostel, inventory, payroll, certificates, and payment gateway integration. Do not begin these until the core system is stable.

---

## 6. Database Design

Primary MongoDB collections:

| Collection | Purpose |
|---|---|
| `schools` | School/tenant configuration |
| `users` | Login identities and roles |
| `students` | Student profiles |
| `guardians` | Parent/guardian records |
| `staff` | Teacher and staff records |
| `academicYears` | Academic sessions |
| `classes` | Grade and section records |
| `subjects` | Subject definitions |
| `enrollments` | Student placement per academic year |
| `attendance` | Daily attendance |
| `feeStructures` | Fee templates |
| `invoices` | Amounts billed |
| `payments` | Payment and receipt records |
| `admissionLeads` | Prospective students/enquiries |
| `followUps` | CRM tasks |
| `exams` | Exam schedules |
| `marks` | Student marks |
| `announcements` | Notices |
| `auditLogs` | Sensitive action history |

### Database rules

- Add `schoolId` to every school-owned record.
- Enforce school scope in service queries, not only in frontend code.
- Use references for growing histories and independently queried entities.
- Preserve historical enrollment, invoice, and payment records.
- Use timestamps and appropriate compound indexes.
- Use unique compound indexes for school-specific identifiers, for example `{ schoolId: 1, admissionNo: 1 }`.
- Prevent duplicate attendance according to the chosen attendance policy.
- Store money as integer paise, not floating-point amounts.
- Use transactions for multi-document financial operations where the MongoDB deployment supports them.
- Never expose password hashes or secrets in API responses.
- Use synthetic seed data only.

---

## 7. API Conventions

Prefix API routes with `/api/v1`.

Initial routes:
- `GET /health`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`
- `GET /api/v1/dashboard/summary`
- `GET /api/v1/students`
- `POST /api/v1/students`
- `GET /api/v1/students/:id`
- `PATCH /api/v1/students/:id`
- `DELETE /api/v1/students/:id` (prefer archive/soft-delete for records requiring history)

Use consistent response and error formats, appropriate HTTP status codes, input validation, pagination, filtering, and sorting. Do not return internal stack traces to clients.

Example list query:

```text
GET /api/v1/students?page=1&limit=20&search=aarav
```

---

## 8. Security Requirements

- Hash passwords using Argon2id or another suitable password-hashing algorithm.
- Use a documented secure session strategy; prefer secure HttpOnly cookies where appropriate.
- If using cookies for authentication, configure CSRF protection as required by the chosen design.
- Keep access credentials short-lived and provide revocation/rotation for refresh sessions.
- Configure CORS for explicitly allowed origins.
- Validate request bodies and query parameters.
- Rate-limit login and other sensitive endpoints.
- Enforce server-side role and school access on every protected request.
- Parents may access only linked children; teachers only authorized classes/records.
- Protect file uploads by type, size, and storage permissions.
- Keep credentials in local `.env` files and hosting secret stores.
- Never commit `.env`, database credentials, tokens, or personal student data.
- Add audit logs for privileged and financial actions.
- Review applicable Indian privacy and child-data requirements before production use.

Do not create a publicly accessible default administrator or hardcode credentials.

---

## 9. Implementation Roadmap

### Phase 0 — Project foundation
- Inspect the current folder before changing files.
- Confirm Node/npm/Git versions.
- Initialize npm workspaces.
- Create Vite React TypeScript frontend and Express TypeScript API.
- Add `.gitignore`, `.env.example`, README, linting, formatting and TypeScript checks.
- Keep secrets out of Git.

**Exit criteria:** both apps install, type-check, and start with documented commands.

### Phase 1 — Design system, application shell and auth
- Implement design tokens and shared UI components from the reference image.
- Build responsive sidebar, top bar, navigation, breadcrumbs and page shell.
- Build login UI and validation.
- Connect to MongoDB Atlas using backend-only environment variables.
- Add User model and secure password handling.
- Implement login/logout/session strategy and `/auth/me`.
- Add protected dashboard route and backend authorization middleware.
- Add `/health` endpoint and centralized API errors.
- Add safe synthetic seed data if needed; never hardcode a production admin.

**Exit criteria:** login flow works end-to-end, protected routes reject unauthenticated access, Atlas connection is verified, and dashboard UI is responsive.

### Phase 2 — Students, guardians, staff and academics
- Student/guardian CRUD and relationships.
- Staff directory.
- Academic years, classes, sections, subjects and enrollment history.
- Search, filters, pagination, and validation.

### Phase 3 — Attendance
- Mark and update attendance.
- Enforce duplicate prevention.
- Reports and role checks.

### Phase 4 — Fees and finance
- Fee structures, invoices, payments, receipts, balances.
- Atomic financial workflows, audit events and reconciliation tests.

### Phase 5 — Admissions CRM
- Leads, assignments, pipeline stages, follow-ups, reminders and conversion analytics.

### Phase 6 — Exams, communication and reports
- Exams, marks, report cards, notices and reports.
- Add integrations only when configuration and consent requirements are known.

### Phase 7 — Hardening and deployment
- Integration and end-to-end tests.
- Cross-school isolation tests.
- Accessibility and responsive review.
- GitHub Actions CI.
- Deployment configuration, backups, logging and monitoring.
- Final documentation and synthetic demo dataset.

### Phase completion checklist
At the end of each phase:
1. Run formatting and lint checks.
2. Run TypeScript checks.
3. Run relevant tests.
4. Fix all failures before continuing.
5. Summarize changed files and implemented behavior.
6. Give exact commands to run and verify the phase.
7. List remaining limitations honestly.

---

## 10. Local Development Setup

Expected local commands after the repository has been generated:

```powershell
npm install
npm run dev
```

The root scripts should start the web and API workspaces together. Also provide separate scripts for starting each workspace, linting, type-checking, and tests.

Suggested local URLs:
- Frontend: `http://localhost:5173`
- API: `http://localhost:4000`
- Health: `http://localhost:4000/health`

Use a Vite proxy or a clearly documented API base URL for local development. Do not expose `MONGODB_URI` or server-only secrets through Vite variables.

### Environment files

Create `.env.example` with placeholder values only. Keep the actual API `.env` local and ignored by Git.

Example variable names (the implementation may add others):

```text
NODE_ENV=development
PORT=4000
MONGODB_URI=
CLIENT_ORIGIN=http://localhost:5173
AUTH_SECRET=
```

Use a strong random secret generated locally. Do not paste real credentials into a prompt, README, or GitHub issue.

### MongoDB Atlas checklist

1. Create an Atlas project and development cluster.
2. Create a database user with the minimum required permissions.
3. Add the current development IP to the Atlas IP access list.
4. Copy the Node.js connection string.
5. Put it into the ignored local backend `.env` file.
6. Replace placeholders with the correct database username, password, and database name.
7. Start the API and verify the health response and database status.
8. Never use broad public network access as a permanent production setting.

---

## 11. GitHub Quality Gates

- README with features, screenshots, setup, architecture, and demo-data instructions.
- Architecture, database, and API documentation.
- `.env.example` with no real secrets.
- ESLint, Prettier, strict TypeScript.
- CI workflow for lint, type-check and tests.
- Unit tests for business logic.
- Integration tests for API behavior and permissions.
- E2E tests for login and critical user journeys.
- Clear commit messages, issues and milestones.
- No real student data in screenshots or demo records.
- Add a license only after deciding the intended project license.

---

## 12. Definition of Done for Version 1

- [ ] Frontend and backend run using documented commands.
- [ ] MongoDB Atlas connects successfully.
- [ ] Login and logout work end-to-end.
- [ ] Protected endpoints reject unauthenticated requests.
- [ ] Role permissions are enforced by the API.
- [ ] School-level data isolation is tested.
- [ ] Student creation, editing, listing and viewing work against MongoDB.
- [ ] Attendance records and reports follow the documented policy.
- [ ] Fee invoices and payments preserve financial history.
- [ ] Admissions leads and follow-ups can be managed.
- [ ] Loading, empty, validation, and error states are present.
- [ ] Responsive layout and accessibility checks are completed.
- [ ] Lint, type-check, and automated tests pass.
- [ ] README and setup instructions are accurate.
- [ ] Demo uses synthetic data only.

---

## 13. Instructions for Claude Code

Act as the lead engineer implementing this plan.

1. First inspect the current directory and read `PROJECT_PLAN.md` and the design reference image.
2. Do not overwrite existing files blindly. Preserve user files and working code.
3. Start with **Phase 0 and Phase 1 only**. Do not attempt the entire ERP in one pass.
4. Create complete files with correct paths, imports, and scripts.
5. Verify compatible package versions before installation.
6. Implement reusable React components; do not embed the reference image as the UI.
7. Do not hardcode secrets, passwords, tokens, or production admin accounts.
8. Ask the user to enter Atlas credentials locally in the ignored `.env` file.
9. Run install, lint, type-check, and relevant tests where tool access allows.
10. Fix errors rather than merely describing them.
11. If a command fails, inspect the error and resolve it before proceeding.
12. Do not claim tests passed unless they were actually run and passed.
13. At the end, summarize implemented features, changed files, commands run, test results, and remaining work.
14. Stop after Phase 1 is verified and ask before moving to Phase 2.

### First task

Inspect the project folder, confirm that `PROJECT_PLAN.md` and `design-reference.png` are present, then implement Phase 0 and Phase 1. If the design image is missing, continue using the design tokens in this plan and clearly mention that the reference image was not found.
