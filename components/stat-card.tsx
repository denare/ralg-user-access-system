import { DashboardStat } from "@/lib/types";

export function StatCard({ stat }: { stat: DashboardStat }) {
  return (
    <article className="relative overflow-hidden border border-slate-200 bg-white p-5 shadow-card">
      <div className="absolute inset-x-0 top-0 h-1 bg-brand-government" />
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">{stat.label}</p>
      <p className="mt-4 font-serif text-4xl font-bold tracking-tight text-brand-ink">{stat.value}</p>
      <p className="mt-2 text-sm leading-5 text-slate-600">{stat.hint}</p>
    </article>
  );
}
