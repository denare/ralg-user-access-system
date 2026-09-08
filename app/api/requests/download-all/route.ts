import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getRequestReportData } from "@/lib/request-report-data";
import { renderRequestReportPdf } from "@/lib/request-report-pdf";
import JSZip from "jszip";

export async function POST(request: Request) {
  const profile = await getCurrentProfile();
  if (!profile || !profile.isActive) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (profile.role !== "ICT_OFFICER" && profile.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Access Denied. Only ICT Officers and System Administrators can export bulk PDF reports." },
      { status: 403 }
    );
  }

  let body: {
    dateFrom?: string;
    dateTo?: string;
    department?: string;
    status?: string;
    action?: string;
  } = {};

  try {
    body = await request.json();
  } catch {
    // optional body
  }

  const where: any = {};

  if (body.department && body.department !== "ALL") {
    where.department = { equals: body.department, mode: "insensitive" };
  }

  if (body.status && body.status !== "ALL") {
    where.status = body.status;
  }

  if (body.action && body.action !== "ALL") {
    where.action = body.action;
  }

  if (body.dateFrom || body.dateTo) {
    where.createdAt = {};
    if (body.dateFrom) {
      where.createdAt.gte = new Date(body.dateFrom);
    }
    if (body.dateTo) {
      const d = new Date(body.dateTo);
      d.setHours(23, 59, 59, 999);
      where.createdAt.lte = d;
    }
  }

  const requests = await prisma.accessRequest.findMany({
    where,
    select: { id: true, requestNumber: true },
    orderBy: { createdAt: "desc" },
    take: 10 // cap at 10 per zip download for optimal response speed
  });

  if (requests.length === 0) {
    return NextResponse.json({ error: "No requests found matching the specified filters." }, { status: 404 });
  }

  const zip = new JSZip();

  const pdfResults = await Promise.all(
    requests.map(async (item) => {
      try {
        const report = await getRequestReportData(profile, item.id);
        if (report) {
          const pdfBuffer = await renderRequestReportPdf(report);
          const filename = `${item.requestNumber.replace(/[^a-zA-Z0-9_-]/g, "_")}.pdf`;
          return { filename, pdfBuffer };
        }
      } catch (err) {
        console.error(`Failed to render PDF for request ${item.id}:`, err);
      }
      return null;
    })
  );

  for (const res of pdfResults) {
    if (res) {
      zip.file(res.filename, res.pdfBuffer);
    }
  }

  const zipBuffer = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
  const today = new Date().toISOString().split("T")[0];
  const zipFilename = `RALG_Requests_${today}.zip`;

  return new NextResponse(new Uint8Array(zipBuffer), {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${zipFilename}"`,
      "Content-Length": String(zipBuffer.length),
      "Cache-Control": "private, no-store, max-age=0, must-revalidate"
    }
  });
}
