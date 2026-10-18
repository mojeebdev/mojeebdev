import { NextResponse } from "next/server";
import { ADMIN_COOKIE, adminCookieValue, adminTokenOk, clientIp, hashIp, rateLimited } from "@/lib/guestbook/security";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!process.env.GUESTBOOK_ADMIN_TOKEN) return NextResponse.json({ error: "Moderation isn't configured. Set GUESTBOOK_ADMIN_TOKEN." }, { status: 503 });
  if (rateLimited(`admin:${hashIp(clientIp(req.headers))}`, 5, 15 * 60_000)) return NextResponse.json({ error: "Too many attempts" }, { status: 429 });
  const { token } = (await req.json().catch(() => ({}))) as { token?: string };
  if (!adminTokenOk(token)) return NextResponse.json({ error: "That token isn't right." }, { status: 401 });
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, adminCookieValue(), { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: 60 * 60 * 8 });
  return res;
}

export function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(ADMIN_COOKIE);
  return res;
}
