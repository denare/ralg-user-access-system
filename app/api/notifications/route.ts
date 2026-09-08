import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const profile = await getCurrentProfile();
  if (!profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const notifications = await prisma.notification.findMany({
    where: { userId: profile.id },
    orderBy: { createdAt: "desc" },
    take: 20
  });

  const unreadCount = await prisma.notification.count({
    where: { userId: profile.id, read: false }
  });

  return NextResponse.json({ notifications, unreadCount });
}

export async function POST() {
  const profile = await getCurrentProfile();
  if (!profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.notification.updateMany({
    where: { userId: profile.id, read: false },
    data: { read: true }
  });

  return NextResponse.json({ success: true });
}
