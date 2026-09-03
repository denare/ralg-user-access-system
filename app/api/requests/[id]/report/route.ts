import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth";
import { getRequestReportData } from "@/lib/request-report-data";
import { renderRequestReportPdf } from "@/lib/request-report-pdf";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Active concurrency semaphore guard
let activePdfGenerations = 0;
const MAX_CONCURRENT_PDF_GENERATIONS = 5;

function safeFilename(value: string) {
  return value.replace(/[^a-zA-Z0-9_-]/g, "_");
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  // Check concurrency limit
  if (activePdfGenerations >= MAX_CONCURRENT_PDF_GENERATIONS) {
    return NextResponse.json(
      { error: "Server is currently experiencing high PDF report generation volume. Please try again in a few seconds." },
      { status: 429, headers: { "Retry-After": "5" } }
    );
  }

  try {
    const limited = rateLimit(_request, { key: "requests:pdf", limit: 30, windowMs: 5 * 60 * 1000 });
    if (limited) return limited;

    const profile = await getCurrentProfile();
    if (!profile || !profile.isActive) {
      return NextResponse.json({ error: "Your session has expired. Sign in again before downloading the report." }, { status: 401 });
    }

    const { id } = await params;
    const report = await getRequestReportData(profile, id);
    if (!report) {
      return NextResponse.json({ error: "Request not found or you do not have authorization to view this report." }, { status: 404 });
    }

    activePdfGenerations++;
    let pdf: Buffer;
    try {
      pdf = await renderRequestReportPdf(report);
    } finally {
      activePdfGenerations = Math.max(0, activePdfGenerations - 1);
    }

    const filename = `USER_ACCESS_REQUEST_${safeFilename(report.request.requestNumber)}.pdf`;
    const body = new Uint8Array(pdf);

    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": String(pdf.length),
        "Cache-Control": "private, no-store, max-age=0, must-revalidate"
      }
    });
  } catch (error) {
    activePdfGenerations = Math.max(0, activePdfGenerations - 1);
    console.error("Request PDF generation error:", error);
    return NextResponse.json({ error: "The PDF report could not be generated. Please try again or contact the help desk." }, { status: 500 });
  }
}
