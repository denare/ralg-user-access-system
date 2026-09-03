import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
// Use standalone PDFKit build to avoid Next.js Webpack ENOENT errors on Helvetica.afm
// eslint-disable-next-line @typescript-eslint/no-require-imports
const PDFDocument = require("pdfkit/js/pdfkit.standalone");
import type { RequestReportApproval, RequestReportData } from "@/lib/request-report-data";

// ─── Page constants ─────────────────────────────────────────────────────────
const margins = { top: 36, bottom: 40, left: 40, right: 40 };
const pageWidth = 595.28;
const pageHeight = 841.89;
const contentWidth = pageWidth - margins.left - margins.right;
// Header: logo 58px tall, 2 lines title, meta row → ~112px total
const HEADER_H = 108;
// Row heights
const ROW_LABEL_W = 150;
const ROW_H_MIN = 22;

// ─── Utilities ───────────────────────────────────────────────────────────────
function val(s: string | null | undefined) {
  return s?.trim() || "—";
}

function formatDate(input: string | Date | null | undefined): string {
  if (!input) return "—";
  const d = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Africa/Dar_es_Salaam"
  }).format(d);
}

function imgDataUrl(file: string): string | null {
  const src = path.join(process.cwd(), "public", "branding", file);
  if (!fs.existsSync(src)) return null;
  const ext = path.extname(file).slice(1).toLowerCase();
  const mime = ext === "jpg" ? "image/jpeg" : `image/${ext}`;
  return `data:${mime};base64,${fs.readFileSync(src).toString("base64")}`;
}

// ─── Header ─────────────────────────────────────────────────────────────────
function drawHeader(doc: PDFKit.PDFDocument, report: RequestReportData) {
  const coatOfArms = imgDataUrl("CoatOfArm.png");
  const chalinzeLogo = imgDataUrl("HalmashauriYaChalinze.png");

  // Background shading
  doc.save();
  doc.rect(0, 0, pageWidth, HEADER_H).fill("#f7f9fc");
  doc.restore();

  // Left logo: Tanzania Coat of Arms
  const logoSz = 62;
  const logoY = (HEADER_H - logoSz) / 2;
  if (coatOfArms) {
    doc.image(coatOfArms, margins.left, logoY, { width: logoSz, height: logoSz, fit: [logoSz, logoSz] });
  }
  // Right logo: Chalinze Halmashauri
  if (chalinzeLogo) {
    doc.image(chalinzeLogo, pageWidth - margins.right - logoSz, logoY, { width: logoSz, height: logoSz, fit: [logoSz, logoSz] });
  }

  // Centered text block
  const textX = margins.left + logoSz + 8;
  const textW = contentWidth - (logoSz + 8) * 2;
  let ty = 10;

  doc.font("Helvetica-Bold").fontSize(9.5).fillColor("#0b2239")
    .text("CHALINZE DISTRICT COUNCIL", textX, ty, { width: textW, align: "center" });
  ty += 13;
  doc.font("Helvetica").fontSize(7.5).fillColor("#1a3a5c")
    .text("PRESIDENT'S OFFICE - REGIONAL ADMINISTRATION AND LOCAL GOVERNMENT", textX, ty, { width: textW, align: "center" });
  ty += 11;
  doc.font("Helvetica-Bold").fontSize(8).fillColor("#0b2239")
    .text("HALMASHAURI YA WILAYA YA CHALINZE", textX, ty, { width: textW, align: "center" });
  ty += 14;
  doc.font("Helvetica-Bold").fontSize(9).fillColor("#0b2239")
    .text("USER ACCESS MANAGEMENT SYSTEM", textX, ty, { width: textW, align: "center" });
  ty += 12;
  doc.font("Helvetica-Bold").fontSize(9).fillColor("#0b2239")
    .text("USER ACCESS REQUEST REPORT", textX, ty, { width: textW, align: "center" });
  ty += 14;

  // Green divider under org titles
  doc.moveTo(margins.left, ty).lineTo(pageWidth - margins.right, ty)
    .lineWidth(1.2).strokeColor("#006b3f").stroke();
  ty += 5;

  // Meta row
  doc.font("Helvetica").fontSize(7.2).fillColor("#334155");
  const metaLine1 = `Request Number: ${report.request.requestNumber}   |   Request Status: ${report.request.status}   |   Submission Date: ${formatDate(report.request.submittedAt)}`;
  doc.text(metaLine1, margins.left, ty, { width: contentWidth });
  ty += 10;
  doc.text(`Report Date: ${formatDate(report.generatedAt)}`, margins.left, ty, { width: contentWidth });

  // Bottom border
  doc.moveTo(0, HEADER_H - 1).lineTo(pageWidth, HEADER_H - 1)
    .lineWidth(2).strokeColor("#006b3f").stroke();
}

