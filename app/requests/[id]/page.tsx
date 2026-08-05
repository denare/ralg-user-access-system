import { notFound } from "next/navigation";
import { DownloadPdfButton } from "@/components/download-pdf-button";
import { PageHeader } from "@/components/page-header";
import { RequestActionNotice } from "@/components/request-action-notice";
import { StatusPill } from "@/components/status-pill";
import { requireProfile } from "@/lib/auth";
import { getVisibleRequest } from "@/lib/data";
import { formatDate } from "@/lib/utils";

export default async function RequestDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await requireProfile();
  const request = await getVisibleRequest(profile, id);

  if (!request) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <RequestActionNotice />
      <PageHeader
        eyebrow={request.requestNumber}
        title={`${request.action} for ${request.applicantName}`}
        description={`Submitted on ${formatDate(request.createdAt)} and currently owned by ${request.currentOwner}.`}
        action={<div className="flex flex-wrap items-center gap-3"><StatusPill status={request.status} /><DownloadPdfButton requestId={request.id} /></div>}
      />

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <article className="border border-slate-200 bg-white p-6 shadow-card">
          <h3 className="border-b border-slate-200 pb-3 text-xl font-bold text-brand-ink">Request Details</h3>
          <dl className="mt-5 grid gap-4 md:grid-cols-2">
            <Detail label="Region" value={request.region} />
            <Detail label="LGA" value={request.lga} />
            <Detail label="Facility" value={request.facility} />
            <Detail label="Environment" value={request.environment} />
            <Detail label="Check Number" value={request.checkNumber} />
            <Detail label="NIN" value={request.nin} />
            <Detail label="Designation" value={request.designation} />
            <Detail label="Department" value={request.department} />
            <Detail label="Phone" value={request.phone} />
            <Detail label="Email" value={request.email} />
            <Detail label="Requested Role" value={request.requestedRole} />
            <Detail label="Systems" value={request.systems.join(", ")} />
          </dl>

          <div className="mt-6 border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-medium text-slate-500">Reason</p>
            <p className="mt-2 text-sm leading-6 text-slate-700">{request.reason}</p>
          </div>

          <div className="mt-6 flex justify-end">
            <DownloadPdfButton requestId={request.id} variant="secondary" />
          </div>

          {request.targetUser ? (
            <div className="mt-6 border border-slate-200 bg-slate-50 p-4">
              <h4 className="font-semibold text-brand-ink">Target User</h4>
              <p className="mt-2 text-sm text-slate-700">
                {request.targetUser.fullName} · {request.targetUser.designation} · {request.targetUser.department}
              </p>
              <p className="mt-1 text-sm text-slate-600">
                {request.targetUser.email} · {request.targetUser.phone}
              </p>
            </div>
          ) : null}
        </article>

        <article className="border border-slate-200 bg-white p-6 shadow-card">
          <h3 className="border-b border-slate-200 pb-3 text-xl font-bold text-brand-ink">Approval History</h3>
          <div className="mt-5 space-y-4">
            {request.approvals.length ? (
              request.approvals.map((approval) => (
                <div key={approval.id} className="border-l-2 border-brand-government bg-slate-50 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-brand-ink">{approval.role}</p>
                      <p className="text-sm text-slate-500">{approval.approver}</p>
                    </div>
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                      {approval.decision}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-700">{approval.comment}</p>
                  <p className="mt-3 text-xs text-slate-500">{formatDate(approval.date)}</p>
                </div>
              ))
            ) : (
              <div className="border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                No approvals recorded yet. This request is still waiting for the first reviewer.
              </div>
            )}
          </div>
        </article>
      </section>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-slate-200 bg-slate-50 p-4">
      <dt className="text-sm text-slate-500">{label}</dt>
      <dd className="mt-2 text-sm font-medium text-slate-800">{value}</dd>
    </div>
  );
}
