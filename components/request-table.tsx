"use client";

import { useState } from "react";
import { DownloadPdfButton } from "@/components/download-pdf-button";
import { AccessRequest } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { StatusPill } from "@/components/status-pill";
import { RequestDetailsModal } from "@/components/request-details-modal";
import { DownloadAllModal } from "@/components/download-all-modal";
import { useLanguage } from "@/components/language-provider";
import { Download, Filter, Search, ChevronDown } from "lucide-react";

export function RequestTable({
  items,
  userRole
}: {
  items: AccessRequest[];
  userRole?: "APPLICANT" | "HOD" | "ICT_OFFICER" | "ADMIN";
}) {
  const { t } = useLanguage();
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [downloadAllOpen, setDownloadAllOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");

  const canDownloadAll = userRole === "ICT_OFFICER" || userRole === "ADMIN";
  const canDownloadPdf = userRole === "ICT_OFFICER" || userRole === "ADMIN";

  const departmentsList = Array.from(new Set(items.map((i) => i.department).filter(Boolean)));

  const filteredItems = items.filter((item) => {
    if (filterDepartment !== "ALL" && item.department?.toLowerCase() !== filterDepartment.toLowerCase()) return false;
    if (filterStatus !== "ALL" && item.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNumber = item.requestNumber.toLowerCase().includes(q);
      const matchApplicant = item.applicantName.toLowerCase().includes(q);
      const matchDept = item.department.toLowerCase().includes(q);
      if (!matchNumber && !matchApplicant && !matchDept) return false;
    }
    return true;
  });

  if (!items.length) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center shadow-card">
        <div className="mx-auto max-w-sm">
          <p className="font-serif text-lg font-bold text-brand-ink">No requests recorded</p>
          <p className="mt-2 text-sm leading-6 text-slate-500">Requests available to your role will appear in this official register.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Table Toolbar: Filter Controls & Download All button */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder={t("searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">All Depts</option>
              {departmentsList.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING_HOD">Pending HOD</option>
              <option value="PENDING_ICT">Pending ICT</option>
              <option value="COMPLETED">Completed</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
          <span className="text-xs font-semibold text-slate-500">
            {filteredItems.length} {t("requestsFound")}
          </span>

          {canDownloadAll && (
            <button
              onClick={() => setDownloadAllOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-800 active:scale-95 transition-all"
            >
              <Download className="h-4 w-4" />
              {t("downloadAll")}
            </button>
          )}
        </div>
      </div>

      {/* Cards View for Mobile Viewports */}
      <div className="grid gap-3 lg:hidden">
        {filteredItems.map((request) => (
          <article
            key={request.id}
            onClick={() => setSelectedRequest(request)}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card hover:border-slate-300 cursor-pointer transition-all active:scale-[0.99]"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <span className="break-words font-bold text-brand-ink text-sm hover:text-brand-moss">
                  {request.requestNumber}
                </span>
                <p className="mt-1 text-xs font-semibold text-slate-800">{request.applicantName}</p>
                <p className="mt-0.5 text-[11px] text-slate-500">{request.region} &bull; {request.facility}</p>
              </div>
              <div className="w-fit max-w-full">
                <StatusPill status={request.status} />
              </div>
            </div>
            <dl className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Action</dt>
                <dd className="mt-0.5 text-slate-800 font-medium">{request.action}</dd>
              </div>
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Updated</dt>
                <dd className="mt-0.5 text-slate-800 font-medium">{formatDate(request.updatedAt)}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>

      {/* Responsive Horizontal Scroll Table Container for Desktop/Tablet */}
      <div className="hidden lg:block rounded-2xl border border-slate-200 bg-white shadow-card overflow-hidden">
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[900px] divide-y divide-slate-100 text-xs">
            <thead className="bg-brand-ink">
              <tr className="text-left text-[11px] uppercase tracking-wider text-white/80">
                <th className="px-5 py-4 font-bold">Request</th>
                <th className="px-5 py-4 font-bold">Applicant</th>
                <th className="px-5 py-4 font-bold">Action</th>
                <th className="px-5 py-4 font-bold">Systems</th>
                <th className="px-5 py-4 font-bold">Status 🔽</th>
                <th className="px-5 py-4 font-bold">Updated</th>
                {canDownloadPdf && <th className="px-5 py-4 font-bold">Report</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map((request) => (
                <tr
                  key={request.id}
                  onClick={() => setSelectedRequest(request)}
                  className="transition-colors duration-150 hover:bg-slate-50/80 cursor-pointer"
                >
                  <td className="px-5 py-4">
                    <span className="font-bold text-brand-ink hover:text-brand-moss text-sm">
                      {request.requestNumber}
                    </span>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      {request.region} &bull; {request.facility}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-semibold text-slate-900">{request.applicantName}</p>
                    <p className="mt-0.5 text-[11px] text-slate-500">{request.department}</p>
                  </td>
                  <td className="px-5 py-4 font-medium text-slate-800">{request.action}</td>
                  <td className="px-5 py-4 text-slate-600">{request.systems.slice(0, 3).join(", ")}</td>
                  <td className="px-5 py-4">
                    <StatusPill status={request.status} />
                  </td>
                  <td className="px-5 py-4 text-slate-500">{formatDate(request.updatedAt)}</td>
                  {canDownloadPdf && (
                    <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                      <DownloadPdfButton requestId={request.id} variant="compact" />
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Request Details Inspection Modal */}
      {selectedRequest && (
        <RequestDetailsModal
          request={selectedRequest}
          userRole={userRole}
          onClose={() => setSelectedRequest(null)}
        />
      )}

      {/* Download All ZIP Package Modal */}
      {downloadAllOpen && (
        <DownloadAllModal
          departments={departmentsList}
          onClose={() => setDownloadAllOpen(false)}
        />
      )}
    </div>
  );
}
