import fs from "node:fs";
import path from "node:path";
import PDFDocument from "pdfkit/js/pdfkit.standalone";
import type { RequestReportApproval, RequestReportData } from "@/lib/request-report-data";

const margins = { top: 48, bottom: 48, left: 48, right: 48 };
const pageWidth = 595.28;
const pageHeight = 841.89;
const contentWidth = pageWidth - margins.left - margins.right;
const headerHeight = 118;
const footerText = "This is a computer-generated report from the Chalinze District Council User Access Management System.";

function value(input: string | null | undefined) {
  return input?.trim() || "Not recorded";
}

function formatDate(input: string | Date | null | undefined) {
  if (!input) return "Not recorded";
  const date = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(date.getTime())) return "Not recorded";
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Africa/Dar_es_Salaam"
  }).format(date);
}

function imagePath(file: string) {
  return path.join(process.cwd(), "public", "branding", file);
}

function imageBuffer(file: string) {
  const source = imagePath(file);
  if (!fs.existsSync(source)) return null;
  return fs.readFileSync(source);
}

function drawHeader(doc: PDFKit.PDFDocument, report: RequestReportData) {
  const council = imageBuffer("HalmashauriYaChalinze.png");

  doc.save();
  doc.rect(0, 0, pageWidth, headerHeight).fill("#f8fafc");
  doc.rect(0, headerHeight - 3, pageWidth, 3).fill("#006b3f");
  doc.restore();

  if (council) doc.image(council, margins.left, 20, { width: 58, height: 58, fit: [58, 58] });
  if (council) doc.image(council, pageWidth - margins.right - 58, 20, { width: 58, height: 58, fit: [58, 58] });

  doc
    .fillColor("#0b2239")
    .font("Helvetica-Bold")
    .fontSize(10)
    .text("CHALINZE DISTRICT COUNCIL", margins.left + 70, 22, { width: contentWidth - 140, align: "center" })
    .fontSize(9)
    .text("PRESIDENT'S OFFICE - REGIONAL ADMINISTRATION AND LOCAL GOVERNMENT", { align: "center" })
    .text("HALMASHAURI YA WILAYA YA CHALINZE", { align: "center" })
    .moveDown(0.35)
    .fontSize(11)
    .text("USER ACCESS MANAGEMENT SYSTEM", { align: "center" })
    .fontSize(12)
    .text("USER ACCESS REQUEST REPORT", { align: "center" });

  doc
    .font("Helvetica")
    .fontSize(8)
    .fillColor("#334155")
    .text(`Request Number: ${report.request.requestNumber}`, margins.left, 88, { width: 180 })
    .text(`Request Status: ${report.request.status}`, margins.left + 185, 88, { width: 145 })
    .text(`Submission Date: ${formatDate(report.request.submittedAt)}`, margins.left + 335, 88, { width: 170 })
    .text(`Report Date: ${formatDate(report.generatedAt)}`, margins.left, 101, { width: contentWidth });
}

function drawFooter(doc: PDFKit.PDFDocument) {
  const previousY = doc.y;
  doc
    .font("Helvetica")
    .fontSize(8)
    .fillColor("#64748b")
    .text(footerText, margins.left, pageHeight - 34, { width: contentWidth, align: "center", lineBreak: false });
  doc.y = previousY;
}

function withPageChrome(doc: PDFKit.PDFDocument, report: RequestReportData) {
  drawHeader(doc, report);
  drawFooter(doc);
  doc.y = headerHeight + 24;

  doc.on("pageAdded", () => {
    drawHeader(doc, report);
    drawFooter(doc);
    doc.y = headerHeight + 24;
  });
}

function ensureSpace(doc: PDFKit.PDFDocument, needed = 80) {
  if (doc.y + needed > pageHeight - margins.bottom - 24) {
    doc.addPage();
  }
}

function sectionTitle(doc: PDFKit.PDFDocument, title: string) {
  ensureSpace(doc, 48);
  doc
    .moveDown(0.5)
    .font("Helvetica-Bold")
    .fontSize(10)
    .fillColor("#0b2239")
    .text(title.toUpperCase(), margins.left, doc.y, { width: contentWidth });
  doc
    .moveTo(margins.left, doc.y + 4)
    .lineTo(pageWidth - margins.right, doc.y + 4)
    .lineWidth(0.8)
    .strokeColor("#006b3f")
    .stroke();
  doc.moveDown(0.9);
}

function table(doc: PDFKit.PDFDocument, rows: Array<[string, string]>) {
  const labelWidth = 158;
  const valueWidth = contentWidth - labelWidth;

  for (const [label, rowValue] of rows) {
    const text = value(rowValue);
    const labelHeight = doc.heightOfString(label, { width: labelWidth - 16 });
    const valueHeight = doc.heightOfString(text, { width: valueWidth - 16 });
    const rowHeight = Math.max(28, labelHeight, valueHeight) + 14;
    ensureSpace(doc, rowHeight + 8);
    const y = doc.y;

    doc
      .rect(margins.left, y, labelWidth, rowHeight)
      .fillAndStroke("#f8fafc", "#cbd5e1")
      .rect(margins.left + labelWidth, y, valueWidth, rowHeight)
      .fillAndStroke("#ffffff", "#cbd5e1");

    doc
      .font("Helvetica-Bold")
      .fontSize(9)
      .fillColor("#334155")
      .text(label, margins.left + 8, y + 8, { width: labelWidth - 16 })
      .font("Helvetica")
      .fillColor("#0f172a")
      .text(text, margins.left + labelWidth + 8, y + 8, { width: valueWidth - 16 });

    doc.y = y + rowHeight;
  }
  doc.moveDown(0.6);
}

