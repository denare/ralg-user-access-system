import Link from "next/link";
import { AccessRequest } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { StatusPill } from "@/components/status-pill";

export function RequestTable({ items }: { items: AccessRequest[] }) {
  return (
    <div className="overflow-x-auto border border-slate-200 bg-white shadow-card">
      <table className="min-w-full divide-y divide-slate-100 text-sm">
        <thead className="bg-brand-ink">
          <tr className="text-left text-[11px] uppercase tracking-[0.1em] text-white/80">
            <th className="px-5 py-4 font-bold">Request</th>
            <th className="px-5 py-4 font-bold">Applicant</th>
            <th className="px-5 py-4 font-bold">Action</th>
            <th className="px-5 py-4 font-bold">Systems</th>
            <th className="px-5 py-4 font-bold">Status</th>
            <th className="px-5 py-4 font-bold">Updated</th>
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
            </tr>
          ))}
          {!items.length ? <tr><td colSpan={6} className="px-6 py-12 text-center"><div className="mx-auto max-w-sm"><p className="font-serif text-lg font-bold text-brand-ink">No requests recorded</p><p className="mt-2 text-sm leading-6 text-slate-500">Requests available to your role will appear in this official register.</p></div></td></tr> : null}
        </tbody>
      </table>
    </div>
  );
}
