"use client";

import { ReactNode, useState } from "react";
import { regions, systemsCatalog } from "@/lib/mock-data";

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

export function RequestForm() {
  const [selectedSystems, setSelectedSystems] = useState<string[]>(["LGRCIS"]);
  const [form, setForm] = useState(initialState);

  function toggleSystem(system: string) {
    setSelectedSystems((current) =>
      current.includes(system) ? current.filter((item) => item !== system) : [...current, system]
    );
  }

  const requiresTargetUser = form.action === "Modify User" || form.action === "Block User";

  return (
    <form className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
      <section className="space-y-6 rounded-[2rem] border border-white/80 bg-white p-6 shadow-card">
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Region">
            <select
              value={form.region}
              onChange={(event) => setForm({ ...form, region: event.target.value })}
              className="field"
            >
              {regions.map((region) => (
                <option key={region}>{region}</option>
              ))}
            </select>
          </Field>
          <Field label="LGA">
            <input
              className="field"
              value={form.lga}
              onChange={(event) => setForm({ ...form, lga: event.target.value })}
              placeholder="Kibaha TC"
            />
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
          description="Capture the employee information exactly once so the system can track request history."
        />

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Check Number">
            <input className="field" value={form.checkNumber} onChange={(e) => setForm({ ...form, checkNumber: e.target.value })} />
          </Field>
          <Field label="NIN">
            <input className="field" value={form.nin} onChange={(e) => setForm({ ...form, nin: e.target.value })} />
          </Field>
          <Field label="Full Name">
            <input className="field" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
          </Field>
          <Field label="Designation">
            <input className="field" value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} />
          </Field>
          <Field label="Department">
            <input className="field" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
          </Field>
          <Field label="Phone Number">
            <input className="field" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </Field>
          <Field label="Email Address" className="md:col-span-2">
            <input className="field" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
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
          description="Convert the paper checkbox grid into searchable, reportable structured data."
        />

        <div className="grid gap-3 md:grid-cols-3">
          {systemsCatalog.map((system) => (
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
        <section className="rounded-[2rem] border border-white/80 bg-white p-6 shadow-card">
          <h3 className="text-lg font-semibold text-brand-ink">Workflow Preview</h3>
          <ol className="mt-5 space-y-4 text-sm text-slate-600">
            <li className="rounded-2xl bg-slate-50 p-4">1. Employee submits request and receives tracking number.</li>
            <li className="rounded-2xl bg-slate-50 p-4">2. Head of Department reviews business need and approves or rejects.</li>
            <li className="rounded-2xl bg-slate-50 p-4">3. ICT validates, provisions access, and closes the request with an audit trail.</li>
          </ol>
        </section>

        <section className="rounded-[2rem] border border-brand-clay/20 bg-brand-sand/70 p-6">
          <h3 className="text-lg font-semibold text-brand-ink">What this system should add</h3>
          <ul className="mt-4 space-y-3 text-sm text-slate-700">
            <li>Search by name, check number, region, department, and system.</li>
            <li>Email notifications for submit, approve, reject, and complete events.</li>
            <li>PDF export of approved forms with signatures and timestamps.</li>
            <li>Audit log for compliance and internal review.</li>
          </ul>
        </section>

        <section className="rounded-[2rem] border border-white/80 bg-brand-ink p-6 text-white shadow-card">
          <h3 className="text-lg font-semibold">Draft Summary</h3>
          <div className="mt-4 space-y-3 text-sm text-white/80">
            <p>Action: {form.action}</p>
            <p>Environment: {form.environment}</p>
            <p>Systems: {selectedSystems.join(", ") || "No system selected yet"}</p>
            <p>Approver path: Head of Department → ICT Officer → Completed</p>
          </div>
          <div className="mt-6 flex gap-3">
            <button type="button" className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-brand-ink">
              Save Draft
            </button>
            <button type="submit" className="rounded-full bg-brand-clay px-5 py-3 text-sm font-semibold text-white">
              Submit Request
            </button>
          </div>
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
      <span className="mb-2 block text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}

function SectionTitle({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h3 className="text-xl font-semibold text-brand-ink">{title}</h3>
      <p className="mt-2 text-sm text-slate-600">{description}</p>
    </div>
  );
}
