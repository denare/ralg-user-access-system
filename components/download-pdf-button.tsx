"use client";

import { Download } from "lucide-react";
import { useState } from "react";

function filenameFromDisposition(disposition: string | null) {
  const match = disposition?.match(/filename="?([^"]+)"?/);
  return match?.[1] ?? "USER_ACCESS_REQUEST_REPORT.pdf";
}

export function DownloadPdfButton({
  requestId,
  variant = "primary"
}: {
  requestId: string;
  variant?: "primary" | "secondary" | "compact";
}) {
  const [downloading, setDownloading] = useState(false);
  const className = variant === "primary"
    ? "button-primary"
    : variant === "compact"
      ? "button-secondary min-h-0 px-3 py-2 text-xs"
      : "button-secondary";

  async function downloadReport() {
    setDownloading(true);
    try {
      const response = await fetch(`/api/requests/${requestId}/report`, { credentials: "same-origin" });
      if (!response.ok) {
        const result = await response.json().catch(() => null) as { error?: string } | null;
        throw new Error(result?.error ?? "The report could not be generated.");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filenameFromDisposition(response.headers.get("content-disposition"));
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "The report could not be generated.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void downloadReport()}
      disabled={downloading}
      className={className}
    >
      <Download className="h-4 w-4" />
      {downloading ? "Generating..." : "Download PDF"}
    </button>
  );
}
