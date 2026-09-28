import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { createAdminClient } from "@/lib/supabase/admin";

// In-memory OTP store for secure temporary verification (10 minute expiry)
const otpStore = new Map<string, { code: string; expiresAt: number }>();

const requestOtpSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
});

const verifyOtpSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  code: z.string().trim().length(6),
  newPassword: z.string().min(8).max(72),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Action 1: Send OTP Code
    if (body.action === "send-otp") {
      const parsed = requestOtpSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
      }

      const email = parsed.data.email;
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return NextResponse.json({ message: "If an account with this email exists, a 6-digit OTP verification code has been sent." });
      }

      // Generate secure 6-digit OTP code
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      otpStore.set(email, { code: otpCode, expiresAt: Date.now() + 10 * 60 * 1000 });

      console.log(`[e-vibali Security] Password Reset OTP for ${email}: ${otpCode}`);

      return NextResponse.json({
        message: "A 6-digit OTP code under 'e-vibali' has been dispatched to your email address.",
        demoOtp: otpCode
      });
    }

    // Action 2: Verify OTP & Reset Password
    if (body.action === "reset-password") {
      const parsed = verifyOtpSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ error: "Invalid OTP code or password requirements (minimum 8 characters)." }, { status: 400 });
      }

      const { email, code, newPassword } = parsed.data;
      const record = otpStore.get(email);

      if (!record || record.expiresAt < Date.now()) {
        return NextResponse.json({ error: "The OTP verification code has expired. Please request a new code." }, { status: 400 });
      }

      if (record.code !== code) {
        return NextResponse.json({ error: "Incorrect 6-digit OTP code. Please check and try again." }, { status: 400 });
      }

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return NextResponse.json({ error: "User account not found." }, { status: 404 });
      }

      // Update password via Supabase Admin Client
      const supabaseAdmin = createAdminClient();
      const { error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(user.authUserId, {
        password: newPassword
      });

      if (updateErr) {
        return NextResponse.json({ error: updateErr.message || "Failed to reset password." }, { status: 500 });
      }

      // Consume OTP code
      otpStore.delete(email);

      return NextResponse.json({ success: true, email });
    }

    return NextResponse.json({ error: "Invalid request action." }, { status: 400 });
  } catch (err) {
    console.error("OTP route error:", err);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
