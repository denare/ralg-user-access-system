import { notFound } from "next/navigation";
import { DownloadPdfButton } from "@/components/download-pdf-button";
import { PageHeader } from "@/components/page-header";
import { RequestActionNotice } from "@/components/request-action-notice";
import { StatusPill } from "@/components/status-pill";
import { requireProfile } from "@/lib/auth";
import { getVisibleRequest } from "@/lib/data";
import { formatDate } from "@/lib/utils";
import { CheckCircle2, Clock, ShieldCheck, UserCheck, FileText, Stamp } from "lucide-react";

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

  const hodApproval = request.approvals.find((a) => a.role === "Head of Department");
  const ictApproval = request.approvals.find((a) => a.role === "ICT Officer");

  const steps = [
    {
      title: "Applicant Submitted",
      description: `Submitted by ${request.applicantName}`,
      date: formatDate(request.createdAt),
      status: "COMPLETED",
      icon: FileText
    },
    {
      title: "Head of Department (HOD)",
      description: hodApproval
        ? `${hodApproval.approver} (${hodApproval.decision})`
        : request.status === "Pending HOD Approval"
        ? "Awaiting HOD approval..."
        : "Pending approval",
      date: hodApproval ? formatDate(hodApproval.date) : undefined,
      status: hodApproval ? (hodApproval.decision === "Approved" ? "COMPLETED" : "REJECTED") : request.status === "Pending HOD Approval" ? "CURRENT" : "UPCOMING",
      icon: UserCheck
    },
    {
      title: "ICT Officer & Official Seal",
      description: ictApproval
        ? `${ictApproval.approver} (${ictApproval.decision})`
        : request.status === "Pending ICT Approval"
        ? "Awaiting ICT Officer verification & seal..."
        : "Pending HOD approval",
      date: ictApproval ? formatDate(ictApproval.date) : undefined,
      status: ictApproval ? (ictApproval.decision === "Approved" ? "COMPLETED" : "REJECTED") : request.status === "Pending ICT Approval" ? "CURRENT" : "UPCOMING",
      icon: Stamp
    },
    {
      title: "Official Approval & PDF",
      description: request.status === "Completed" || request.status === "Approved"
        ? "Access granted. Official sealed report available for download."
        : request.status === "Rejected"
        ? "Request rejected."
        : "Awaiting final approval",
      date: request.status === "Completed" ? formatDate(request.updatedAt) : undefined,
      status: request.status === "Completed" || request.status === "Approved" ? "COMPLETED" : request.status === "Rejected" ? "REJECTED" : "UPCOMING",
      icon: ShieldCheck
    }
  ];

  return (
    <div className="space-y-6">
      <RequestActionNotice />
      <PageHeader
        eyebrow={request.requestNumber}
        title={`${request.action} for ${request.applicantName}`}
        description={`Submitted on ${formatDate(request.createdAt)} · Owned by ${request.currentOwner}.`}
        action={
          <div className="flex flex-wrap items-center gap-3">
            <StatusPill status={request.status} />
            <DownloadPdfButton requestId={request.id} />
          </div>
        }
      />

      {/* Progress Tracking Stepper */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-6 flex items-center gap-2">
          <Clock className="h-4 w-4 text-brand-government" /> Application Workflow Tracker
        </h3>
        <div className="grid gap-6 md:grid-cols-4 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isDone = step.status === "COMPLETED";
            const isCurrent = step.status === "CURRENT";
            const isRejected = step.status === "REJECTED";

            return (
              <div key={step.title} className="relative flex flex-col items-start">
                <div className="flex items-center gap-3">
                  <div
                    className={`grid h-10 w-10 place-items-center rounded-xl font-bold transition-all shadow-sm ${
                      isDone
                        ? "bg-emerald-600 text-white"
                        : isCurrent
                        ? "bg-amber-500 text-white ring-4 ring-amber-100 animate-pulse"
                        : isRejected
                        ? "bg-red-600 text-white"
                        : "bg-slate-100 text-slate-400 border border-slate-200"
                    }`}
                  >
                    {isDone ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Step {idx + 1}</p>
                    <p className="text-sm font-semibold text-slate-900 leading-tight">{step.title}</p>
                  </div>
                </div>
                <div className="mt-3 text-xs leading-relaxed text-slate-600">
                  <p className="font-medium text-slate-800">{step.description}</p>
                  {step.date ? <p className="mt-1 text-[11px] text-slate-400 font-mono">{step.date}</p> : null}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="border-b border-slate-200 pb-3 text-lg font-bold text-brand-ink">Request Details</h3>
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

          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Justification & Reason</p>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">{request.reason}</p>
          </div>

          <div className="mt-6 flex justify-end">
            <DownloadPdfButton requestId={request.id} variant="secondary" />
          </div>

          {request.targetUser ? (
            <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <h4 className="font-semibold text-brand-ink text-sm">Target User Profile</h4>
              <p className="mt-2 text-sm text-slate-700">
                {request.targetUser.fullName} · {request.targetUser.designation} · {request.targetUser.department}
              </p>
              <p className="mt-1 text-xs text-slate-600">
                {request.targetUser.email} · {request.targetUser.phone}
              </p>
            </div>
          ) : null}
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="border-b border-slate-200 pb-3 text-lg font-bold text-brand-ink">Approval & Seal Records</h3>
          <div className="mt-5 space-y-4">
            {request.approvals.length ? (
              request.approvals.map((approval) => (
                <div key={approval.id} className="rounded-xl border-l-4 border-brand-government bg-slate-50 p-4 border border-slate-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-brand-ink text-sm">{approval.role}</p>
                      <p className="text-xs text-slate-500">{approval.approver}</p>
                    </div>
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                      {approval.decision}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-slate-700">{approval.comment}</p>
                  <p className="mt-3 text-[11px] text-slate-400 font-mono">{formatDate(approval.date)}</p>
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-600">
                No approvals recorded yet. Request is in queue for HOD review.
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
    <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3.5">
      <dt className="text-xs font-semibold text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-slate-900">{value}</dd>
    </div>
  );
}
