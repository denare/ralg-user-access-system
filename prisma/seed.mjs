import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";

if (process.env.ALLOW_DEMO_SEED !== "true") {
  throw new Error("Demonstration seeding is disabled. Set ALLOW_DEMO_SEED=true only for an approved non-production demonstration environment.");
}

const prisma = new PrismaClient();
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// Development-only credentials. Replace these accounts before operational deployment.
const initialPasswords = {
  applicant: process.env.SEED_APPLICANT_PASSWORD ?? process.env.SEED_EMPLOYEE_PASSWORD ?? "applicant@123",
  hod: process.env.SEED_HOD_PASSWORD ?? "hod@123",
  ict: process.env.SEED_ICT_PASSWORD ?? "ict@123",
  admin: process.env.SEED_ADMIN_PASSWORD ?? "admin@123"
};

const accounts = [
  {
    key: "applicant",
    email: "applicant.demo@tamisemi.go.tz",
    legacyEmail: "employee.demo@tamisemi.go.tz",
    username: "applicant.demo",
    password: initialPasswords.applicant,
    fullName: "Amina Msuya",
    role: "APPLICANT",
    department: "Planning",
    designation: "Planning Officer",
    phone: "0712000001",
    region: "Dodoma"
  },
  {
    key: "hod",
    email: "hod.demo@tamisemi.go.tz",
    username: "hod.demo",
    password: initialPasswords.hod,
    fullName: "Neema Mwakalinga",
    role: "HOD",
    department: "Planning",
    designation: "Head of Planning Department",
    phone: "0712000002",
    region: "Dodoma"
  },
  {
    key: "ict",
    email: "ict.demo@tamisemi.go.tz",
    username: "ict.demo",
    password: initialPasswords.ict,
    fullName: "Baraka Kessy",
    role: "ICT_OFFICER",
    department: "Information and Communication Technology",
    designation: "ICT Officer",
    phone: "0712000003",
    region: "Dodoma"
  },
  {
    key: "admin",
    email: "admin.demo@tamisemi.go.tz",
    username: "admin.demo",
    password: initialPasswords.admin,
    fullName: "Rehema Mhando",
    role: "ADMIN",
    department: "Information and Communication Technology",
    designation: "System Administrator",
    phone: "0712000004",
    region: "Dodoma"
  }
];

async function ensureAuthUser(account) {
  const { data: listed, error: listError } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (listError) throw listError;
  const existing = listed.users.find((user) => user.email === account.email || user.email === account.legacyEmail);

  if (existing) {
    const { data, error } = await supabase.auth.admin.updateUserById(existing.id, {
      password: account.password,
      email: account.email,
      email_confirm: true,
      user_metadata: { full_name: account.fullName, role: account.role }
    });
    if (error) throw error;
    return data.user;
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email: account.email,
    password: account.password,
    email_confirm: true,
    user_metadata: { full_name: account.fullName, role: account.role }
  });
  if (error) throw error;
  return data.user;
}

