# Primary School Management System (React + TypeScript + Vite)

This repository contains a web-based Primary School Management System. It provides role-based portals and workflows for school operations such as student and teacher management, classes and attendance, exams and report cards, events, finances, and administrative tools.

The application is a single-page app (SPA) built with React, TypeScript, and Vite. It integrates with Appwrite (BaaS) for authentication, database, storage, and functions, and uses Tailwind CSS for styling.

Current local date/time for reference: 2026-01-20 08:53.

Contents
- What this project does
- Tech stack
- Project structure overview
- Key runtime flows
- How to run locally
- Configuration (Appwrite and environment)
- Current architecture
- Proposed design improvements and target architecture
- Roadmap

What this project does
- Authentication and protected routes with user roles.
- Role-based dashboards and navigation: Director, DOS (Director of Studies), Bursar, IT Admin, Teachers.
- Students: add, view, manage, attendance, results.
- Teachers: add, manage, attendance.
- Classes: create and manage classes.
- Exams and Results: marks entry, results management, UNEB communications.
- Events: school and sports events.
- Administration: staff applications, audit logs, generate reports, create admin accounts, view portals.

Tech stack
- Frontend: React 18, TypeScript, Vite
- Routing: react-router-dom
- State: Zustand store (see useAuthStore) + local component state
- UI: Tailwind CSS; shadcn/ui-like components; notifications via sonner
- Backend/BaaS: Appwrite (auth, DB, storage, functions)
- Tooling: ESLint, Prettier, tsconfig path alias @ -> src

Project structure overview
- src/
  - App.tsx: Router entry, Toaster, ProtectedRoute to dashboard.
  - layouts/DashboardLayout.tsx: Main shell with Sidebar and nested routes per role.
  - pages/: Feature pages (StudentsPage, TeachersPage, ClassesPage, Attendance*, Exams*, DOS*, Director*, Bursar*, IT*, Settings, Profile, etc.).
  - components/: Shared UI (Sidebar, ProtectedRoute, forms, etc.).
  - lib/: API/utils for Appwrite and domain helpers (e.g., classes.ts, reportComments.ts, staffApplications.ts, storage.ts).
  - store/: Global state (e.g., authStore using Zustand).
- Public config files: tailwind.config.js, vite.config.ts, eslint.config.js, tsconfig*.json.