// ─── Footer ─────────────────────────────────────────────────────────────────
function drawFooter(doc: PDFKit.PDFDocument, pageNum: number, total: number) {
  const y = pageHeight - 28;
  doc.font("Helvetica").fontSize(6.5).fillColor("#94a3b8")
    .text(
      `Page ${pageNum} of ${total}  |  Official computer-generated report — Chalinze District Council TEHAMA Department`,
      margins.left, y, { width: contentWidth, align: "center" }
    );
  doc.moveTo(margins.left, y - 4).lineTo(pageWidth - margins.right, y - 4)
    .lineWidth(0.5).strokeColor("#e2e8f0").stroke();
}

// ─── Space guard: start new page if not enough room ─────────────────────────
function needSpace(doc: PDFKit.PDFDocument, needed: number) {
  if (doc.y + needed > pageHeight - margins.bottom - 6) {
    doc.addPage();
    doc.y = HEADER_H + 12;
  }
}

// ─── Section heading ─────────────────────────────────────────────────────────
function sectionHead(doc: PDFKit.PDFDocument, title: string) {
  needSpace(doc, 32);
  const y = doc.y + 6;
  doc.rect(margins.left, y, contentWidth, 16).fill("#0b2239");
  doc.font("Helvetica-Bold").fontSize(8).fillColor("#ffffff")
    .text(title.toUpperCase(), margins.left + 6, y + 4, { width: contentWidth - 12 });
  doc.y = y + 16 + 4;
}

// ─── Two-column table row ────────────────────────────────────────────────────
function tableRow(doc: PDFKit.PDFDocument, label: string, value: string, shade = false) {
  const valueW = contentWidth - ROW_LABEL_W;
  const labelH = doc.heightOfString(label, { width: ROW_LABEL_W - 8 });
  const valueH = doc.heightOfString(value, { width: valueW - 8 });
  const rowH = Math.max(ROW_H_MIN, labelH, valueH) + 8;

  needSpace(doc, rowH + 1);
  const y = doc.y;
  const bg = shade ? "#f8fafc" : "#ffffff";

  doc.rect(margins.left, y, ROW_LABEL_W, rowH).fillAndStroke(bg, "#cbd5e1");
  doc.rect(margins.left + ROW_LABEL_W, y, valueW, rowH).fillAndStroke("#ffffff", "#cbd5e1");

  doc.font("Helvetica-Bold").fontSize(7.5).fillColor("#334155")
    .text(label, margins.left + 5, y + 5, { width: ROW_LABEL_W - 10 });
  doc.font("Helvetica").fontSize(7.5).fillColor("#0f172a")
    .text(value, margins.left + ROW_LABEL_W + 5, y + 5, { width: valueW - 10 });

  doc.y = y + rowH;
}

