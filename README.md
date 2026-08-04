# Government User Access Management System

Official workflow application for requesting, authorizing, provisioning, tracking, and auditing access to government information systems.

## Public Value

The system replaces a paper-based approval process with a searchable and accountable electronic workflow. It reduces lost forms, shortens approval time, gives applicants status visibility, and provides management evidence for security and service improvement.

## Roles and Responsibilities

- **Employee (Applicant):** creates an account, submits access requests, selects required systems, and tracks status.
- **Head of Department:** reviews submitted requests from the assigned department and records approval or rejection with comments.
- **ICT Officer:** receives HOD-approved requests, performs the technical account action, rejects where necessary, and marks completed work.
- **System Administrator:** manages user roles and account status, departments, system catalogue, reports, and audit records.

Every permission is checked on the server. Hidden navigation is not the security boundary.

## Technology

- Next.js 16, React 19, TypeScript, and Tailwind CSS
- Supabase Auth and PostgreSQL
- Prisma ORM and versioned migrations
- Zod request validation
- Vercel deployment and health monitoring

## Setup

1. Copy `.env.example` to `.env` and enter the Supabase values from the project Connect/API settings.
2. Install and generate dependencies.
3. Apply migrations.
4. Seed only for an approved non-production demonstration environment.
5. Start the application.

```bash
npm install
npx prisma generate
npx prisma migrate deploy
ALLOW_DEMO_SEED=true npm run db:seed
npm run dev
```

Runtime traffic uses Supavisor transaction mode on port `6543` with one Prisma connection. Migrations use the session endpoint on port `5432`.

## Demonstration Accounts

```text
Applicant: applicant.demo@tamisemi.go.tz / applicant@123
HOD:       hod.demo@tamisemi.go.tz       / hod@123
ICT:       ict.demo@tamisemi.go.tz       / ict@123
Admin:     admin.demo@tamisemi.go.tz     / admin@123
```

These are demonstration credentials. They must be removed or rotated before onboarding real users.

## Verification

```bash
npx tsc --noEmit
npm run build
node scripts/verify-accounts.mjs
curl https://YOUR_DOMAIN/api/health
```

Read [Supervisor Handover](docs/SUPERVISOR_HANDOVER.md) and [Go-Live Checklist](docs/GO_LIVE_CHECKLIST.md) before operational use.
