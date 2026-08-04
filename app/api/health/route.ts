import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withDatabaseRetry } from "@/lib/database-retry";

export const dynamic = "force-dynamic";

export async function GET() {
  const configured = Boolean(
    process.env.DATABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  if (!configured) {
    return NextResponse.json({ status: "unhealthy", database: "not_checked" }, { status: 503 });
  }

  try {
    await withDatabaseRetry(() => prisma.$queryRaw`SELECT 1`);
    return NextResponse.json({ status: "healthy", database: "available", checkedAt: new Date().toISOString() });
  } catch {
    return NextResponse.json({ status: "degraded", database: "unavailable", checkedAt: new Date().toISOString() }, { status: 503 });
  }
}
