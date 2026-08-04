# Government User Access Management System

Next.js workflow system for submitting, authorizing, provisioning, and auditing government information-system access requests.

## Technology

- Next.js 16, React 19, TypeScript, and Tailwind CSS
- Supabase Auth for user identities and sessions
- Supabase PostgreSQL for hosted application data
- Prisma ORM for database access and migrations
- Zod for server-side request validation

## Roles

- `EMPLOYEE`: submits requests and views personal request history
- `HOD`: reviews requests from the assigned department
- `ICT_OFFICER`: processes requests approved by a Head of Department
- `ADMIN`: manages accounts and reviews organization-wide reports

All role permissions are checked on the server. Prisma-managed tables have RLS enabled and are not accessible through the public Supabase REST API.

## Local Configuration

The private `.env` file contains the linked Supabase connection details and is excluded from Git. Use `.env.example` when configuring another environment.

```bash
npm install
npx prisma generate
npx prisma migrate deploy
npm run db:seed
npm run dev
```

Open `http://localhost:3000`. The development seed creates these accounts:

```text
Employee: employee.demo@tamisemi.go.tz / employee@123
HOD:      hod.demo@tamisemi.go.tz      / hod@123
ICT:      ict.demo@tamisemi.go.tz      / ict@123
Admin:    admin.demo@tamisemi.go.tz    / admin@123
```

These credentials are for local demonstration only and must be replaced before operational use.

## Database Commands

```bash
npx prisma studio
npx prisma migrate dev --name descriptive_migration_name
npm run db:seed
node scripts/verify-accounts.mjs
```

The seed is repeatable: it upserts the four accounts and recreates only the three known demonstration requests.
