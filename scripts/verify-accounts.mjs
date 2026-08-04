import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const accounts = [
  ["employee.demo@tamisemi.go.tz", "employee@123", "EMPLOYEE"],
  ["hod.demo@tamisemi.go.tz", "hod@123", "HOD"],
  ["ict.demo@tamisemi.go.tz", "ict@123", "ICT_OFFICER"],
  ["admin.demo@tamisemi.go.tz", "admin@123", "ADMIN"]
];

for (const [email, password, expectedRole] of accounts) {
  const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error || !data.user) throw error ?? new Error(`Sign in failed for ${email}`);
  const profile = await prisma.user.findUnique({ where: { authUserId: data.user.id } });
  if (!profile || profile.role !== expectedRole) throw new Error(`Role mismatch for ${email}`);
  console.log(`${email}: ${profile.role} verified`);
  await client.auth.signOut();
}

const [users, requests, systems, approvals] = await Promise.all([
  prisma.user.count(),
  prisma.accessRequest.count(),
  prisma.requestSystem.count(),
  prisma.approval.count()
]);
console.log(`Database records: ${users} users, ${requests} requests, ${systems} systems, ${approvals} approvals`);

const anonymous = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
});
const { error: publicAccessError } = await anonymous.from("User").select("id").limit(1);
if (!publicAccessError) throw new Error("Public REST access to the User table must be blocked.");
console.log("Public REST access to application tables: blocked");
await prisma.$disconnect();
