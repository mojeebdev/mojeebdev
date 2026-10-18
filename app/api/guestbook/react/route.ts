import { NextResponse } from "next/server";
import { REACTIONS, type ReactionKind } from "@/lib/guestbook/schema";
import { clientIp, hashIp, rateLimited } from "@/lib/guestbook/security";
import { getStore } from "@/lib/guestbook/store";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const store = getStore();
  if (!store) return NextResponse.json({ error: "Not configured" }, { status: 503 });
  let body: { id?: unknown; kind?: unknown };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Malformed" }, { status: 400 }); }
  const id = typeof body.id === "string" && /^[0-9a-f-]{36}$/i.test(body.id) ? body.id : null;
  const kind = REACTIONS.includes(body.kind as ReactionKind) ? (body.kind as ReactionKind) : null;
  if (!id || !kind) return NextResponse.json({ error: "Invalid reaction" }, { status: 422 });
  const ipHash = hashIp(clientIp(req.headers));
  if (rateLimited(`react:${ipHash}:${id}:${kind}`, 1, 24 * 60 * 60_000) || rateLimited(`react:${ipHash}`, 30, 10 * 60_000)) {
    return NextResponse.json({ error: "Already counted" }, { status: 429 });
  }
  try { await store.react(id, kind); return NextResponse.json({ ok: true }); }
  catch { return NextResponse.json({ error: "Couldn't save the reaction" }, { status: 502 }); }
}
