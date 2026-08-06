import { PageHeader } from "@/components/page-header";
import { DownloadPdfButton } from "@/components/download-pdf-button";
import { ReportCard } from "@/components/report-card";
import { requireProfile } from "@/lib/auth";
import { getScopedReportCards, getVisibleRequests } from "@/lib/data";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const profile = await requireProfile(["APPLICANT", "ICT_OFFICER", "ADMIN"]);
  const reportCards = await getScopedReportCards(profile);
  const requests = await getVisibleRequests(profile);
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
      <section className="min-w-0 border border-slate-200 bg-white p-4 shadow-card sm:p-6">
        <h3 className="border-b border-slate-200 pb-3 text-xl font-semibold text-brand-ink">Recent Completed Requests</h3>
        <div className="mt-5 grid gap-3">
          {completed.slice(0, 10).map((request) => (
            <div key={request.id} className="flex min-w-0 flex-col gap-3 border border-slate-200 bg-slate-50 p-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <p className="font-semibold text-brand-ink">{request.requestNumber}</p>
                <p className="mt-1 break-words text-sm text-slate-600">{request.applicantName} | {request.action} | {request.systems.join(", ")}</p>
              </div>
              <DownloadPdfButton requestId={request.id} variant="compact" />
            </div>
          ))}
          {!completed.length ? <p className="text-sm text-slate-600">No completed requests have been recorded.</p> : null}
        </div>
      </section>
      <section className="min-w-0 border border-slate-200 bg-white p-4 shadow-card sm:p-6">
        <h3 className="border-b border-slate-200 pb-3 text-xl font-semibold text-brand-ink">Detailed Request Report</h3>
        <div className="mt-5 space-y-4">
          {requests.map((request) => (
            <article key={request.id} className="min-w-0 border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-col gap-3 border-b border-slate-200 pb-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <p className="font-semibold text-brand-ink">{request.requestNumber}</p>
                  <p className="mt-1 break-words text-sm text-slate-600">{request.applicantName} | {request.action} | {request.status}</p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <p className="text-xs text-slate-500">Updated {formatDate(request.updatedAt)}</p>
                  <DownloadPdfButton requestId={request.id} variant="compact" />
                </div>
              </div>
              <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                <Detail label="Region" value={request.region} />
                <Detail label="LGA" value={request.lga} />
                <Detail label="Facility" value={request.facility} />
                <Detail label="Environment" value={request.environment} />
                <Detail label="Department" value={request.department} />
                <Detail label="Designation" value={request.designation} />
                <Detail label="Check Number" value={request.checkNumber} />
                <Detail label="NIN" value={request.nin} />
                <Detail label="Email" value={request.email} />
                <Detail label="Phone" value={request.phone} />
                <Detail label="Requested Role" value={request.requestedRole} />
                <Detail label="Systems" value={request.systems.join(", ")} />
              </dl>
              <div className="mt-4">
                <p className="text-sm font-semibold text-brand-ink">Reason</p>
                <p className="mt-1 text-sm leading-6 text-slate-700">{request.reason}</p>
              </div>
            </article>
          ))}
          {!requests.length ? <p className="text-sm text-slate-600">No requests are available for your reporting scope.</p> : null}
        </div>
      </section>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return <div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</dt><dd className="mt-1 text-sm text-slate-800">{value}</dd></div>;
}