async function main() {
  const profiles = {};

  for (const department of [
    ["Planning", "PLN"], ["Finance and Accounts", "FIN"],
    ["Human Resources and Administration", "HRA"],
    ["Information and Communication Technology", "ICT"]
  ]) {
    await prisma.department.upsert({ where: { code: department[1] }, update: { name: department[0], isActive: true }, create: { name: department[0], code: department[1] } });
  }

  for (const name of ["FFARS", "eOffice", "LGRCIS", "PLANREP", "MUSE", "IMES", "LAAMP", "GOVHOMIS", "GMS", "MADENI MIS", "NeST", "JETMIS", "eBOARD", "TAUSI", "PREMS", "VPN", "Domain"]) {
    await prisma.systemCatalog.upsert({ where: { name }, update: { isActive: true }, create: { name } });
  }

  for (const account of accounts) {
    const authUser = await ensureAuthUser(account);
    profiles[account.key] = await prisma.user.upsert({
      where: { authUserId: authUser.id },
      update: {
        authUserId: authUser.id,
        username: account.username,
        fullName: account.fullName,
        role: account.role,
        department: account.department,
        designation: account.designation,
        phone: account.phone,
        region: account.region,
        isActive: true
      },
      create: {
        authUserId: authUser.id,
        email: account.email,
        username: account.username,
        fullName: account.fullName,
        role: account.role,
        department: account.department,
        designation: account.designation,
        phone: account.phone,
        region: account.region
      }
    });
  }

  await prisma.accessRequest.deleteMany({
    where: { requestNumber: { in: ["UAR-2026-0001", "UAR-2026-0002", "UAR-2026-0003"] } }
  });

  await prisma.accessRequest.create({
    data: {
      requestNumber: "UAR-2026-0001",
      applicantId: profiles.applicant.id,
      region: "Dodoma",
      lga: "Dodoma City Council",
      facility: "Regional Secretariat",
      action: "CREATE_USER",
      environment: "PRODUCTION",
      checkNumber: "12004567",
      nin: "19900101123456789012",
      fullName: profiles.applicant.fullName,
      designation: profiles.applicant.designation,
      department: profiles.applicant.department,
      phone: profiles.applicant.phone,
      email: profiles.applicant.email,
      requestedRole: "District Planning Officer",
      reason: "Access is required to prepare and submit the approved annual planning records.",
      status: "PENDING_HOD",
      systems: { create: [{ system: "PLANREP" }, { system: "eOffice" }] }
    }
  });

  await prisma.accessRequest.create({
    data: {
      requestNumber: "UAR-2026-0002",
      applicantId: profiles.applicant.id,
      region: "Dodoma",
      lga: "Dodoma City Council",
      facility: "Regional Secretariat",
      action: "RESET_PASSWORD",
      environment: "PRODUCTION",
      checkNumber: "12004567",
      nin: "19900101123456789012",
      fullName: profiles.applicant.fullName,
      designation: profiles.applicant.designation,
      department: profiles.applicant.department,
      phone: profiles.applicant.phone,
      email: profiles.applicant.email,
      requestedRole: "Planning Officer",
      reason: "The account was locked after unsuccessful login attempts and is required for reporting.",
      status: "PENDING_ICT",
      hodComment: "Identity and operational requirement verified.",
      systems: { create: [{ system: "PLANREP" }] },
      approvals: {
        create: [{
          approverId: profiles.hod.id,
          approverRole: "HOD",
          decision: "APPROVE",
          comment: "Identity and operational requirement verified."
        }]
      }
    }
  });

  await prisma.accessRequest.create({
    data: {
      requestNumber: "UAR-2026-0003",
      applicantId: profiles.applicant.id,
      region: "Dodoma",
      lga: "Dodoma City Council",
      facility: "Regional Secretariat",
      action: "MODIFY_USER",
      environment: "TESTING",
      checkNumber: "12004567",
      nin: "19900101123456789012",
      fullName: profiles.applicant.fullName,
      designation: profiles.applicant.designation,
      department: profiles.applicant.department,
      phone: profiles.applicant.phone,
      email: profiles.applicant.email,
      targetCheckNumber: "12007891",
      targetFullName: "John Mrema",
      targetDesignation: "Planning Assistant",
      targetDepartment: "Planning",
      targetPhone: "0712000010",
      targetEmail: "john.mrema@tamisemi.go.tz",
      requestedRole: "Planning Data Reviewer",
      reason: "Testing access was adjusted following an approved change in assigned duties.",
      status: "COMPLETED",
      hodComment: "Change in duties confirmed.",
      ictComment: "Testing role updated and verified.",
      completedAt: new Date(),
      systems: { create: [{ system: "PLANREP" }, { system: "eOffice" }] },
      approvals: {
        create: [
          { approverId: profiles.hod.id, approverRole: "HOD", decision: "APPROVE", comment: "Change in duties confirmed." },
          { approverId: profiles.ict.id, approverRole: "ICT_OFFICER", decision: "APPROVE", comment: "Testing role updated and verified." }
        ]
      }
    }
  });
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
