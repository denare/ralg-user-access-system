import { PageHeader } from "@/components/page-header";
import { ReportCard } from "@/components/report-card";
import { requests, reportCards } from "@/lib/mock-data";

const breakdown = [
  { label: "By Department", value: "Planning leads with 18 active requests" },
  { label: "By Action Type", value: "Create User requests account for 39% this month" },
  { label: "By Region", value: "Dodoma and Pwani generate the highest volume" },
  { label: "SLA Monitoring", value: "2 requests are older than 48 hours and still pending" }
];

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Reporting"
        title="Management insights and audit visibility"
        description="Administrators can use this module to monitor request trends, outstanding approvals, department demand, and compliance performance."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {reportCards.map((report) => (
          <ReportCard key={report.title} report={report} />
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <article className="rounded-[2rem] border border-white/80 bg-white p-6 shadow-card">
          <h3 className="text-xl font-semibold text-brand-ink">Summary Insights</h3>
          <div className="mt-5 space-y-4">
            {breakdown.map((item) => (
              <div key={item.label} className="rounded-[1.5rem] bg-slate-50 p-4">
                <p className="text-sm text-slate-500">{item.label}</p>
                <p className="mt-2 text-sm font-medium leading-6 text-slate-700">{item.value}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[2rem] border border-white/80 bg-white p-6 shadow-card">
          <h3 className="text-xl font-semibold text-brand-ink">Recent Completed Requests</h3>
          <div className="mt-5 space-y-4">
            {requests
              .filter((request) => request.status === "Completed")
              .map((request) => (
                <div key={request.id} className="rounded-[1.5rem] bg-brand-sand/50 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-brand-ink">{request.requestNumber}</p>
                      <p className="mt-1 text-sm text-slate-600">
                        {request.applicantName} · {request.action} · {request.systems.join(", ")}
                      </p>
                    </div>
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                      Completed
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </article>
      </section>
    </div>
  );
}
