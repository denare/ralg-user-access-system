import Link from "next/link";
import { DownloadPdfButton } from "@/components/download-pdf-button";
import { AccessRequest } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { StatusPill } from "@/components/status-pill";

export function RequestTable({ items }: { items: AccessRequest[] }) {
  if (!items.length) {
    return (
      <div className="border border-slate-200 bg-white px-6 py-12 text-center shadow-card">
        <div className="mx-auto max-w-sm">
          <p className="font-serif text-lg font-bold text-brand-ink">No requests recorded</p>
          <p className="mt-2 text-sm leading-6 text-slate-500">Requests available to your role will appear in this official register.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-3 xl:hidden">
        {items.map((request) => (
          <article key={request.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <Link href={`/requests/${request.id}`} className="break-words font-semibold text-brand-ink hover:text-brand-moss">
                  {request.requestNumber}
                </Link>
                <p className="mt-1 text-sm font-medium text-slate-800">{request.applicantName}</p>
                <p className="mt-1 text-xs text-slate-500">{request.region} · {request.facility}</p>
              </div>
              <div className="w-fit max-w-full">
                <StatusPill status={request.status} />
              </div>
            </div>
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">Action</dt>
                <dd className="mt-1 text-slate-800">{request.action}</dd>
              </div>
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">Updated</dt>
                <dd className="mt-1 text-slate-800">{formatDate(request.updatedAt)}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">Department</dt>
                <dd className="mt-1 text-slate-800">{request.department}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">Systems</dt>
                <dd className="mt-1 text-slate-800">{request.systems.slice(0, 3).join(", ") || "Not specified"}</dd>
              </div>
            </dl>
            <div className="mt-4">
              <DownloadPdfButton requestId={request.id} variant="compact" />
            </div>
          </article>
        ))}
      </div>
      <div className="table-scroll hidden border border-slate-200 bg-white shadow-card xl:block">
        <table className="min-w-[940px] divide-y divide-slate-100 text-sm">
          <thead className="bg-brand-ink">
            <tr className="text-left text-[11px] uppercase tracking-[0.1em] text-white/80">
              <th className="px-5 py-4 font-bold">Request</th>
              <th className="px-5 py-4 font-bold">Applicant</th>
              <th className="px-5 py-4 font-bold">Action</th>
              <th className="px-5 py-4 font-bold">Systems</th>
              <th className="px-5 py-4 font-bold">Status</th>
              <th className="px-5 py-4 font-bold">Updated</th>
              <th className="px-5 py-4 font-bold">Report</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((request) => (
              <tr key={request.id} className="transition-colors duration-150 hover:bg-emerald-50/40">
                <td className="px-5 py-4">
                  <Link href={`/requests/${request.id}`} className="font-semibold text-brand-ink hover:text-brand-moss">
                    {request.requestNumber}
                  </Link>
                  <p className="mt-1 text-xs text-slate-500">
                    {request.region} · {request.facility}
                  </p>
                </td>
                <td className="px-5 py-4">
                  <p className="font-medium text-slate-800">{request.applicantName}</p>
                  <p className="mt-1 text-xs text-slate-500">{request.department}</p>
                </td>
                <td className="px-5 py-4">{request.action}</td>
                <td className="px-5 py-4">{request.systems.slice(0, 3).join(", ")}</td>
                <td className="px-5 py-4">
                  <StatusPill status={request.status} />
                </td>
                <td className="px-5 py-4 text-slate-500">{formatDate(request.updatedAt)}</td>
                <td className="px-5 py-4">
                  <DownloadPdfButton requestId={request.id} variant="compact" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
