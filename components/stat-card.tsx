import { DashboardStat } from "@/lib/types";

export function StatCard({ stat }: { stat: DashboardStat }) {
  return (
    <article className="rounded-[1.75rem] border border-brand-ink/10 bg-white p-5 shadow-card">
      <p className="text-sm text-slate-500">{stat.label}</p>
      <p className="mt-3 text-3xl font-semibold text-brand-ink">{stat.value}</p>
      <p className="mt-2 text-sm text-slate-600">{stat.hint}</p>
    </article>
  );
}
