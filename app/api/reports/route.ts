import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth";
import { getReportCards } from "@/lib/data";

export async function GET() {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "ADMIN") {
    return NextResponse.json({ error: "Administrator access required." }, { status: 403 });
  }

  return NextResponse.json({ data: await getReportCards() });
}
