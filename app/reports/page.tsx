import { PageHeader } from "@/components/page-header";
import { ReportCard } from "@/components/report-card";
import { requireProfile } from "@/lib/auth";
import { getReportCards, getVisibleRequests } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const profile = await requireProfile(["ADMIN"]);
  const [reportCards, requests] = await Promise.all([getReportCards(), getVisibleRequests(profile)]);
  const completed = requests.filter((request) => request.status === "Completed");

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Reporting"
        title="Management Reports and Audit Oversight"
        description="Monitor request volumes, outstanding approvals, completed work, and compliance performance."
      />
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {reportCards.map((report) => <ReportCard key={report.title} report={report} />)}
      </section>
      <section className="border border-slate-200 bg-white p-6 shadow-card">
        <h3 className="border-b border-slate-200 pb-3 text-xl font-semibold text-brand-ink">Recent Completed Requests</h3>
        <div className="mt-5 grid gap-3">
          {completed.slice(0, 10).map((request) => (
            <div key={request.id} className="border border-slate-200 bg-slate-50 p-4">
              <p className="font-semibold text-brand-ink">{request.requestNumber}</p>
              <p className="mt-1 text-sm text-slate-600">{request.applicantName} | {request.action} | {request.systems.join(", ")}</p>
            </div>
          ))}
          {!completed.length ? <p className="text-sm text-slate-600">No completed requests have been recorded.</p> : null}
        </div>
      </section>
    </div>
  );
}
