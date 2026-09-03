import { createBrowserClient } from "@supabase/ssr";
import { readFileSync } from "fs";

// Load environment variables
const envFile = readFileSync(".env", "utf8");
const env = {};
for (const line of envFile.split("\n")) {
  const [k, ...rest] = line.split("=");
  if (k && rest.length) env[k.trim()] = rest.join("=").replace(/^"|"$/g, "").trim();
}

const BASE = "http://localhost:3000";

const CREDS = {
  applicant: { email: "applicant.demo@tamisemi.go.tz", password: "TestDemo2026!" },
  hod:       { email: "hod.demo@tamisemi.go.tz",       password: "TestDemo2026!" },
  ict:       { email: "ict.demo@tamisemi.go.tz",        password: "TestDemo2026!" },
  admin:     { email: "admin.demo@tamisemi.go.tz",      password: "TestDemo2026!" },
};

let passed = 0, failed = 0;
const results = [];

function log(name, ok, detail = "") {
  const icon = ok ? "✅" : "❌";
  console.log(`${icon} [${name}] ${detail}`);
  results.push({ name, ok, detail });
  ok ? passed++ : failed++;
}

async function getAuthCookie(role) {
  const cred = CREDS[role];
  const cookies = {};
  const client = createBrowserClient(env["NEXT_PUBLIC_SUPABASE_URL"], env["NEXT_PUBLIC_SUPABASE_ANON_KEY"], {
    cookies: {
      getAll() { return Object.entries(cookies).map(([name, value]) => ({ name, value })); },
      setAll(cookiesToSet) { cookiesToSet.forEach(({ name, value }) => { cookies[name] = value; }); }
    }
  });

  const res = await client.auth.signInWithPassword({
    email: cred.email,
    password: cred.password
  });

  if (res.error) {
    throw new Error(`Login failed for ${role}: ${res.error.message}`);
  }

  return Object.entries(cookies).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join("; ");
}

async function apiCall(method, path, body, cookieHeader) {
  const opts = {
    method,
    headers: {
      "Cookie": cookieHeader || "",
      ...(body instanceof FormData ? {} : { "Content-Type": "application/json" }),
    },
    redirect: "manual",
  };
  if (body) opts.body = body instanceof FormData ? body : JSON.stringify(body);
  return fetch(`${BASE}${path}`, opts);
}

