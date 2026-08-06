import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function requiredPassword(name) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required to verify demonstration accounts.`);
  return value;
}

const accounts = [
  ["applicant.demo@tamisemi.go.tz", requiredPassword("SEED_APPLICANT_PASSWORD"), "APPLICANT"],
  ["hod.demo@tamisemi.go.tz", requiredPassword("SEED_HOD_PASSWORD"), "HOD"],
  ["ict.demo@tamisemi.go.tz", requiredPassword("SEED_ICT_PASSWORD"), "ICT_OFFICER"],
  ["admin.demo@tamisemi.go.tz", requiredPassword("SEED_ADMIN_PASSWORD"), "ADMIN"]
];

async function retry(operation, attempts = 3) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (attempt === attempts) throw error;
      await new Promise((resolve) => setTimeout(resolve, attempt * 500));
    }
  }
  throw lastError;
}

for (const [email, password, expectedRole] of accounts) {
  const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error || !data.user) throw error ?? new Error(`Sign in failed for ${email}`);
  const profile = await retry(() => prisma.user.findUnique({ where: { authUserId: data.user.id } }));
  if (!profile || profile.role !== expectedRole) throw new Error(`Role mismatch for ${email}`);
  console.log(`${email}: ${profile.role} verified`);
  await client.auth.signOut();
}

const [users, requests, systems, approvals, departments, configuredSystems] = await retry(() => prisma.$transaction([
  prisma.user.count(),
  prisma.accessRequest.count(),
  prisma.requestSystem.count(),
  prisma.approval.count(),
  prisma.department.count(),
  prisma.systemCatalog.count()
]));
console.log(`Database records: ${users} users, ${requests} requests, ${systems} systems, ${approvals} approvals`);
console.log(`Configuration records: ${departments} departments, ${configuredSystems} configured systems`);

const anonymous = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
});
const { error: publicAccessError } = await anonymous.from("User").select("id").limit(1);
if (!publicAccessError) throw new Error("Public REST access to the User table must be blocked.");
console.log("Public REST access to application tables: blocked");
await prisma.$disconnect();
