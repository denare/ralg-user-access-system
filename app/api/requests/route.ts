import { NextResponse } from "next/server";
import { requests } from "@/lib/mock-data";

export async function GET() {
  return NextResponse.json({
    data: requests,
    total: requests.length
  });
}
