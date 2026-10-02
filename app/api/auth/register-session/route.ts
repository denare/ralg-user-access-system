import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const profile = await getCurrentProfile();
    if (!profile) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sessionId } = await request.json().catch(() => ({}));
    const newSessionId = sessionId || crypto.randomUUID();

    // Store active session ID in user record
    await prisma.user.update({
      where: { id: profile.id },
      data: { activeSessionId: newSessionId }
    });

    // Store active session ID in secure HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set("active_session_id", newSessionId, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production"
    });

    return NextResponse.json({ success: true, sessionId: newSessionId });
  } catch (err) {
    console.error("Register session error:", err);
    return NextResponse.json({ error: "Failed to register session." }, { status: 500 });
  }
}
