import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const projectRef = "jakncquxfhrmgysjpvhx";

if (!url || !serviceKey || !anonKey) {
  console.error("Missing Supabase configuration");
  process.exit(1);
}

const BASE_URL = "http://localhost:3000";
const CHUNK_SIZE = 3000;

/**
 * Authenticates with Supabase and returns a cookie string in the
 * chunked base64 format that @supabase/ssr expects.
 */
async function getAuthCookie(email, password) {
  const client = createClient(url, anonKey);
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error || !data.session) {
    throw new Error(`Login failed for ${email}: ${error?.message}`);
  }
  const session = data.session;
  const payload = JSON.stringify({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    expires_at: session.expires_at,
    expires_in: session.expires_in,
    token_type: "bearer",
    user: session.user
  });
  const b64 = Buffer.from(payload).toString("base64");
  const cookieName = `sb-${projectRef}-auth-token`;
  const chunks = [];
  for (let i = 0; i < b64.length; i += CHUNK_SIZE) {
    chunks.push(b64.substring(i, i + CHUNK_SIZE));
  }
  if (chunks.length === 1) {
    return `${cookieName}.0=${encodeURIComponent("base64-" + chunks[0])}`;
  }
  return chunks
    .map((chunk, i) => `${cookieName}.${i}=${encodeURIComponent(i === 0 ? "base64-" + chunk : chunk)}`)
    .join("; ");
}

let passed = 0;
let failed = 0;

function ok(msg) { passed++; console.log(`✓ ${msg}`); }
function fail(msg) { failed++; console.error(`❌ ${msg}`); }

