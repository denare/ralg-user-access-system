import { createClient as createAdminClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { applicantSignupSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: current } = await supabase.auth.getUser();
  if (current.user) return NextResponse.json({ error: "Sign out before creating another account." }, { status: 409 });

  const parsed = applicantSignupSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Provide complete and valid applicant information." }, { status: 400 });
  const data = parsed.data;
  const existing = await prisma.user.findFirst({ where: { OR: [{ email: data.email }, { username: data.username }] } });
  if (existing) return NextResponse.json({ error: "An account already exists for this email or username." }, { status: 409 });

  const { data: authData, error } = await supabase.auth.signUp({
    email: data.email, password: data.password,
    options: { data: { full_name: data.fullName, role: "APPLICANT" } }
  });
  if (error || !authData.user || authData.user.identities?.length === 0) {
    return NextResponse.json({ error: error?.message ?? "This email address is already registered." }, { status: 400 });
  }

  try {
    const profile = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({ data: {
        authUserId: authData.user!.id, fullName: data.fullName, email: data.email,
        username: data.username, phone: data.phone, department: data.department,
        designation: data.designation, region: data.region, role: "APPLICANT"
      } });
      await tx.auditLog.create({ data: { actorId: user.id, action: "APPLICANT_REGISTERED", entityType: "User", entityId: user.id } });
      return user;
    });
    return NextResponse.json({ id: profile.id, requiresEmailConfirmation: !authData.session }, { status: 201 });
  } catch (profileError) {
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const admin = createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY,
        { auth: { persistSession: false, autoRefreshToken: false } });
      await admin.auth.admin.deleteUser(authData.user.id);
    }
    console.error("Applicant profile creation failed", profileError);
    return NextResponse.json({ error: "The applicant account could not be created." }, { status: 500 });
  }
}
