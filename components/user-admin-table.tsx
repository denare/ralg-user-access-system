"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ManagedUser = {
  id: string;
  fullName: string;
  email: string;
  department: string;
  designation: string;
  role: "APPLICANT" | "HOD" | "ICT_OFFICER" | "ADMIN";
  isActive: boolean;
};

const roleLabels = {
  APPLICANT: "Employee (Applicant)",
  HOD: "Head of Department",
  ICT_OFFICER: "ICT Officer",
  ADMIN: "System Administrator"
};

export function UserAdminTable({ users }: { users: ManagedUser[] }) {
  const router = useRouter();
  const [savingId, setSavingId] = useState("");
  const [error, setError] = useState("");

  async function updateUser(id: string, update: { role?: ManagedUser["role"]; isActive?: boolean }) {
    setSavingId(id);
    setError("");
    const response = await fetch(`/api/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(update)
    });
    const result = await response.json();
    if (!response.ok) setError(result.error ?? "The account could not be updated.");
    else router.refresh();
    setSavingId("");
  }

  return (
    <div className="table-scroll border border-slate-200 bg-white shadow-card">
      {error ? <p className="border-b border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p> : null}
      <table className="min-w-[900px] divide-y divide-slate-200 text-sm">
        <thead className="bg-brand-ink text-left text-white">
          <tr>
            <th className="px-5 py-4">Officer</th>
            <th className="px-5 py-4">Department</th>
            <th className="px-5 py-4">System Role</th>
            <th className="px-5 py-4">Account Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {users.map((user) => (
            <tr key={user.id}>
              <td className="px-5 py-4">
                <p className="font-semibold text-brand-ink">{user.fullName}</p>
                <p className="mt-1 text-xs text-slate-500">{user.email} | {user.designation}</p>
              </td>
              <td className="px-5 py-4 text-slate-700">{user.department}</td>
              <td className="px-5 py-4">
                <select
                  value={user.role}
                  disabled={savingId === user.id}
                  onChange={(event) => void updateUser(user.id, { role: event.target.value as ManagedUser["role"] })}
                  className="field min-w-48"
                  aria-label={`Role for ${user.fullName}`}
                >
                  {Object.entries(roleLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </td>
              <td className="px-5 py-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-sm px-3 py-2 text-xs font-semibold ${user.isActive ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700"}`}>
                    {user.isActive ? "Active" : "Inactive"}
                  </span>
                  <button
                    type="button"
                    disabled={savingId === user.id}
                    onClick={() => void updateUser(user.id, { isActive: !user.isActive })}
                    className="button-secondary min-h-0 px-3 py-2 text-xs"
                  >
                    {savingId === user.id ? "Updating..." : user.isActive ? "Deactivate" : "Activate"}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
