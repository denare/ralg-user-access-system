import { createClient as createAdminClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { applicantSignupSchema } from "@/lib/validation";
import { isDatabaseUnavailable, withDatabaseRetry } from "@/lib/database-retry";
import { mutationGuard } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const limited = mutationGuard(request, { key: "signup", limit: 5, windowMs: 15 * 60 * 1000 });
  if (limited) return limited;

  const supabase = await createClient();
  const { data: current } = await supabase.auth.getUser();
  if (current.user) return NextResponse.json({ error: "Sign out before creating another account." }, { status: 409 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "The submitted registration is not valid JSON." }, { status: 400 });
  }

  const parsed = applicantSignupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({
      error: "Please correct the fields marked below.",
      fieldErrors: parsed.error.flatten().fieldErrors
    }, { status: 400 });
  }
  const data = parsed.data;
  let existing: { email: string; username: string } | null;
  let departmentExists: { id: string } | null;
  try {
    [existing, departmentExists] = await withDatabaseRetry(() => prisma.$transaction([
      prisma.user.findFirst({
        where: { OR: [{ email: data.email }, { username: data.username }] },
        select: { email: true, username: true }
      }),
      prisma.department.findFirst({ where: { name: data.department, isActive: true }, select: { id: true } })
    ]));
  } catch (databaseError) {
    if (!isDatabaseUnavailable(databaseError)) throw databaseError;
    return NextResponse.json({ error: "Registration is temporarily unavailable. Please try again shortly." }, { status: 503 });
  }
  if (existing) {
    const fieldErrors = existing.email === data.email
      ? { email: ["An account already exists for this email address. Sign in instead."] }
      : { username: ["This username is already in use. Choose a different username."] };
    return NextResponse.json({ error: "An account with these details already exists.", fieldErrors }, { status: 409 });
  }
  if (!departmentExists) {
    return NextResponse.json({
      error: "Please correct the fields marked below.",
      fieldErrors: { department: ["Select an active department from the official register."] }
    }, { status: 400 });
  }

  const { data: authData, error } = await supabase.auth.signUp({
    email: data.email, password: data.password,
    options: {
      data: { full_name: data.fullName, role: "APPLICANT" },
      emailRedirectTo: `${new URL(request.url).origin}/auth/callback?next=/dashboard`
    }
  });
  if (error || !authData.user || authData.user.identities?.length === 0) {
    const authMessage = error?.message ?? "This email address is already registered.";
    const field = authMessage.toLowerCase().includes("password") ? "password" : "email";
    return NextResponse.json({ error: "The account could not be registered.", fieldErrors: { [field]: [authMessage] } }, { status: 400 });
  }

  try {
    const profile = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({ data: {
        authUserId: authData.user!.id, fullName: data.fullName, email: data.email,
        username: data.username, phone: data.phone, department: data.department,
        designation: data.designation, region: data.region, role: "APPLICANT"
      } });
      await tx.auditLog.create({ data: { actorId: user.id, action: "APPLICANT_REGISTERED", entityType: "User", entityId: user.id, details: { declarationAccepted: true, noticeVersion: "2026-08-04" } } });
      return user;
    });
    return NextResponse.json({ id: profile.id, requiresEmailConfirmation: !authData.session }, { status: 201 });
  } catch (profileError) {
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const admin = createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY,
        { auth: { persistSession: false, autoRefreshToken: false } });
      await admin.auth.admin.deleteUser(authData.user.id);
    }
    console.error("Applicant profile creation failed", profileError instanceof Error ? profileError.name : "UnknownError");
    const unavailable = isDatabaseUnavailable(profileError);
    return NextResponse.json({ error: unavailable ? "Registration is temporarily unavailable. Please try again shortly." : "The applicant account could not be created." }, { status: unavailable ? 503 : 500 });
  }
}
