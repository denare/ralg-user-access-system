import { PageHeader } from "@/components/page-header";
import { requireProfile } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AuditPage() {
  await requireProfile(["ADMIN"]);
  const logs = await prisma.auditLog.findMany({ include: { actor: { select: { fullName: true, role: true } } }, orderBy: { createdAt: "desc" }, take: 250 });
  return <div className="space-y-6"><PageHeader eyebrow="System Administration" title="Activity Audit Log" description="Chronological record of registrations, request submissions, decisions, account changes, and configuration actions." />
    <div className="overflow-x-auto border bg-white shadow-card"><table className="min-w-full divide-y text-sm"><thead className="bg-brand-ink text-left text-white"><tr><th className="px-5 py-4">Date</th><th className="px-5 py-4">Actor</th><th className="px-5 py-4">Action</th><th className="px-5 py-4">Record</th></tr></thead><tbody className="divide-y">{logs.map((log) => <tr key={log.id}><td className="px-5 py-4 text-slate-600">{formatDate(log.createdAt.toISOString())}</td><td className="px-5 py-4"><p className="font-semibold">{log.actor?.fullName ?? "System"}</p><p className="text-xs text-slate-500">{log.actor?.role ?? "Automated"}</p></td><td className="px-5 py-4 font-medium">{log.action.replaceAll("_", " ")}</td><td className="px-5 py-4 text-slate-600">{log.entityType}{log.entityId ? ` / ${log.entityId}` : ""}</td></tr>)}</tbody></table></div>
  </div>;
}
