"use client";

import { useEffect, useState } from "react";
import { Download, Filter, X, Loader2, FileArchive } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/components/language-provider";

type DownloadAllModalProps = {
  departments: string[];
  onClose: () => void;
};

export function DownloadAllModal({ departments, onClose }: DownloadAllModalProps) {
  const { t } = useLanguage();
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [department, setDepartment] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [action, setAction] = useState("ALL");
  const [matchingCount, setMatchingCount] = useState<number | null>(null);
  const [loadingCount, setLoadingCount] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");

  async function checkMatchingCount() {
    setLoadingCount(true);
    setError("");
    try {
      const res = await fetch("/api/requests");
      if (res.ok) {
        const json = await res.json();
        const all = json.data || [];
        const filtered = all.filter((r: any) => {
          if (department !== "ALL" && r.department?.toLowerCase() !== department.toLowerCase()) return false;
          if (status !== "ALL" && r.status !== status) return false;
          if (action !== "ALL" && r.action !== action) return false;
          if (dateFrom && new Date(r.createdAt) < new Date(dateFrom)) return false;
          if (dateTo) {
            const dt = new Date(dateTo);
            dt.setHours(23, 59, 59, 999);
            if (new Date(r.createdAt) > dt) return false;
          }
          return true;
        });
        setMatchingCount(filtered.length);
      }
    } catch {
      setMatchingCount(null);
    } finally {
      setLoadingCount(false);
    }
  }

  useEffect(() => {
    checkMatchingCount();
  }, [dateFrom, dateTo, department, status, action]);

  async function handleDownloadAll() {
    setDownloading(true);
    setError("");

    try {
      const response = await fetch("/api/requests/download-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dateFrom, dateTo, department, status, action })
      });

      if (!response.ok) {
        const json = await response.json().catch(() => ({}));
        setError(json.error || "Failed to generate ZIP report package.");
        setDownloading(false);
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const today = new Date().toISOString().split("T")[0];
      a.download = `RALG_Requests_${today}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      onClose();
    } catch {
      setError("Network error downloading ZIP package.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={onClose} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative z-10 w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-200"
      >
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-100 text-emerald-800">
              <FileArchive className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Download All Requests (ZIP)</h2>
              <p className="text-xs text-slate-500">Filter and export matching PDFs into a single ZIP file</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Date From</label>
              <input
                type="date"
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-900 focus:ring-2 focus:ring-emerald-500"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Date To</label>
              <input
                type="date"
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-900 focus:ring-2 focus:ring-emerald-500"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Department Filter</label>
            <select
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-900 focus:ring-2 focus:ring-emerald-500"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            >
              <option value="ALL">All Departments</option>
              {departments.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Status Filter</label>
              <select
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-900 focus:ring-2 focus:ring-emerald-500"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING_HOD">Pending HOD Review</option>
                <option value="PENDING_ICT">Pending ICT Processing</option>
                <option value="COMPLETED">Completed</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Request Action</label>
              <select
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-900 focus:ring-2 focus:ring-emerald-500"
                value={action}
                onChange={(e) => setAction(e.target.value)}
              >
                <option value="ALL">All Actions</option>
                <option value="CREATE_USER">Create User</option>
                <option value="MODIFY_USER">Modify User</option>
                <option value="BLOCK_USER">Block User</option>
                <option value="RESET_PASSWORD">Reset Password</option>
              </select>
            </div>
          </div>

          {/* Matching Count Indicator */}
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 flex items-center justify-between">
            <span className="font-semibold text-emerald-900">Matching Records:</span>
            {loadingCount ? (
              <Loader2 className="h-4 w-4 animate-spin text-emerald-700" />
            ) : (
              <span className="font-bold text-emerald-800 text-sm">{matchingCount ?? 0} {t("requestsFound")}</span>
            )}
          </div>

          {error && <p className="text-red-600 font-semibold bg-red-50 p-2.5 rounded-lg border border-red-200">{error}</p>}
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-4">
          <button
            onClick={() => {
              setDateFrom(""); setDateTo(""); setDepartment("ALL"); setStatus("ALL"); setAction("ALL");
            }}
            className="text-xs font-semibold text-slate-600 hover:underline"
          >
            {t("clearFilters")}
          </button>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700">
              {t("cancel")}
            </button>
            <button
              onClick={handleDownloadAll}
              disabled={downloading || matchingCount === 0}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-800 disabled:opacity-50"
            >
              {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              {downloading ? t("processing") : t("downloadAll")}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
