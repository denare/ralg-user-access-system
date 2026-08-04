import Link from "next/link";
import { AccessRequest } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { StatusPill } from "@/components/status-pill";

export function RequestTable({ items }: { items: AccessRequest[] }) {
  return (
    <div className="overflow-hidden rounded-[2rem] border border-white/80 bg-white shadow-card">
      <table className="min-w-full divide-y divide-slate-100 text-sm">
        <thead className="bg-slate-50">
          <tr className="text-left text-slate-500">
            <th className="px-5 py-4 font-medium">Request</th>
            <th className="px-5 py-4 font-medium">Applicant</th>
            <th className="px-5 py-4 font-medium">Action</th>
            <th className="px-5 py-4 font-medium">Systems</th>
            <th className="px-5 py-4 font-medium">Status</th>
            <th className="px-5 py-4 font-medium">Updated</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {items.map((request) => (
            <tr key={request.id} className="hover:bg-slate-50/70">
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
        </tbody>
      </table>
    </div>
  );
}