function statusColor(status: RequestReportApproval["status"]) {
  if (status === "APPROVED") return "#15803d";
  if (status === "REJECTED") return "#b91c1c";
  return "#334155";
}

function approvalSection(doc: PDFKit.PDFDocument, title: string, approval: RequestReportApproval, labels: { office: string; position: string }) {
  sectionTitle(doc, title);
  ensureSpace(doc, 34);
  doc
    .font("Helvetica-Bold")
    .fontSize(10)
    .fillColor(statusColor(approval.status))
    .text(`Approval Status: ${approval.status}`, margins.left, doc.y, { width: contentWidth });
  doc.moveDown(0.6);
  table(doc, [
    ["Name", approval.name],
    [labels.office, approval.department],
    [labels.position, approval.position],
    ["Date", formatDate(approval.date)],
    [approval.status === "REJECTED" ? "Rejection Reason" : "Comments", approval.comments]
  ]);
}

function systemsSection(doc: PDFKit.PDFDocument, report: RequestReportData) {
  sectionTitle(doc, "Section 3: Requested System Access");
  const systems = report.request.systems.length ? report.request.systems : ["No systems recorded"];
  for (const system of systems) {
    ensureSpace(doc, 20);
    doc
      .font("Helvetica")
      .fontSize(10)
      .fillColor("#0f172a")
      .text(`- ${system}`, margins.left + 8, doc.y, { width: contentWidth - 16 });
    doc.moveDown(0.2);
  }
  doc.moveDown(0.5);
  table(doc, [
    ["Requested Role(s)", report.request.requestedRole],
    ["Other System", report.request.otherSystem]
  ]);
}

function paragraphBox(doc: PDFKit.PDFDocument, text: string) {
  const clean = value(text);
  const height = doc.heightOfString(clean, { width: contentWidth - 20 }) + 20;
  ensureSpace(doc, height + 12);
  const y = doc.y;
  doc.rect(margins.left, y, contentWidth, height).fillAndStroke("#ffffff", "#cbd5e1");
  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor("#0f172a")
    .text(clean, margins.left + 10, y + 10, { width: contentWidth - 20, lineGap: 2 });
  doc.y = y + height + 8;
}

function timelineSection(doc: PDFKit.PDFDocument, report: RequestReportData) {
  sectionTitle(doc, "Section 7: Request Timeline");
  for (const [index, item] of report.request.timeline.entries()) {
    ensureSpace(doc, 52);
    doc
      .font("Helvetica-Bold")
      .fontSize(10)
      .fillColor("#0b2239")
      .text(item.label, margins.left + 20, doc.y, { width: contentWidth - 20 })
      .font("Helvetica")
      .fontSize(8)
      .fillColor("#475569")
      .text(formatDate(item.timestamp), margins.left + 20, doc.y, { width: contentWidth - 20 });
    if (item.details) {
      doc.moveDown(0.2).fontSize(8).text(item.details, margins.left + 20, doc.y, { width: contentWidth - 20 });
    }
    if (index < report.request.timeline.length - 1) {
      doc.moveDown(0.2).fillColor("#64748b").text("|", margins.left + 20, doc.y, { width: 20 });
    }
    doc.moveDown(0.4);
  }
}

export async function renderRequestReportPdf(report: RequestReportData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margins,
      bufferPages: false,
      info: {
        Title: `User Access Request Report - ${report.request.requestNumber}`,
        Author: "Chalinze District Council User Access Management System",
        Subject: "User Access Request Report"
      }
    });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    withPageChrome(doc, report);

    sectionTitle(doc, "Section 1: Request Information");
    table(doc, [
      ["Request Type", report.request.requestType],
      ["Operating Environment", report.request.environment],
      ["Current Status", report.request.status],
      ["Submitted Date", formatDate(report.request.submittedAt)]
    ]);

    sectionTitle(doc, "Section 2: Requester Details");
    table(doc, [
      ["Full Name", report.request.requester.fullName],
      ["Check Number", report.request.requester.checkNumber],
      ["NIN", report.request.requester.nin],
      ["Department", report.request.requester.department],
      ["Designation", report.request.requester.designation],
      ["Email", report.request.requester.email],
      ["Phone Number", report.request.requester.phone],
      ["Region", report.request.requester.region],
      ["LGA", report.request.requester.lga],
      ["Facility", report.request.requester.facility]
    ]);

    systemsSection(doc, report);

    sectionTitle(doc, "Section 4: Request Justification");
    paragraphBox(doc, report.request.reason);

    approvalSection(doc, "Section 5: Head of Department Approval", report.request.hodApproval, {
      office: "Department",
      position: "Position"
    });

    approvalSection(doc, "Section 6: ICT Officer Approval", report.request.ictApproval, {
      office: "Department",
      position: "Position"
    });

    timelineSection(doc, report);

    sectionTitle(doc, "Section 8: Audit Information");
    table(doc, [
      ["Generated By", report.generatedBy],
      ["Generated Date", formatDate(report.generatedAt)],
      ["Request ID", report.request.id]
    ]);

    doc.end();
  });
}
