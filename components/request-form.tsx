"use client";

import { FormEvent, ReactNode, useState } from "react";
import { useRouter } from "next/navigation";
import { lgasByRegion, regions, type Region } from "@/lib/constants";

const actionOptions = ["Create User", "Modify User", "Block User", "Reset Password"] as const;
const environmentOptions = ["Production", "Testing"] as const;

const initialState = {
  region: "Pwani",
  lga: "",
  facility: "",
  action: "Create User",
  environment: "Production",
  checkNumber: "",
  nin: "",
  fullName: "",
  designation: "",
  department: "",
  phone: "",
  email: "",
  targetCheckNumber: "",
  targetFullName: "",
  targetDesignation: "",
  targetDepartment: "",
  targetPhone: "",
  targetEmail: "",
  requestedRole: "",
  otherSystem: "",
  reason: ""
};

type ApplicantProfile = {
  fullName: string;
  email: string;
  phone: string | null;
  department: string | null;
  designation: string | null;
  region: string | null;
};

export function RequestForm({ profile, systems }: { profile: ApplicantProfile; systems: string[] }) {
  const router = useRouter();
  const [selectedSystems, setSelectedSystems] = useState<string[]>(systems.slice(0, 1));
  const [form, setForm] = useState({ ...initialState, region: profile.region ?? initialState.region,
    fullName: profile.fullName, email: profile.email, phone: profile.phone ?? "",
    department: profile.department ?? "", designation: profile.designation ?? "" });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  function toggleSystem(system: string) {
    setSelectedSystems((current) =>
      current.includes(system) ? current.filter((item) => item !== system) : [...current, system]
    );
  }

  const requiresTargetUser = form.action === "Modify User" || form.action === "Block User";
  const availableLgas = lgasByRegion[form.region as Region] ?? [];

  async function saveRequest(mode: "draft" | "submit") {
    setSaving(true);
    setMessage("");

    try {
      const response = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, systems: selectedSystems, mode })
      });
      const responseText = await response.text();
      let result: { id?: string; error?: string } = {};

      if (responseText) {
        try {
          result = JSON.parse(responseText) as { id?: string; error?: string };
        } catch {
          result = {};
        }
      }

      if (!response.ok) {
        const fallback = response.status === 503
          ? "The request service is temporarily unavailable. Please try again shortly."
          : "The request could not be saved. Please try again or contact the ICT support office.";
        throw new Error(result.error ?? fallback);
      }
      if (!result.id) throw new Error("The server did not confirm the request reference. Please try again.");

      router.push(`/requests/${result.id}`);
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The request could not be saved.");
      setSaving(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void saveRequest("submit");
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
      <section className="space-y-6 border border-slate-200 bg-white p-6 shadow-card">
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Region">
            <select
              value={form.region}
              onChange={(event) => setForm({ ...form, region: event.target.value, lga: "" })}
              className="field"
            >
              {regions.map((region) => (
                <option key={region}>{region}</option>
              ))}
            </select>
          </Field>
          <Field label="LGA">
            <select
              className="field"
              value={form.lga}
              onChange={(event) => setForm({ ...form, lga: event.target.value })}
              required
            >
              <option value="">Select LGA</option>
              {availableLgas.map((lga) => <option key={lga} value={lga}>{lga}</option>)}
            </select>
          </Field>
          <Field label="Facility">
            <input
              className="field"
              value={form.facility}
              onChange={(event) => setForm({ ...form, facility: event.target.value })}
              placeholder="HQ"
            />
          </Field>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Requested Action">
            <div className="grid gap-3 md:grid-cols-2">
              {actionOptions.map((option) => (
                <label key={option} className="choice-card">
                  <input
                    type="radio"
                    name="action"
                    value={option}
                    checked={form.action === option}
                    onChange={(event) => setForm({ ...form, action: event.target.value as typeof form.action })}
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </Field>
          <Field label="Operating Environment">
            <div className="grid gap-3 md:grid-cols-2">
              {environmentOptions.map((option) => (
                <label key={option} className="choice-card">
                  <input
                    type="radio"
                    name="environment"
                    value={option}
                    checked={form.environment === option}
                    onChange={(event) =>
                      setForm({ ...form, environment: event.target.value as typeof form.environment })
                    }
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </Field>
        </div>

        <SectionTitle
          title="Section A. Applicant Details"
          description="Provide the applicant's official employment and contact information."
        />

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Check Number">
            <input className="field" value={form.checkNumber} onChange={(e) => setForm({ ...form, checkNumber: e.target.value })} />
          </Field>
          <Field label="NIN">
            <input className="field" value={form.nin} onChange={(e) => setForm({ ...form, nin: e.target.value })} />
          </Field>
          <Field label="Full Name">
            <input className="field bg-slate-100" value={form.fullName} readOnly />
          </Field>
          <Field label="Designation">
            <input className="field bg-slate-100" value={form.designation} readOnly />
          </Field>
          <Field label="Department">
            <input className="field bg-slate-100" value={form.department} readOnly />
          </Field>
          <Field label="Phone Number">
            <input className="field bg-slate-100" value={form.phone} readOnly />
          </Field>
          <Field label="Email Address" className="md:col-span-2">
            <input className="field bg-slate-100" value={form.email} readOnly />
          </Field>
        </div>

        {requiresTargetUser ? (
          <>
            <SectionTitle
              title="Section A-1. User To Be Updated"
              description="Used for modify or block requests where the applicant is acting on another account."
            />
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Target Check Number">
                <input
                  className="field"
                  value={form.targetCheckNumber}
                  onChange={(e) => setForm({ ...form, targetCheckNumber: e.target.value })}
                />
              </Field>
              <Field label="Target Full Name">
                <input
                  className="field"
                  value={form.targetFullName}
                  onChange={(e) => setForm({ ...form, targetFullName: e.target.value })}
                />
              </Field>
              <Field label="Target Designation">
                <input
                  className="field"
                  value={form.targetDesignation}
                  onChange={(e) => setForm({ ...form, targetDesignation: e.target.value })}
                />
              </Field>
              <Field label="Target Department">
                <input
                  className="field"
                  value={form.targetDepartment}
                  onChange={(e) => setForm({ ...form, targetDepartment: e.target.value })}
                />
              </Field>
              <Field label="Target Phone">
                <input
                  className="field"
                  value={form.targetPhone}
                  onChange={(e) => setForm({ ...form, targetPhone: e.target.value })}
                />
              </Field>
              <Field label="Target Email">
                <input
                  className="field"
                  value={form.targetEmail}
                  onChange={(e) => setForm({ ...form, targetEmail: e.target.value })}
                />
              </Field>
            </div>
          </>
        ) : null}

        <SectionTitle
          title="Requested Systems"
          description="Select every government information system for which access is requested."
        />

        <div className="grid gap-3 md:grid-cols-3">
          {systems.map((system) => (
            <label key={system} className="choice-card">
              <input
                type="checkbox"
                checked={selectedSystems.includes(system)}
                onChange={() => toggleSystem(system)}
              />
              <span>{system}</span>
            </label>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Requested System Role(s)">
            <input
              className="field"
              value={form.requestedRole}
              onChange={(e) => setForm({ ...form, requestedRole: e.target.value })}
              placeholder="Regional Officer"
            />
          </Field>
          <Field label="Other System">
            <input
              className="field"
              value={form.otherSystem}
              onChange={(e) => setForm({ ...form, otherSystem: e.target.value })}
              placeholder="Optional"
            />
          </Field>
          <Field label="Reason For Request" className="md:col-span-2">
            <textarea
              className="field min-h-32"
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              placeholder="Why this access is needed, urgency, and any supporting context."
            />
          </Field>
        </div>
      </section>

      <aside className="space-y-6">
        <section className="border border-slate-200 bg-white p-6 shadow-card">
          <h3 className="border-b border-slate-200 pb-3 text-lg font-bold text-brand-ink">Approval Process</h3>
          <ol className="mt-4 space-y-3 text-sm text-slate-600">
            <li className="border-l-2 border-brand-government bg-slate-50 p-3">1. The applicant submits the request and receives a reference number.</li>
            <li className="border-l-2 border-brand-government bg-slate-50 p-3">2. The Head of Department records an approval or rejection.</li>
            <li className="border-l-2 border-brand-government bg-slate-50 p-3">3. ICT validates the authorization, provisions access, and closes the request.</li>
          </ol>
        </section>

        <section className="border border-amber-300 bg-amber-50 p-6">
          <h3 className="text-lg font-bold text-brand-ink">Submission Requirements</h3>
          <ul className="mt-4 space-y-3 text-sm text-slate-700">
            <li>Confirm that personal and employment details are accurate.</li>
            <li>Select only systems required for official duties.</li>
            <li>State the requested role and provide a clear business justification.</li>
            <li>False or incomplete information may result in rejection.</li>
          </ul>
        </section>

        <section className="border border-slate-800 bg-brand-ink p-6 text-white shadow-card">
          <h3 className="border-b border-white/20 pb-3 text-lg font-bold">Request Summary</h3>
          <div className="mt-4 space-y-3 text-sm text-white/80">
            <p>Action: {form.action}</p>
            <p>Environment: {form.environment}</p>
            <p>Systems: {selectedSystems.join(", ") || "No system selected yet"}</p>
            <p>Approval path: Head of Department to ICT Officer to Completion</p>
          </div>
          <div className="mt-6 flex gap-3">
            <button
              type="button"
              disabled={saving}
              onClick={() => void saveRequest("draft")}
              className="rounded-sm border border-white bg-transparent px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10 disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Draft"}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-sm bg-brand-gold px-5 py-2.5 text-sm font-bold text-slate-900 hover:bg-yellow-300 disabled:opacity-60"
            >
              {saving ? "Processing..." : "Submit Request"}
            </button>
          </div>
          {message ? <p className="mt-4 border border-red-300 bg-red-50 p-3 text-sm text-red-800">{message}</p> : null}
        </section>
      </aside>
    </form>
  );
}

function Field({
  label,
  children,
  className
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={className}>
      <span className="mb-2 block text-sm font-semibold text-slate-700">{label}</span>
      {children}
    </label>
  );
}

function SectionTitle({ title, description }: { title: string; description: string }) {
  return (
    <div className="border-b border-slate-200 pb-3">
      <h3 className="text-xl font-bold text-brand-ink">{title}</h3>
      <p className="mt-2 text-sm text-slate-600">{description}</p>
    </div>
  );
}
