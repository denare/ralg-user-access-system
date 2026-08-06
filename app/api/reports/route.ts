import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth";
import { getReportCards } from "@/lib/data";
import { rateLimit } from "@/lib/rate-limit";

export async function GET(request: Request) {
  const limited = rateLimit(request, { key: "reports:summary", limit: 120, windowMs: 10 * 60 * 1000 });
  if (limited) return limited;

  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "ADMIN") {
    return NextResponse.json({ error: "Administrator access required." }, { status: 403 });
  }

  return NextResponse.json({ data: await getReportCards() });
}