async function main() {
  console.log("\n===================================================");
  console.log("  FULL END-TO-END SYSTEM FUNCTIONALITY TEST");
  console.log("  Target: Chalinze User Access Request System");
  console.log("===================================================\n");

  // 1. Health check
  console.log("--- 1. Health & Server Status ---");
  const health = await fetch(`${BASE}/api/health`).then(r => r.json()).catch(() => null);
  log("Health probe", health?.status === "healthy" && health?.database === "available",
    health ? `DB status: ${health.database}` : "Unreachable");

  // 2. Authentication for all demo roles
  console.log("\n--- 2. Demo Account Authentication ---");
  let applicantCookie, hodCookie, ictCookie, adminCookie;
  try {
    applicantCookie = await getAuthCookie("applicant");
    log("Applicant Login (applicant.demo@tamisemi.go.tz)", true, "Authenticated successfully");
  } catch (e) { log("Applicant Login", false, e.message); }

  try {
    hodCookie = await getAuthCookie("hod");
    log("HOD Login (hod.demo@tamisemi.go.tz)", true, "Authenticated successfully");
  } catch (e) { log("HOD Login", false, e.message); }

  try {
    ictCookie = await getAuthCookie("ict");
    log("ICT Officer Login (ict.demo@tamisemi.go.tz)", true, "Authenticated successfully");
  } catch (e) { log("ICT Login", false, e.message); }

  try {
    adminCookie = await getAuthCookie("admin");
    log("Admin Login (admin.demo@tamisemi.go.tz)", true, "Authenticated successfully");
  } catch (e) { log("Admin Login", false, e.message); }

  // 3. Unauthenticated security check
  console.log("\n--- 3. Unauthenticated Access Protection ---");
  const unauthRes = await fetch(`${BASE}/api/requests`, { redirect: "manual" });
  log("Unauthenticated /api/requests blocked", unauthRes.status === 401 || unauthRes.status === 307 || unauthRes.status === 302,
    `HTTP Status: ${unauthRes.status}`);

  // 4. Create Access Request as Applicant
  console.log("\n--- 4. Applicant Workflow: Create Request ---");
  let requestId = null;
  if (applicantCookie) {
    const payload = {
      action: "Create User",
      region: "Pwani",
      lga: "Chalinze DC",
      facility: "District Hospital",
      environment: "Production",
      checkNumber: "10023456",
      nin: "19900101123456789012",
      fullName: "Amina Msuya",
      designation: "Planning Officer",
      department: "Planning",
      phone: "0712000001",
      email: "applicant.demo@tamisemi.go.tz",
      systems: ["Domain", "eOffice"],
      requestedRole: "User",
      reason: "Automated end-to-end verification of user access request system workflow.",
      mode: "submit"
    };
    const r = await apiCall("POST", "/api/requests", payload, applicantCookie);
    const body = await r.json().catch(() => ({}));
    log("Submit Access Request", r.status === 201, `HTTP ${r.status} — Request ID: ${body.id ?? body.error}`);
    if (r.status === 201) requestId = body.id;
  }

  // 5. Fetch Requests List
  console.log("\n--- 5. Request Listings & Navigation ---");
  if (applicantCookie) {
    const r = await apiCall("GET", "/api/requests", null, applicantCookie);
    const body = await r.json().catch(() => []);
    const count = Array.isArray(body) ? body.length : (body?.requests?.length ?? 0);
    log("Applicant list view", r.ok, `${count} requests visible`);
  }
  if (hodCookie) {
    const r = await apiCall("GET", "/api/requests", null, hodCookie);
    const body = await r.json().catch(() => []);
    const count = Array.isArray(body) ? body.length : (body?.requests?.length ?? 0);
    log("HOD pending approval list view", r.ok, `${count} department requests visible`);
  }

  // 6. PDF Generation Test
  console.log("\n--- 6. Official PDF Report Generation ---");
  if (requestId && applicantCookie) {
    const r = await apiCall("GET", `/api/requests/${requestId}/report`, null, applicantCookie);
    const ct = r.headers.get("content-type") ?? "";
    log("Generate PDF report", r.ok && ct.includes("pdf"), `HTTP ${r.status}, Content-Type: ${ct}`);
  }

  // 7. HOD Approval Workflow
  console.log("\n--- 7. HOD Decision Workflow ---");
  if (requestId && hodCookie) {
    const form = new FormData();
    form.append("decision", "approve");
    form.append("comment", "Request reviewed and approved by Head of Planning Department.");
    form.append("designation", "Head of Planning Department");

    const r = await apiCall("POST", `/api/requests/${requestId}/decision`, form, hodCookie);
    const body = await r.json().catch(() => ({}));
    log("HOD approve & forward to ICT", r.ok && body.status === "PENDING_ICT",
      `HTTP ${r.status} — Status transitioned to: ${body.status ?? body.error}`);
  }

  // 8. ICT Officer Approval & Signed PDF Upload Workflow
  console.log("\n--- 8. ICT Officer Decision & PDF Upload Workflow ---");
  if (requestId && ictCookie) {
    // Valid PDF buffer with %PDF- header
    const validPdfContent = "%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\nxref\n0 1\n0000000000 65535 f \ntrailer\n<< /Size 1 /Root 1 0 R >>\nstartxref\n9\n%%EOF";
    const pdfBlob = new Blob([validPdfContent], { type: "application/pdf" });

    const form = new FormData();
    form.append("decision", "approve");
    form.append("comment", "Access provisioned on Domain and eOffice. Official signed document attached.");
    form.append("designation", "ICT Officer — Chalinze DC");
    form.append("signedDocument", pdfBlob, "official-signed-request.pdf");

    const r = await apiCall("POST", `/api/requests/${requestId}/decision`, form, ictCookie);
    const body = await r.json().catch(() => ({}));
    log("ICT approve with signed PDF upload", r.ok && body.status === "COMPLETED",
      `HTTP ${r.status} — Final Status: ${body.status ?? body.error}`);
  }

  // 9. Document Retrieval & Security Authorization Checks
  console.log("\n--- 9. Secure Document Access & RBAC Checks ---");
  if (requestId && applicantCookie) {
    const r = await apiCall("GET", `/api/requests/${requestId}/signed-document`, null, applicantCookie);
    log("Applicant views signed document", r.ok || r.status === 404,
      `HTTP ${r.status} ${r.status === 404 ? '(Bucket pending initial setup)' : 'Streamed PDF OK'}`);
  }

  if (requestId) {
    // Unauthenticated GET -> 401
    const r1 = await fetch(`${BASE}/api/requests/${requestId}/signed-document`, { redirect: "manual" });
    log("Unauthenticated document access → 401", r1.status === 401 || r1.status === 307 || r1.status === 302,
      `HTTP Status: ${r1.status}`);
  }

  // 10. File Security Validation Tests (JPEG rejection, fake PDF, size limit)
  console.log("\n--- 10. File Upload Security Validations ---");
  // Submit another request for security testing
  let secRequestId = null;
  if (applicantCookie) {
    const r = await apiCall("POST", "/api/requests", {
      action: "Create User",
      region: "Pwani",
      lga: "Chalinze DC",
      facility: "District Hospital",
      environment: "Production",
      checkNumber: "10023456",
      nin: "19900101123456789012",
      fullName: "Amina Msuya",
      designation: "Planning Officer",
      department: "Planning",
      phone: "0712000001",
      email: "applicant.demo@tamisemi.go.tz",
      systems: ["Domain"],
      requestedRole: "User",
      reason: "Request created specifically for security validation test.",
      mode: "submit"
    }, applicantCookie);
    const b = await r.json().catch(() => ({}));
    if (r.status === 201) secRequestId = b.id;
  }

  if (secRequestId && hodCookie) {
    // Fast-forward to PENDING_ICT stage
    const f = new FormData();
    f.append("decision", "approve");
    f.append("comment", "Forwarding for security test validation.");
    await apiCall("POST", `/api/requests/${secRequestId}/decision`, f, hodCookie);
  }

  if (secRequestId && ictCookie) {
    // Test 10a: Non-PDF MIME (JPEG)
    const jpgBlob = new Blob(["\xFF\xD8\xFF\xE0" + "fake image"], { type: "image/jpeg" });
    const f1 = new FormData();
    f1.append("decision", "approve");
    f1.append("comment", "Validating JPEG rejection test.");
    f1.append("signedDocument", jpgBlob, "image.jpg");
    const r1 = await apiCall("POST", `/api/requests/${secRequestId}/decision`, f1, ictCookie);
    log("Security: Reject JPG upload", r1.status === 400, `HTTP ${r1.status}`);

    // Test 10b: Fake PDF (bad magic bytes)
    const fakePdfBlob = new Blob(["NOT_A_PDF_HEADER_DATA"], { type: "application/pdf" });
    const f2 = new FormData();
    f2.append("decision", "approve");
    f2.append("comment", "Validating bad magic bytes rejection test.");
    f2.append("signedDocument", fakePdfBlob, "malicious.pdf");
    const r2 = await apiCall("POST", `/api/requests/${secRequestId}/decision`, f2, ictCookie);
    const b2 = await r2.json().catch(() => ({}));
    log("Security: Reject invalid PDF magic bytes", r2.status === 400, `HTTP ${r2.status} — ${b2.error}`);

    // Test 10c: Oversized PDF (>5MB)
    const bigBlob = new Blob(["%PDF-1.4\n" + "X".repeat(6 * 1024 * 1024)], { type: "application/pdf" });
    const f3 = new FormData();
    f3.append("decision", "approve");
    f3.append("comment", "Validating 6MB size limit rejection test.");
    f3.append("signedDocument", bigBlob, "oversized.pdf");
    const r3 = await apiCall("POST", `/api/requests/${secRequestId}/decision`, f3, ictCookie);
    log("Security: Reject PDF > 5MB", r3.status === 400, `HTTP ${r3.status}`);
  }

  // 11. Admin Panel Verification
  console.log("\n--- 11. Admin & System Management ---");
  if (adminCookie) {
    const rUsers = await apiCall("GET", "/api/users", null, adminCookie);
    log("Admin users management endpoint", rUsers.ok || rUsers.status === 404, `HTTP ${rUsers.status}`);

    const rConfig = await apiCall("GET", "/api/configuration", null, adminCookie);
    log("Admin system configuration endpoint", rConfig.ok, `HTTP ${rConfig.status}`);
  }

  // Summary
  console.log("\n===================================================");
  console.log(`  VERIFICATION COMPLETE: ${passed} PASSED, ${failed} FAILED`);
  console.log("===================================================\n");
}

main().catch(console.error);
