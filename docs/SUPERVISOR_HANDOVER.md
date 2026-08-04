# Project Field Supervisor Handover

## Project Statement

The Government User Access Management System digitizes the User Access Request Form and its full approval lifecycle. It is designed as a practical public-sector solution that improves accountability, transparency, turnaround time, record preservation, and information-system access control.

## Problem Addressed

The paper process can be delayed, lost, duplicated, or difficult to audit. Applicants cannot easily know who owns a request, and managers cannot reliably measure demand or completion. This system provides one controlled register from submission through HOD authorization and ICT completion.

## Delivered Scope

- Applicant registration, email confirmation, login, password recovery, request submission, and status tracking.
- Department-restricted HOD review with recorded comments and decisions.
- ICT queue containing requests that passed HOD review, with rejection and completion actions.
- Administrator account/role management, department configuration, system catalogue, reports, and audit history.
- Supabase-hosted PostgreSQL, migrations, seed tooling, server validation, restricted REST access, and Vercel deployment.
- Graceful database interruption handling and `/api/health` monitoring.

## Workflow

```text
Employee (Applicant) -> HOD Review -> ICT Processing -> Completed
                              \-> Rejected
```

Drafts remain private to the applicant. HOD officers see submitted requests only for their assigned department. ICT sees requests that reached the ICT stage. System Administrators have institution-wide oversight.

## Supervisor Acceptance Demonstration

1. Register an applicant and confirm the account.
2. Submit an FFARS access request and record its reference number.
3. Sign out, then sign in as the matching department HOD and approve with a comment.
4. Sign out, then sign in as ICT and approve/complete the request.
5. Sign in as Administrator and verify the user, report, configuration, and audit records.
6. Demonstrate that each role cannot see unauthorized menus, headings, direct pages, or records.
7. Demonstrate password recovery and the health endpoint.

## Ownership Handover

The receiving institution must name owners for:

- Business process and approval rules
- Supabase organization/project and billing
- Vercel team/project and domain
- ICT support mailbox and incident response
- User onboarding and role authorization
- Privacy, records retention, and security review
- Backup restore testing and release approval

## Current Deployment

- Source: `https://github.com/denare/ralg-user-access-system`
- Production: `https://ralg-user-access-system.vercel.app`
- Health: `https://ralg-user-access-system.vercel.app/api/health`

The software is suitable for supervisor acceptance and a controlled pilot after the Go-Live Checklist is signed. Public or institution-wide rollout must not rely on demonstration credentials.
