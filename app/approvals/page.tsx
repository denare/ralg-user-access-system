import { PageHeader } from "@/components/page-header";
import { StatusPill } from "@/components/status-pill";
import { ApprovalActions } from "@/components/approval-actions";
import { requireProfile } from "@/lib/auth";
import { getApprovalQueue, getDashboardStats } from "@/lib/data";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ApprovalsPage() {
  const profile = await requireProfile(["HOD", "ICT_OFFICER"]);
  const [queue, stats] = await Promise.all([getApprovalQueue(profile), getDashboardStats(profile)]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Approvals Workspace"
        title="Request Review and Authorization"
        description="Review assigned requests and record a formal decision with a supporting comment."
      />

      <section className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <article key={stat.label} className="border border-slate-200 border-l-4 border-l-brand-government bg-white p-5 shadow-card">
            <p className="text-sm text-slate-500">{stat.label}</p>
            <p className="mt-2 text-3xl font-semibold text-brand-ink">{stat.value}</p>
            <p className="mt-2 text-sm text-slate-600">{stat.hint}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-4">
        {queue.map((request) => (
          <article key={request.id} className="border border-slate-200 bg-white p-6 shadow-card">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-xl font-semibold text-brand-ink">{request.requestNumber}</h3>
                  <StatusPill status={request.status} />
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {request.applicantName} requested <strong>{request.action}</strong> for <strong>{request.systems.join(", ")}</strong>.
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  Submitted {formatDate(request.createdAt)} | Department: {request.department}
                </p>
              </div>
              <ApprovalActions requestId={request.id} />
            </div>
          </article>
        ))}
        {!queue.length ? (
          <div className="border border-slate-200 bg-white p-8 text-center text-sm text-slate-600 shadow-card">
            There are no requests awaiting your decision.
          </div>
        ) : null}
      </section>
    </div>
  );
}