// ─── Approval section ────────────────────────────────────────────────────────
function approvalSection(
  doc: PDFKit.PDFDocument,
  title: string,
  approval: RequestReportApproval
) {
  sectionHead(doc, title);

  const statusColor =
    approval.status === "APPROVED" ? "#15803d" :
    approval.status === "REJECTED" ? "#b91c1c" : "#64748b";

  needSpace(doc, 14);
  doc.font("Helvetica-Bold").fontSize(8).fillColor(statusColor)
    .text(`Decision Status: ${approval.status}`, margins.left + 4, doc.y + 4, { width: contentWidth });
  doc.y += 14;

  const rows: [string, string][] = [
    ["Full Name", approval.name],
    ["Designation", val(approval.designation)],
    ["Department", approval.department],
    ["Date", formatDate(approval.date)],
    [approval.status === "REJECTED" ? "Rejection Reason" : "Comments", approval.comments],
  ];
  rows.forEach(([l, v], i) => tableRow(doc, l, v, i % 2 === 0));

  // Signature box
  needSpace(doc, 52);
  const sigY = doc.y + 4;
  doc.rect(margins.left, sigY, contentWidth / 2, 44).stroke("#cbd5e1");
  doc.font("Helvetica").fontSize(7).fillColor("#94a3b8")
    .text("Signature / Muhuri:", margins.left + 6, sigY + 4);
  if (approval.status === "APPROVED" && approval.signatureUrl) {
    // If a signature image was uploaded, embed it
    doc.image(approval.signatureUrl, margins.left + 6, sigY + 14, { height: 26, fit: [120, 26] });
  } else {
    doc.fontSize(6.5).fillColor("#cbd5e1")
      .text("(To be signed and stamped)", margins.left + 6, sigY + 24, { width: contentWidth / 2 - 12 });
  }
  doc.y = sigY + 44 + 6;
}

// ─── Systems section ─────────────────────────────────────────────────────────
function systemsSection(doc: PDFKit.PDFDocument, report: RequestReportData) {
  sectionHead(doc, "Section 3: Requested System Access");
  const sysList = report.request.systems.length ? report.request.systems.join(", ") : "No systems recorded";
  tableRow(doc, "Systems", sysList, false);
  tableRow(doc, "Requested Role", val(report.request.requestedRole), true);
  tableRow(doc, "Other System", val(report.request.otherSystem), false);
}

// ─── Paragraph box ───────────────────────────────────────────────────────────
function paragraphBox(doc: PDFKit.PDFDocument, text: string) {
  const t = val(text);
  const h = doc.heightOfString(t, { width: contentWidth - 16 }) + 16;
  needSpace(doc, h + 4);
  const y = doc.y;
  doc.rect(margins.left, y, contentWidth, h).fillAndStroke("#fafafa", "#cbd5e1");
  doc.font("Helvetica").fontSize(7.5).fillColor("#0f172a")
    .text(t, margins.left + 8, y + 8, { width: contentWidth - 16, lineGap: 1.5 });
  doc.y = y + h + 4;
}

// ─── Timeline ────────────────────────────────────────────────────────────────
function timelineSection(doc: PDFKit.PDFDocument, report: RequestReportData) {
  sectionHead(doc, "Section 7: Request Processing Timeline");
  for (const [i, item] of report.request.timeline.entries()) {
    needSpace(doc, 26);
    const y = doc.y + 2;
    // dot
    doc.circle(margins.left + 6, y + 5, 3).fill("#006b3f");
    // connector line
    if (i < report.request.timeline.length - 1) {
      doc.moveTo(margins.left + 6, y + 8).lineTo(margins.left + 6, y + 24)
        .lineWidth(0.8).strokeColor("#cbd5e1").stroke();
    }
    doc.font("Helvetica-Bold").fontSize(7.5).fillColor("#0b2239")
      .text(item.label, margins.left + 16, y + 2, { width: contentWidth - 20 });
    doc.font("Helvetica").fontSize(7).fillColor("#64748b")
      .text(formatDate(item.timestamp), margins.left + 16, doc.y, { width: contentWidth - 20 });
    if (item.details) {
      doc.font("Helvetica").fontSize(7).fillColor("#475569")
        .text(item.details, margins.left + 16, doc.y, { width: contentWidth - 20 });
    }
    doc.y += 4;
  }
}

