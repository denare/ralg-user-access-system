import { UserRole } from "@prisma/client";
import { cache } from "react";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { withDatabaseRetry } from "@/lib/database-retry";
import { createClient } from "@/lib/supabase/server";

const validRoles = new Set<UserRole>(["APPLICANT", "HOD", "ICT_OFFICER", "ADMIN"]);

export const getCurrentProfile = cache(async () => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return null;
  }

  return withDatabaseRetry(() => prisma.user.findUnique({ where: { authUserId: data.user.id } }));
});

export const getCurrentShellProfile = cache(async () => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return null;
  }

  const role = data.user.user_metadata?.role;
  if (!validRoles.has(role)) {
    return null;
  }

  return {
    fullName: typeof data.user.user_metadata?.full_name === "string" && data.user.user_metadata.full_name.trim()
      ? data.user.user_metadata.full_name
      : data.user.email ?? "Authorized User",
    role
  };
});

export async function requireProfile(roles?: UserRole[]) {
  const profile = await getCurrentProfile();

  if (!profile || !profile.isActive) {
    redirect("/login");
  }

  if (roles && !roles.includes(profile.role)) {
    redirect("/dashboard");
  }

  return profile;
}
