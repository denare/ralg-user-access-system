import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const profile = await getCurrentProfile();
  if (!profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { oldPassword, newPassword, confirmPassword } = await request.json();

    if (!oldPassword || !oldPassword.trim()) {
      return NextResponse.json({ error: "Current password is required." }, { status: 400 });
    }

    if (!newPassword || !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,72}$/.test(newPassword)) {
      return NextResponse.json(
        { error: "New password must contain 8-72 characters with uppercase, lowercase, and a number." },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json({ error: "New password and confirmation do not match." }, { status: 400 });
    }

    // Verify current password via Supabase Auth
    const supabase = await createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: profile.email,
      password: oldPassword
    });

    if (authError) {
      return NextResponse.json({ error: "Current password is incorrect. Please verify your old password." }, { status: 400 });
    }

    // Update to new password using admin client
    const admin = createAdminClient();
    const { error: updateError } = await admin.auth.admin.updateUserById(profile.authUserId, {
      password: newPassword
    });

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Password updated successfully." });
  } catch (err: any) {
    console.error("Change password error:", err);
    return NextResponse.json({ error: "An unexpected error occurred while updating password." }, { status: 500 });
  }
}
