import { cn } from "@/lib/utils";
import { RequestStatus } from "@/lib/types";

const statusStyles: Record<RequestStatus, string> = {
  Draft: "bg-slate-200 text-slate-700",
  "Pending HOD Approval": "bg-amber-100 text-amber-800",
  "Pending ICT Approval": "bg-sky-100 text-sky-800",
  Approved: "bg-emerald-100 text-emerald-800",
  Rejected: "bg-rose-100 text-rose-800",
  Completed: "bg-brand-mist text-brand-ink"
};

export function StatusPill({ status }: { status: RequestStatus }) {
  return (
    <span className={cn("inline-flex items-center rounded-full border border-current/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wide", statusStyles[status])}>
      {status}
    </span>
  );
}
