import { PageHeader } from "@/components/page-header";
import { StatusPill } from "@/components/status-pill";
import { dashboardStats, requests } from "@/lib/mock-data";
import { formatDate } from "@/lib/utils";

const queue = requests.filter((request) => request.status !== "Completed" && request.status !== "Rejected");

export default function ApprovalsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Approvals Workspace"
        title="Review, approve, reject, and complete requests"
        description="This page is designed for HOD and ICT officers to work from a single task queue with enough context to act quickly and safely."
      />

      <section className="grid gap-4 md:grid-cols-3">
        {dashboardStats["ICT Officer"].map((stat) => (
          <article key={stat.label} className="rounded-[1.75rem] border border-white/80 bg-white p-5 shadow-card">
            <p className="text-sm text-slate-500">{stat.label}</p>
            <p className="mt-2 text-3xl font-semibold text-brand-ink">{stat.value}</p>
            <p className="mt-2 text-sm text-slate-600">{stat.hint}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-4">
        {queue.map((request) => (
          <article key={request.id} className="rounded-[2rem] border border-white/80 bg-white p-6 shadow-card">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-xl font-semibold text-brand-ink">{request.requestNumber}</h3>
                  <StatusPill status={request.status} />
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {request.applicantName} requested <strong>{request.action}</strong> for{" "}
                  <strong>{request.systems.join(", ")}</strong> in {request.environment.toLowerCase()} environment.
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  Submitted {formatDate(request.createdAt)} · Department: {request.department} · Current owner:{" "}
                  {request.currentOwner}
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button className="rounded-full border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-700">
                  Reject
                </button>
                <button className="rounded-full bg-brand-moss px-4 py-2 text-sm font-semibold text-white">
                  Approve
                </button>
              </div>
            </div>
          </article>
        ))}
      </section>

    </div>
  );
}
