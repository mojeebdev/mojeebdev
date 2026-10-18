import { REACTIONS, isEntryId, type ReactionKind } from "@/lib/guestbook/schema";
import { clientIp, hashIp, rateLimited } from "@/lib/guestbook/security";
import { getGuestbook, noStoreJson as json } from "@/lib/guestbook/server";
import { errorFields, logEvent } from "@/lib/server/log";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const gb = getGuestbook();
  if (!gb.active) return json({ error: "Not open yet" }, 503);
  const origin = req.headers.get("origin");
  if (origin && new URL(origin).host !== new URL(req.url).host) return json({ error: "Cross-site" }, 403);
  let body: { id?: unknown; kind?: unknown };
  try { body = await req.json(); } catch { return json({ error: "Malformed" }, 400); }
  const id = isEntryId(body?.id) ? body.id : null;
  const kind = REACTIONS.includes(body?.kind as ReactionKind) ? (body.kind as ReactionKind) : null;
  if (!id || !kind) return json({ error: "Invalid reaction" }, 422);
  const ipHash = await hashIp(clientIp(req.headers), gb.guestbook.salt);
  if (rateLimited(`react:${ipHash}:${id}:${kind}`, 1, 24 * 60 * 60_000) || rateLimited(`react:${ipHash}`, 30, 10 * 60_000)) {
    return json({ error: "Already counted" }, 429);
  }
  try {
    const counted = await gb.guestbook.store.react(id, kind);
    return counted ? json({ ok: true }) : json({ error: "Not found" }, 404);
  } catch (err) {
    logEvent("error", "guestbook.react_failed", errorFields(err));
    return json({ error: "Couldn't save the reaction" }, 502);
  }
}
