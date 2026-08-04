"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type Item = { id: string; name: string; secondary: string; isActive: boolean };

export function ConfigurationManager({ departments, systems }: { departments: Item[]; systems: Item[] }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function create(event: FormEvent<HTMLFormElement>, type: "department" | "system") {
    event.preventDefault(); setSaving(true); setError("");
    const body = { type, ...Object.fromEntries(new FormData(event.currentTarget)) };
    const response = await fetch("/api/configuration", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const result = await response.json();
    if (!response.ok) setError(result.error ?? "Configuration could not be saved."); else { event.currentTarget.reset(); router.refresh(); }
    setSaving(false);
  }

  async function toggle(type: "department" | "system", item: Item) {
    setSaving(true); setError("");
    const response = await fetch("/api/configuration", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type, id: item.id, isActive: !item.isActive }) });
    if (!response.ok) setError("Configuration could not be updated."); else router.refresh();
    setSaving(false);
  }

  return <div className="grid gap-6 xl:grid-cols-2">
    {error ? <p className="border border-red-300 bg-red-50 p-3 text-sm text-red-800 xl:col-span-2">{error}</p> : null}
    <Panel title="Departments" items={departments} type="department" saving={saving} onCreate={create} onToggle={toggle} />
    <Panel title="Government Systems" items={systems} type="system" saving={saving} onCreate={create} onToggle={toggle} />
  </div>;
}

function Panel({ title, items, type, saving, onCreate, onToggle }: { title: string; items: Item[]; type: "department" | "system"; saving: boolean; onCreate: (event: FormEvent<HTMLFormElement>, type: "department" | "system") => void; onToggle: (type: "department" | "system", item: Item) => void }) {
  return <section className="border border-slate-200 bg-white p-6 shadow-card"><h3 className="text-xl font-bold text-brand-ink">{title}</h3>
    <form onSubmit={(event) => void onCreate(event, type)} className="mt-4 grid gap-3 sm:grid-cols-[1fr_150px_auto]"><input name="name" className="field" placeholder={type === "department" ? "Department name" : "System name"} required /><input name={type === "department" ? "code" : "description"} className="field" placeholder={type === "department" ? "Code" : "Description"} required={type === "department"} /><button disabled={saving} className="bg-brand-government px-4 text-sm font-bold text-white">Add</button></form>
    <div className="mt-5 divide-y border"><div className="grid grid-cols-[1fr_auto] bg-brand-ink px-4 py-3 text-sm font-semibold text-white"><span>Name</span><span>Status</span></div>{items.map((item) => <div key={item.id} className="grid grid-cols-[1fr_auto] items-center gap-4 px-4 py-3"><div><p className="font-semibold text-brand-ink">{item.name}</p><p className="text-xs text-slate-500">{item.secondary}</p></div><button disabled={saving} onClick={() => void onToggle(type, item)} className={`px-3 py-2 text-xs font-semibold ${item.isActive ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700"}`}>{item.isActive ? "Active" : "Inactive"}</button></div>)}</div>
  </section>;
}
