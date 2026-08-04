import { UserRole } from "@prisma/client";
import { cache } from "react";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { withDatabaseRetry } from "@/lib/database-retry";
import { createClient } from "@/lib/supabase/server";

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
