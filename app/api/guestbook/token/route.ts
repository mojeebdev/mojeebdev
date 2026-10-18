import { NextResponse } from "next/server";
import { issueToken } from "@/lib/guestbook/security";

export const dynamic = "force-dynamic";
export function GET() {
  return NextResponse.json({ token: issueToken() }, { headers: { "Cache-Control": "no-store" } });
}
