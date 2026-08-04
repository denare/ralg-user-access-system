# Production Go-Live Checklist

The technical deployment is not, by itself, authorization to process real personal or government data. The project owner and field supervisor should sign off every applicable item.

## Governance

- [ ] Process owner has approved the electronic workflow and status definitions.
- [ ] Departments, HOD assignments, systems, and requested roles have been verified.
- [ ] Privacy officer/legal adviser has approved the privacy notice, lawful purpose, retention period, and data-subject process.
- [ ] Records owner has approved retention, archival, and disposal rules.
- [ ] A named ICT support owner and escalation contact are published.

## Identity and Security

- [ ] All demonstration accounts and passwords have been removed or rotated.
- [ ] A real institutional System Administrator account has been created and tested.
- [ ] HOD and ICT roles are assigned only from written authorization.
- [ ] Supabase email confirmation and approved Site URL/redirect URLs are configured.
- [ ] MFA policy for HOD, ICT, and Administrator accounts has been approved or implemented.
- [ ] Supabase service-role key and database password have been rotated after handover.
- [ ] Production secrets exist only in Vercel/Supabase secret stores, not source control.
- [ ] Dependency, application, and authorization security reviews have passed.
- [ ] Rate limiting/CAPTCHA has been approved for public self-registration if exposed beyond an internal network.

## Reliability and Operations

- [ ] Paid service capacity/SLA is appropriate for expected real-user traffic; free-tier pausing is not accepted for critical service.
- [ ] Supabase backups are enabled and a restore exercise has been completed.
- [ ] `/api/health` is monitored and alerts reach the ICT support owner.
- [ ] Vercel production and preview environments contain all five required runtime variables.
- [ ] Custom government domain, TLS, DNS ownership, and approved sender domain are configured.
- [ ] Incident response, outage communication, and rollback procedures are documented and tested.
- [ ] Audit-log review responsibility and review frequency are assigned.

## Acceptance Testing

- [ ] Applicant registration, confirmation, login, recovery, request submission, and tracking pass.
- [ ] HOD department isolation and approval/rejection pass.
- [ ] ICT queue isolation and completion/rejection pass.
- [ ] Administrator account, role, department, system, report, and audit functions pass.
- [ ] Direct URL access by unauthorized roles is denied.
- [ ] Mobile and desktop browser acceptance tests pass.
- [ ] Accessibility and user-language review pass with representative users.
- [ ] Backup restore, database interruption, and recovery behavior pass.

## Approval

```text
Business Owner: ____________________  Signature: __________  Date: __________
ICT Owner:      ____________________  Signature: __________  Date: __________
Privacy/Legal:  ____________________  Signature: __________  Date: __________
Field Supervisor:___________________  Signature: __________  Date: __________
```
