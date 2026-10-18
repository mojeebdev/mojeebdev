import { cookies } from "next/headers";
import { MODERATION_ACTIONS, STATUSES, isEntryId, type ModerationAction, type Status } from "@/lib/guestbook/schema";
import { ADMIN_COOKIE, getGuestbook, getModerator, moderationAuthMode, noStoreJson as json } from "@/lib/guestbook/server";
import { errorFields, logEvent } from "@/lib/server/log";

export const dynamic = "force-dynamic";

async function moderator(req: Request) {
  return getModerator(req, (await cookies()).get(ADMIN_COOKIE)?.value);
}

export async function GET(req: Request) {
  const who = await moderator(req);
  if (!who) return json({ error: "Unauthorised", auth: moderationAuthMode() }, 401);
  const gb = getGuestbook();
  if (!gb.active) return json({ error: "The guestbook database isn't connected yet.", reason: gb.reason }, 503);
  const raw = new URL(req.url).searchParams.get("status") ?? "pending";
  const status: Status | "all" = raw === "all" || STATUSES.includes(raw as Status) ? (raw as Status | "all") : "pending";
  try {
    const [entries, counts] = await Promise.all([gb.guestbook.store.listForModeration(status), gb.guestbook.store.counts()]);
    return json({ entries, counts, moderator: who, auth: moderationAuthMode() });
  } catch (err) {
    logEvent("error", "guestbook.admin_list_failed", errorFields(err));
    return json({ error: "Couldn't load entries." }, 502);
  }
}

export async function POST(req: Request) {
  const who = await moderator(req);
  if (!who) return json({ error: "Unauthorised" }, 401);
  const origin = req.headers.get("origin");
  if (origin && new URL(origin).host !== new URL(req.url).host) return json({ error: "Cross-site" }, 403);
  const gb = getGuestbook();
  if (!gb.active) return json({ error: "The guestbook database isn't connected yet." }, 503);
  const { id, action } = (await req.json().catch(() => ({}))) as { id?: unknown; action?: unknown };
  if (!isEntryId(id)) return json({ error: "Invalid id" }, 422);
  if (!MODERATION_ACTIONS.includes(action as ModerationAction)) return json({ error: "Invalid action" }, 422);
  try {
    const found = await gb.guestbook.store.moderate(id, action as ModerationAction, who);
    if (!found) return json({ error: "Entry not found" }, 404);
    logEvent("info", "guestbook.moderated", { action: action as string });
    return json({ ok: true });
  } catch (err) {
    logEvent("error", "guestbook.moderate_failed", errorFields(err));
    return json({ error: "Action failed." }, 502);
  }
}
