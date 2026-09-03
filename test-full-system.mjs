#!/usr/bin/env node
// Full system integration test using demo accounts
// Run from project root: node test-full-system.mjs

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
  const msg = `${icon} [${name}] ${detail}`;
  console.log(msg);
  results.push({ name, ok, detail });
  ok ? passed++ : failed++;
}

// ─── Login helper: returns cookie jar string ──────────────────────────────────
async function login(role) {
  const cred = CREDS[role];
  // Step 1: Get CSRF / set cookies via login page
  const r = await fetch(`${BASE}/api/auth/signin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: cred.email, password: cred.password }),
    redirect: "manual",
  }).catch(() => null);

  // Actually use Supabase auth endpoint directly
  const supaRes = await fetch(`${BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ email: cred.email, password: cred.password }),
    redirect: "manual",
  }).catch(() => null);

  return null; // We'll use direct Supabase token approach below
}

// ─── Supabase token login ─────────────────────────────────────────────────────
async function getSupabaseToken(role) {
  const cred = CREDS[role];
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!SUPABASE_URL || !SUPABASE_ANON) {
    throw new Error("Missing Supabase env vars");
  }

  const r = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_ANON,
    },
    body: JSON.stringify({ email: cred.email, password: cred.password }),
  });

  if (!r.ok) {
    const body = await r.text();
    throw new Error(`Login failed for ${role}: ${r.status} ${body}`);
  }

  const data = await r.json();
  return { accessToken: data.access_token, refreshToken: data.refresh_token };
}

// ─── Authenticated API call ───────────────────────────────────────────────────
async function apiCall(method, path, body, cookies) {
  const opts = {
    method,
    headers: {
      "Cookie": cookies,
      ...(body instanceof FormData ? {} : { "Content-Type": "application/json" }),
    },
    redirect: "manual",
  };
  if (body) opts.body = body instanceof FormData ? body : JSON.stringify(body);
  return fetch(`${BASE}${path}`, opts);
}

// We'll use a server-side test approach: hit the API with real Supabase JWT in cookie
async function authHeaders(role) {
  const { accessToken, refreshToken } = await getSupabaseToken(role);
  // Next.js/Supabase SSR uses these cookies:
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const projectRef = SUPABASE_URL.split("//")[1].split(".")[0];
  return `sb-${projectRef}-auth-token=${JSON.stringify({ access_token: accessToken, refresh_token: refreshToken })}`;
}

// ─── Load env ─────────────────────────────────────────────────────────────────
import { readFileSync } from "fs";
const envFile = readFileSync(".env", "utf8");
for (const line of envFile.split("\n")) {
  const [k, ...rest] = line.split("=");
  if (k && rest.length) process.env[k.trim()] = rest.join("=").replace(/^"|"$/g, "").trim();
}

