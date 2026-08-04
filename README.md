# User Access Workflow System

This project is a Next.js prototype for digitizing the paper-based User Access Request Form into a workflow management system.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Prisma
- PostgreSQL

## What is included

- Dashboard with workflow and reporting overview
- Online user access request form based on the paper form
- Request register with status tracking
- Approval workspace for HOD and ICT review
- Prisma schema for users, requests, systems, and approvals
- Sample data to demonstrate the workflow before backend wiring

## Suggested next implementation steps

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env` and set `DATABASE_URL`.
3. Run `npx prisma generate`.
4. Add Auth.js for login and role-based route protection.
5. Replace mock data with Prisma queries and route handlers.
6. Add validation with Zod and React Hook Form.
7. Add notifications, PDF export, and audit logs.

## Core workflow

1. Employee submits access request.
2. Head of Department approves or rejects.
3. ICT Officer approves, provisions access, and completes the request.
4. Administrator monitors reports and compliance.