Key runtime flows
- App boot: App.tsx sets BrowserRouter and global Toaster. Root path redirects to /dashboard.
- Auth protection: ProtectedRoute gates all application routes under DashboardLayout. If unauthenticated, user is redirected to /login.
- Role-based routing: DashboardLayout reads user from useAuthStore and switches certain routes (e.g., /attendance for teachers vs administrative view). Dedicated route groups exist for /dos/*, /director/*, /bursar/*, /it/*.
- Data access: lib/* modules encapsulate Appwrite queries and mutations for domain entities (students, teachers, classes, applications, comments, etc.).

How to run locally
1) Prerequisites
   - Node.js 18+
   - An Appwrite instance or Appwrite Cloud project
2) Install dependencies
   - npm install
3) Configure environment
   - Create a .env file (or .env.local) with Appwrite creds. Typical variables:
     - VITE_APPWRITE_ENDPOINT=
     - VITE_APPWRITE_PROJECT_ID=
     - VITE_APPWRITE_DATABASE_ID=
     - VITE_APPWRITE_BUCKET_ID=
     - Other collection IDs as referenced in the setup docs (see STUDENTS_COLLECTION_SETUP.md, TEACHERS_COLLECTION_SETUP.md, CLASSES_COLLECTION_SETUP.md, STORAGE_SETUP.md, DEBUG_AVATAR.md, ENV_SETUP.md, SETUP.md).
4) Start dev server
   - npm run dev
5) Build & preview
   - npm run build
   - npm run preview

Configuration (Appwrite & environment)
- The docs in the root (STUDENTS_COLLECTION_SETUP.md, TEACHERS_COLLECTION_SETUP.md, CLASSES_COLLECTION_SETUP.md, STORAGE_SETUP.md, SETUP.md, ENV_SETUP.md) describe the required collections, permissions, and environment values. Ensure these are aligned with the lib/* modules.
- Path alias: @ resolves to ./src (configured in tsconfig and vite.config.ts).

Current architecture
- SPA with protected nested routing. DashboardLayout is the shell hosting role-specific routes and a Sidebar.
- Server state is fetched via lib/* utilities that wrap Appwrite SDK calls. UI updates are handled by local state and lightweight global auth state via Zustand.
- Notifications via sonner; Tailwind for styling; basic components composed in components/.

Proposed design improvements and target architecture

1) Feature-based folder structure
   - Goal: Improve cohesion, discoverability, testing, and scalability by grouping by feature rather than type.
   - Example structure:
     - src/features/auth/{components,pages,api,stores,types}
     - src/features/students/{components,pages,api,stores,types}
     - src/features/teachers/{...}
     - src/features/classes/{...}
     - src/features/attendance/{...}
     - src/features/exams/{...}
     - src/features/admin/{...} (DOS/Director/Bursar/IT portals)
     - src/shared/{ui,components,lib,utils,types}

2) Explicit API client layer + React Query for server state
   - Introduce a central Appwrite client (shared/lib/appwriteClient.ts) and per-feature API modules using typed DTOs.
   - Use TanStack Query (React Query) for server state: caching, de-dup, pagination, retries, mutations, optimistic updates, and background refetch.
   - Keep Zustand (or Redux Toolkit) for client state only (auth session, UI prefs), not for server data.

3) Schema validation and forms
   - Use zod for runtime validation and type inference.
   - Use react-hook-form + zodResolver for all forms (students, teachers, classes, marks, applications), reducing bugs and ensuring consistent UX.

4) Role and permission model centralization
   - Create a single source of truth for roles/claims and route guards.
   - Example: shared/auth/permissions.ts with helpers like canView(route, user), canEdit(entity, user).
   - Wrap routes with a RoleGuard that reads permissions instead of scattering checks across pages.

5) Error and loading experience
   - Add ErrorBoundary at app shell level; unify loading placeholders (skeletons/spinners).
   - Standardize API error formatting; map Appwrite errors to user-friendly messages.

6) Performance
   - Code-split large routes with React.lazy and Suspense in router definitions.
   - Virtualize long lists (students, teachers) when counts are high.
   - Image optimization for avatars (thumb vs full). Leverage Appwrite preview URLs.

7) Accessibility and i18n
   - Adopt accessible components and ARIA patterns; ensure keyboard navigation in Sidebar and data tables.
   - Prepare for i18n by extracting strings and using a simple i18n library when needed.

8) Testing strategy
   - Unit: utilities and components with Vitest + React Testing Library.
   - Integration: critical forms and flows (login, add student/teacher, marks entry).
   - E2E: Playwright or Cypress for smoke tests across roles.

9) Observability and auditing
   - Standardize client-side logging; send important events to Appwrite Functions or a logging service.
   - Ensure audit logs pages are fed by an append-only log with clear schema.

10) Security hardening
   - Enforce strict Appwrite permissions on collections; validate on server side (functions) for sensitive operations.
   - Never trust client roles alone; server-side checks should gate writes.
   - Protect env vars; avoid leaking IDs in the client if not necessary.

11) Developer experience
   - Add simple generator scripts (or plop) to scaffold feature slices.
   - Add lint rules for imports and a pre-commit hook (lint-staged) for formatting and type checks.

12) Documentation and ADRs
   - Keep this README high-level. Add docs/ with short ADRs for key choices (state mgmt, API style, routing strategy).

Incremental adoption plan
- Start by introducing React Query and moving one feature (e.g., students) to feature-based structure.
- Add RoleGuard and central permissions, then gradually migrate route checks.
- Add zod and react-hook-form to the heaviest form pages first.
- Introduce code-splitting on low-risk routes to validate bundle impact.

Roadmap
- Migrate Students feature to feature-based structure and React Query.
- Centralize permissions and add RoleGuard.
- Standardize forms with zod + RHF.
- Add ErrorBoundary and loading skeletons.
- Add tests (unit + a couple of E2E flows).
- Review Appwrite rules and tighten permissions.

Contributing
- Open issues for questions or proposals.
- Use conventional commits if possible.

License
- Private/internal project unless a license is added.