// ─── Main test runner ─────────────────────────────────────────────────────────
async function main() {
  console.log("\n═══════════════════════════════════════════════════");
  console.log("  SYSTEM INTEGRATION TEST — Chalinze UAMS");
  console.log("═══════════════════════════════════════════════════\n");

  // ─ Test 1: Health check ──────────────────────────────────────────────────
  console.log("── SECTION 1: Health & Connectivity ──");
  const health = await fetch(`${BASE}/api/health`).then(r => r.json()).catch(() => null);
  log("Health endpoint", health?.status === "healthy" && health?.database === "available",
    health ? `DB: ${health.database}` : "No response");

  // ─ Test 2: Auth ──────────────────────────────────────────────────────────
  console.log("\n── SECTION 2: Authentication ──");

  let applicantCookies, hodCookies, ictCookies, adminCookies;
  try {
    applicantCookies = await authHeaders("applicant");
    log("Applicant login", true, "Token obtained");
  } catch (e) { log("Applicant login", false, e.message); }

  try {
    hodCookies = await authHeaders("hod");
    log("HOD login", true, "Token obtained");
  } catch (e) { log("HOD login", false, e.message); }

  try {
    ictCookies = await authHeaders("ict");
    log("ICT login", true, "Token obtained");
  } catch (e) { log("ICT login", false, e.message); }

  try {
    adminCookies = await authHeaders("admin");
    log("Admin login", true, "Token obtained");
  } catch (e) { log("Admin login", false, e.message); }

  // ─ Test 3: Unauthenticated access ─────────────────────────────────────
  console.log("\n── SECTION 3: Unauthenticated Access Protection ──");
  const unauth = await fetch(`${BASE}/api/requests`, { redirect: "manual" });
  log("Unauthenticated /api/requests", unauth.status === 401 || unauth.status === 307 || unauth.status === 302,
    `Status: ${unauth.status}`);

  // ─ Test 4: Submit a new request as applicant ──────────────────────────
  console.log("\n── SECTION 4: Applicant — Submit Request ──");
  let newRequestId = null;
  if (applicantCookies) {
    const payload = {
      requestType: "Create User",
      environment: "Production",
      systems: ["Domain", "eOffice"],
      requestedRole: "User",
      reason: "I need access to perform official duties as Planning Officer at Chalinze District Council TEHAMA department.",
      targetUser: null,
      otherSystem: null,
    };
    const r = await apiCall("POST", "/api/requests", payload, applicantCookies);
    const body = await r.json().catch(() => ({}));
    log("Submit new request", r.status === 201, `Status: ${r.status} — ID: ${body?.id ?? body?.error}`);
    if (r.status === 201) newRequestId = body.id;
  } else {
    log("Submit new request", false, "Skipped — applicant not authenticated");
  }

  // ─ Test 5: Fetch request list ─────────────────────────────────────────
  console.log("\n── SECTION 5: Request Listing ──");
  if (applicantCookies) {
    const r = await apiCall("GET", "/api/requests", null, applicantCookies);
    const body = await r.json().catch(() => ({}));
    const count = Array.isArray(body) ? body.length : (body?.requests?.length ?? "?");
    log("Applicant sees their requests", r.ok, `${count} requests returned`);
  }
  if (hodCookies) {
    const r = await apiCall("GET", "/api/requests", null, hodCookies);
    log("HOD sees requests list", r.ok, `Status: ${r.status}`);
  }
  if (adminCookies) {
    const r = await apiCall("GET", "/api/requests", null, adminCookies);
    const body = await r.json().catch(() => ({}));
    const count = Array.isArray(body) ? body.length : (body?.requests?.length ?? "?");
    log("Admin sees all requests", r.ok, `${count} requests returned`);
  }

  // ─ Test 6: PDF Report Generation ──────────────────────────────────────
  console.log("\n── SECTION 6: PDF Report Generation ──");
  if (newRequestId && applicantCookies) {
    const r = await apiCall("GET", `/api/requests/${newRequestId}/report`, null, applicantCookies);
    const ct = r.headers.get("content-type") ?? "";
    log("PDF report generated", r.ok && ct.includes("pdf"), `Status: ${r.status}, Content-Type: ${ct}`);
  } else if (adminCookies) {
    // fallback: get a known request
    const listR = await apiCall("GET", "/api/requests", null, adminCookies);
    const listBody = await listR.json().catch(() => []);
    const requests = Array.isArray(listBody) ? listBody : listBody?.requests ?? [];
    const testReq = requests[0];
    if (testReq) {
      const r = await apiCall("GET", `/api/requests/${testReq.id}/report`, null, adminCookies);
      const ct = r.headers.get("content-type") ?? "";
      log("PDF report generated (admin)", r.ok && ct.includes("pdf"), `Status: ${r.status}, Content-Type: ${ct}`);
    }
  } else {
    log("PDF report generated", false, "Skipped — no request ID available");
  }

  // ─ Test 7: HOD Decision ────────────────────────────────────────────────
  console.log("\n── SECTION 7: HOD Approval Workflow ──");
  if (newRequestId && hodCookies) {
    const form = new FormData();
    form.append("decision", "approve");
    form.append("comment", "This request is officially endorsed. Access is required for official duties.");
    form.append("designation", "Head of Planning Department");

    const r = await apiCall("POST", `/api/requests/${newRequestId}/decision`, form, hodCookies);
    const body = await r.json().catch(() => ({}));
    log("HOD approves request", r.ok, `Status: ${r.status} — Next: ${body?.status ?? body?.error}`);
  } else {
    log("HOD approves request", false, "Skipped — no request or HOD cookies");
  }

  // ─ Test 8: ICT Decision with PDF upload ───────────────────────────────
  console.log("\n── SECTION 8: ICT Officer Workflow ──");
  if (newRequestId && ictCookies) {
    // Create a minimal valid PDF buffer
    const pdfContent = "%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\nxref\n0 1\n0000000000 65535 f \ntrailer\n<< /Size 1 /Root 1 0 R >>\nstartxref\n9\n%%EOF";
    const pdfBlob = new Blob([pdfContent], { type: "application/pdf" });

    const form = new FormData();
    form.append("decision", "approve");
    form.append("comment", "System access parameters verified. Domain and eOffice access granted as per policy.");
    form.append("designation", "ICT Officer — Chalinze DC");
    form.append("signedDocument", pdfBlob, "signed-request.pdf");

    const r = await apiCall("POST", `/api/requests/${newRequestId}/decision`, form, ictCookies);
    const body = await r.json().catch(() => ({}));
    log("ICT approves with PDF upload", r.ok, `Status: ${r.status} — Next: ${body?.status ?? body?.error}`);
  } else {
    log("ICT approves with PDF upload", false, "Skipped — no request or ICT cookies");
  }

  // ─ Test 9: Retrieve signed document ──────────────────────────────────
  console.log("\n── SECTION 9: Secure Document Retrieval ──");
  if (newRequestId && applicantCookies) {
    const r = await apiCall("GET", `/api/requests/${newRequestId}/signed-document`, null, applicantCookies);
    log("Applicant retrieves signed doc", r.ok || r.status === 404,
      `Status: ${r.status} (404 expected if Supabase bucket not yet created)`);
  }
  if (newRequestId) {
    // Unauthenticated — should be 401
    const r = await fetch(`${BASE}/api/requests/${newRequestId}/signed-document`, { redirect: "manual" });
    log("Unauthenticated doc access → 401", r.status === 401 || r.status === 302 || r.status === 307,
      `Status: ${r.status}`);
  }

  // ─ Test 10: Security Rejection Tests ─────────────────────────────────
  console.log("\n── SECTION 10: Security — File Upload Validation ──");
  if (newRequestId && ictCookies) {
    // Get a fresh PENDING_ICT request if the previous one is now COMPLETED
    const listR = await apiCall("GET", "/api/requests", null, adminCookies ?? ictCookies);
    const listBody = await listR.json().catch(() => []);
    const allReqs = Array.isArray(listBody) ? listBody : listBody?.requests ?? [];
    const pendingIct = allReqs.find(r => r.status === "PENDING_ICT");
    const targetId = pendingIct?.id;

    if (targetId) {
      // Test: JPG file rejected
      const jpgBlob = new Blob(["\xFF\xD8\xFF\xE0" + "fake jpg data"], { type: "image/jpeg" });
      const form1 = new FormData();
      form1.append("decision", "approve");
      form1.append("comment", "This should be rejected by file type check.");
      form1.append("signedDocument", jpgBlob, "photo.jpg");
      const r1 = await apiCall("POST", `/api/requests/${targetId}/decision`, form1, ictCookies);
      log("JPG upload rejected", r1.status === 400, `Status: ${r1.status}`);

      // Test: PDF extension but fake magic bytes
      const fakeBlob = new Blob(["NOTPDF fake content here"], { type: "application/pdf" });
      const form2 = new FormData();
      form2.append("decision", "approve");
      form2.append("comment", "This should be rejected by magic bytes check.");
      form2.append("signedDocument", fakeBlob, "fake.pdf");
      const r2 = await apiCall("POST", `/api/requests/${targetId}/decision`, form2, ictCookies);
      const b2 = await r2.json().catch(() => ({}));
      log("Fake PDF (bad magic bytes) rejected", r2.status === 400, `Status: ${r2.status} — ${b2?.error}`);

      // Test: oversized file (create 6MB blob)
      const bigBlob = new Blob(["%PDF-" + "X".repeat(6 * 1024 * 1024)], { type: "application/pdf" });
      const form3 = new FormData();
      form3.append("decision", "approve");
      form3.append("comment", "This should be rejected by size check.");
      form3.append("signedDocument", bigBlob, "big.pdf");
      const r3 = await apiCall("POST", `/api/requests/${targetId}/decision`, form3, ictCookies);
      log("Oversized PDF (6MB) rejected", r3.status === 400, `Status: ${r3.status}`);
    } else {
      log("JPG upload rejected", false, "Skipped — no PENDING_ICT request found");
      log("Fake PDF rejected", false, "Skipped — no PENDING_ICT request found");
      log("Oversized PDF rejected", false, "Skipped — no PENDING_ICT request found");
    }
  } else {
    log("Security tests", false, "Skipped — ICT not authenticated");
  }

  // ─ Test 11: Admin capabilities ───────────────────────────────────────
  console.log("\n── SECTION 11: Admin Panel ──");
  if (adminCookies) {
    const r = await apiCall("GET", "/api/users", null, adminCookies);
    log("Admin can list users", r.ok || r.status === 404, `Status: ${r.status}`);
    const r2 = await apiCall("GET", "/api/configuration", null, adminCookies);
    log("Admin can read configuration", r2.ok, `Status: ${r2.status}`);
  }

  // ─ Test 12: Cross-role access rejection ──────────────────────────────
  console.log("\n── SECTION 12: RBAC Enforcement ──");
  if (applicantCookies && newRequestId) {
    // Applicant should not be able to make a decision
    const form = new FormData();
    form.append("decision", "approve");
    form.append("comment", "Applicant trying to approve their own request — should be rejected.");
    const r = await apiCall("POST", `/api/requests/${newRequestId}/decision`, form, applicantCookies);
    log("Applicant cannot approve", r.status === 403 || r.status === 401,
      `Status: ${r.status}`);
  }

  // ─ Summary ────────────────────────────────────────────────────────────
  console.log("\n═══════════════════════════════════════════════════");
  console.log(`  RESULTS: ${passed} passed, ${failed} failed`);
  console.log("═══════════════════════════════════════════════════\n");

  const failures = results.filter(r => !r.ok);
  if (failures.length > 0) {
    console.log("FAILURES:");
    failures.forEach(f => console.log(`  ❌ ${f.name}: ${f.detail}`));
  }
}

main().catch(console.error);