async function runTests() {
  console.log("=== STARTING FULL SYSTEM E2E AUDIT TESTS ===\n");

  const applicantCookie = await getAuthCookie("applicant.demo@tamisemi.go.tz", process.env.SEED_APPLICANT_PASSWORD);
  const hodCookie = await getAuthCookie("hod.demo@tamisemi.go.tz", process.env.SEED_HOD_PASSWORD);
  const ictCookie = await getAuthCookie("ict.demo@tamisemi.go.tz", process.env.SEED_ICT_PASSWORD);
  const adminCookie = await getAuthCookie("admin.demo@tamisemi.go.tz", process.env.SEED_ADMIN_PASSWORD);
  ok("Logged in as Applicant, HOD, ICT Officer, and Admin.");

  // ── Test 1: NIN Validation (must reject non-20 digits) ──
  console.log("\n[TEST 1] NIN 20-digit validation...");
  const invalidNinRes = await fetch(`${BASE_URL}/api/requests`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: applicantCookie },
    body: JSON.stringify({
      region: "Pwani", lga: "Chalinze DC", facility: "HQ", action: "Create User", environment: "Production",
      checkNumber: "CHK1001", nin: "12345", fullName: "Amina Msuya", designation: "Officer",
      department: "Planning", phone: "0712345678", email: "applicant.demo@tamisemi.go.tz",
      requestedRole: "User", reason: "Need system access for official planning duties.", systems: ["FFARS"], mode: "submit"
    })
  });
  if (invalidNinRes.status === 400) {
    const errBody = await invalidNinRes.json();
    ok(`NIN validation rejected short NIN (HTTP 400). Error: ${errBody.fieldErrors?.nin?.[0] ?? errBody.error}`);
  } else {
    fail(`NIN validation did not return 400. Got: ${invalidNinRes.status}`);
  }

  // ── Test 2: Valid Submission with 20-digit NIN ──
  console.log("\n[TEST 2] Submitting request with valid 20-digit NIN...");
  const submitRes = await fetch(`${BASE_URL}/api/requests`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: applicantCookie },
    body: JSON.stringify({
      region: "Pwani", lga: "Chalinze DC", facility: "HQ", action: "Create User", environment: "Production",
      checkNumber: "CHK1001", nin: "20012906613150000126", fullName: "Amina Msuya", designation: "Officer",
      department: "Planning", phone: "0712345678", email: "applicant.demo@tamisemi.go.tz",
      requestedRole: "User", reason: "Need system access for official planning duties.", systems: ["FFARS"], mode: "submit"
    })
  });
  const submitData = await submitRes.json();
  if (!submitRes.ok || !submitData.id) {
    throw new Error(`Request submission failed (HTTP ${submitRes.status}): ${JSON.stringify(submitData)}`);
  }
  const requestId = submitData.id;
  ok(`Access request created: ${requestId} (${submitData.requestNumber})`);

  // ── Test 3: RBAC PDF Download Protection ──
  console.log("\n[TEST 3] RBAC PDF Download Protection...");
  const applicantDl = await fetch(`${BASE_URL}/api/requests/${requestId}/report`, { headers: { Cookie: applicantCookie } });
  applicantDl.status === 403 ? ok("Applicant PDF download blocked (403).") : fail(`Applicant PDF not blocked. Got: ${applicantDl.status}`);

  const hodDl = await fetch(`${BASE_URL}/api/requests/${requestId}/report`, { headers: { Cookie: hodCookie } });
  hodDl.status === 403 ? ok("HOD PDF download blocked (403).") : fail(`HOD PDF not blocked. Got: ${hodDl.status}`);

  // ── Test 4: HOD Approve ──
  console.log("\n[TEST 4] HOD approving request...");
  const hodDecRes = await fetch(`${BASE_URL}/api/requests/${requestId}/decision`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: hodCookie },
    body: JSON.stringify({ decision: "approve", comment: "Endorsed and approved for ICT processing.", designation: "Head of Planning" })
  });
  const hodDecData = await hodDecRes.json();
  if (hodDecRes.ok && hodDecData.status === "PENDING_ICT") {
    ok("HOD approved. Status → PENDING_ICT.");
  } else {
    throw new Error(`HOD approval failed (HTTP ${hodDecRes.status}): ${JSON.stringify(hodDecData)}`);
  }

  // ── Test 5: ICT PDF Download (must succeed) ──
  console.log("\n[TEST 5] ICT Officer PDF Download authorization...");
  const ictDl = await fetch(`${BASE_URL}/api/requests/${requestId}/report`, { headers: { Cookie: ictCookie } });
  if (ictDl.status === 200 && ictDl.headers.get("content-type")?.includes("application/pdf")) {
    ok("ICT Officer PDF download succeeded (200 OK, application/pdf).");
  } else {
    fail(`ICT PDF download failed. Status: ${ictDl.status}, Content-Type: ${ictDl.headers.get("content-type")}`);
  }

  // Admin PDF Download
  const adminDl = await fetch(`${BASE_URL}/api/requests/${requestId}/report`, { headers: { Cookie: adminCookie } });
  if (adminDl.status === 200 && adminDl.headers.get("content-type")?.includes("application/pdf")) {
    ok("Admin PDF download succeeded (200 OK, application/pdf).");
  } else {
    fail(`Admin PDF download failed. Status: ${adminDl.status}`);
  }

  // ── Test 6: ICT Complete Request ──
  console.log("\n[TEST 6] ICT Officer completing request...");
  const ictDecRes = await fetch(`${BASE_URL}/api/requests/${requestId}/decision`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: ictCookie },
    body: JSON.stringify({ decision: "approve", comment: "Account created and credentials issued.", designation: "Senior ICT Officer" })
  });
  const ictDecData = await ictDecRes.json();
  if (ictDecRes.ok && ictDecData.status === "COMPLETED") {
    ok("ICT Officer completed request. Status → COMPLETED.");
  } else {
    throw new Error(`ICT completion failed (HTTP ${ictDecRes.status}): ${JSON.stringify(ictDecData)}`);
  }

  // ── Test 7: Download All ZIP ──
  console.log("\n[TEST 7] Download All ZIP endpoint...");
  const zipRes = await fetch(`${BASE_URL}/api/requests/download-all`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: ictCookie },
    body: JSON.stringify({ status: "COMPLETED" })
  });
  if (zipRes.status === 200 && zipRes.headers.get("content-type")?.includes("application/zip")) {
    ok("Download All ZIP generated (200, application/zip).");
  } else {
    fail(`Download All ZIP failed. Status: ${zipRes.status}, CT: ${zipRes.headers.get("content-type")}`);
  }

  // ── Test 8: Rejection + Apply Again ──
  console.log("\n[TEST 8] Rejection and Apply Again workflow...");
  const req2Res = await fetch(`${BASE_URL}/api/requests`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: applicantCookie },
    body: JSON.stringify({
      region: "Pwani", lga: "Chalinze DC", facility: "HQ", action: "Create User", environment: "Production",
      checkNumber: "CHK1002", nin: "20012906613150000126", fullName: "Amina Msuya", designation: "Officer",
      department: "Planning", phone: "0712345678", email: "applicant.demo@tamisemi.go.tz",
      requestedRole: "User", reason: "Need system access for testing purposes.", systems: ["PLANREP"], mode: "submit"
    })
  });
  const req2Data = await req2Res.json();
  if (!req2Res.ok || !req2Data.id) {
    throw new Error(`Second request submission failed: ${JSON.stringify(req2Data)}`);
  }
  ok(`Second request created: ${req2Data.id}`);

  // HOD rejects
  const rejRes = await fetch(`${BASE_URL}/api/requests/${req2Data.id}/decision`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: hodCookie },
    body: JSON.stringify({ decision: "reject", comment: "Information incomplete. Please specify exact role.", designation: "Head of Planning" })
  });
  const rejData = await rejRes.json();
  if (rejRes.ok && rejData.status === "REJECTED") {
    ok("Request rejected by HOD. Status → REJECTED.");
  } else {
    fail(`HOD rejection failed: ${JSON.stringify(rejData)}`);
  }

  // ── Test 9: Notifications created ──
  console.log("\n[TEST 9] Notifications for applicant...");
  const notifRes = await fetch(`${BASE_URL}/api/notifications`, {
    headers: { Cookie: applicantCookie }
  });
  if (notifRes.ok) {
    const notifData = await notifRes.json();
    const count = Array.isArray(notifData) ? notifData.length : ((notifData.notifications ?? notifData.data)?.length ?? 0);
    if (count > 0) {
      ok(`Applicant has ${count} notification(s).`);
    } else {
      fail("No notifications found for applicant after HOD decisions.");
    }
  } else {
    fail(`Notifications endpoint failed. Status: ${notifRes.status}`);
  }

  // ── Summary ──
  console.log("\n" + "=".repeat(50));
  console.log(`RESULTS: ${passed} passed, ${failed} failed, ${passed + failed} total`);
  if (failed === 0) {
    console.log("=== ALL E2E SYSTEM TESTS PASSED SUCCESSFULLY! ===");
  } else {
    console.log("=== SOME TESTS FAILED — SEE ABOVE ===");
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("\nE2E Test Execution Failed:", err.message || err);
  process.exit(1);
});