// ─── Signature block at page bottom ──────────────────────────────────────────
function finalSignatureBlock(doc: PDFKit.PDFDocument, verificationHash: string) {
  needSpace(doc, 64);
  const y = doc.y + 6;
  // Green stamp circle outline
  doc.circle(margins.left + 40, y + 30, 28).lineWidth(1.2).strokeColor("#006b3f").stroke();
  doc.circle(margins.left + 40, y + 30, 24).lineWidth(0.5).strokeColor("#006b3f").stroke();
  doc.font("Helvetica-Bold").fontSize(5).fillColor("#006b3f")
    .text("HALMASHAURI YA WILAYA", margins.left + 15, y + 14, { width: 52, align: "center" })
    .text("YA CHALINZE", margins.left + 15, y + 22, { width: 52, align: "center" })
    .text("★ TEHAMA ★", margins.left + 15, y + 30, { width: 52, align: "center" })
    .text("VERIFIED", margins.left + 15, y + 38, { width: 52, align: "center" });

  // Verification text
  const vx = margins.left + 80;
  doc.font("Helvetica-Bold").fontSize(7.5).fillColor("#0b2239")
    .text("Document Verification Code:", vx, y + 8);
  doc.font("Helvetica").fontSize(7).fillColor("#334155")
    .text(verificationHash, vx, y + 20, { width: contentWidth - 90 });
  doc.font("Helvetica").fontSize(6.5).fillColor("#64748b")
    .text(
      "This document is authentic when it bears the official Chalinze District Council TEHAMA stamp and the verification code above.",
      vx, y + 32, { width: contentWidth - 90, lineGap: 1.5 }
    );
  doc.y = y + 64;
}

// ─── Apply chrome (header + footer) to all buffered pages ───────────────────
function applyPageChrome(doc: PDFKit.PDFDocument, report: RequestReportData) {
  const range = doc.bufferedPageRange();
  const total = range.count;
  for (let i = 0; i < total; i++) {
    doc.switchToPage(range.start + i);
    drawHeader(doc, report);
    drawFooter(doc, i + 1, total);
  }
}

// ─── Main export ─────────────────────────────────────────────────────────────
export async function renderRequestReportPdf(report: RequestReportData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margins,
      bufferPages: true,
      info: {
        Title: `User Access Request Report — ${report.request.requestNumber}`,
        Author: "Chalinze District Council TEHAMA",
        Subject: "User Access Request Report"
      }
    });

    const chunks: Buffer[] = [];
    doc.on("data", (c: Buffer) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // Start content below the header zone
    doc.y = HEADER_H + 10;

    // Section 1: Request Information
    sectionHead(doc, "Section 1: Request Information");
    ([
      ["Request Type", report.request.requestType],
      ["Operating Environment", report.request.environment],
      ["Current Status", report.request.status],
      ["Submitted Date", formatDate(report.request.submittedAt)],
    ] as [string, string][]).forEach(([l, v], i) => tableRow(doc, l, v, i % 2 === 0));

    // Section 2: Requester Details
    sectionHead(doc, "Section 2: Requester Details");
    ([
      ["Full Name", report.request.requester.fullName],
      ["Check Number", report.request.requester.checkNumber],
      ["NIN", report.request.requester.nin],
      ["Department", report.request.requester.department],
      ["Designation", report.request.requester.designation],
      ["Email", report.request.requester.email],
      ["Phone Number", report.request.requester.phone],
      ["Region", report.request.requester.region],
      ["LGA", report.request.requester.lga],
      ["Facility", report.request.requester.facility],
    ] as [string, string][]).forEach(([l, v], i) => tableRow(doc, l, v, i % 2 === 0));

    // Section 3: Systems
    systemsSection(doc, report);

    // Section 4: Justification
    sectionHead(doc, "Section 4: Request Justification");
    paragraphBox(doc, report.request.reason);

    // Section 5: HOD Approval
    approvalSection(doc, "Section 5: Head of Department Approval", report.request.hodApproval);

    // Section 6: ICT Officer Approval
    approvalSection(doc, "Section 6: ICT Officer Approval", report.request.ictApproval);

    // Section 7: Timeline
    timelineSection(doc, report);

    // Section 8: Audit
    const verificationHash =
      "CDC-VERIFIED-" +
      crypto
        .createHash("sha256")
        .update(`${report.request.id}:${report.request.requestNumber}`)
        .digest("hex")
        .slice(0, 16)
        .toUpperCase();

    sectionHead(doc, "Section 8: Audit & Verification Information");
    ([
      ["Generated By", report.generatedBy],
      ["Generated Date", formatDate(report.generatedAt)],
      ["Request ID", report.request.id],
      ["Verification Code", verificationHash],
    ] as [string, string][]).forEach(([l, v], i) => tableRow(doc, l, v, i % 2 === 0));

    finalSignatureBlock(doc, verificationHash);

    // Apply header + footer to every page last (bufferedPages pattern)
    applyPageChrome(doc, report);

    doc.end();
  });
}
