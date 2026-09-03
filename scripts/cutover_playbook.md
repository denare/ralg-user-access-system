# Zero-Downtime Cutover & Rollback Playbook
**Application:** e-Vibali Chalinze (*Chalinze District Council User Access Management System*)

## 1. Pre-Cutover Verification (< 10 Minutes Before Release)
1. Execute Next.js production build verification:
   ```bash
   npm run build
   ```
2. Verify Database Connection Pooler and Migration status:
   ```bash
   npx prisma migrate status
   ```
3. Verify environment variable isolation in production host dashboard.

## 2. Cutover Protocol (< 5 Minutes)
1. Lower DNS TTL to 60 seconds 30 minutes prior to deployment window.
2. Trigger automated production build deployment on hosting provider.
3. Perform P0 smoke test matrix:
   - User authentication (`/login`)
   - Submit new request (`/requests/new`)
   - HOD approval decision (`/approvals`)
   - ICT Officer official seal stamping & PDF download (`/api/requests/[id]/report`)

## 3. Automated Rollback Protocol (If P0 Incident Triggered)
In event of database schema deadlock, connection pool failure, or critical API crash:
1. Trigger hosting rollback to previous successful deployment commit hash.
2. If schema rollback required:
   ```bash
   npx prisma db push --accept-data-loss
   ```
3. Notify ICT Helpdesk team (0678049280 | support@amis.got.tz).
