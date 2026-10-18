import { getBindings } from "@/lib/server/bindings";
import { ADMIN_COOKIE, ADMIN_SESSION_SECONDS, clientIp, issueAdminCookie, rateLimited, safeEqual } from "@/lib/guestbook/security";
import { moderationAuthMode, noStoreJson as json } from "@/lib/guestbook/server";
import { logEvent } from "@/lib/server/log";

export const dynamic = "force-dynamic";

const cookie = (value: string, maxAge: number) =>
  `${ADMIN_COOKIE}=${value}; Path=/; Max-Age=${maxAge}; HttpOnly; SameSite=Strict${process.env.NODE_ENV === "production" ? "; Secure" : ""}`;

/** Token sign-in. Only available when Cloudflare Access is NOT configured (Access then owns moderation sign-in). */
export async function POST(req: Request) {
  const mode = moderationAuthMode();
  if (mode === "access") return json({ error: "Moderation sign-in is handled by Cloudflare Access." }, 409);
  if (mode === "none") return json({ error: "Moderation isn't configured. Set up Cloudflare Access or the GUESTBOOK_ADMIN_TOKEN secret." }, 503);
  const origin = req.headers.get("origin");
  if (origin && new URL(origin).host !== new URL(req.url).host) return json({ error: "Cross-site" }, 403);
  // Brute force guard keyed on the raw IP in memory only; it is never logged or stored.
  if (rateLimited(`admin:${clientIp(req.headers)}`, 5, 15 * 60_000)) return json({ error: "Too many attempts. Try again later." }, 429);
  const { token } = (await req.json().catch(() => ({}))) as { token?: unknown };
  const expected = getBindings().GUESTBOOK_ADMIN_TOKEN!;
  if (typeof token !== "string" || !(await safeEqual(token, expected))) {
    logEvent("warn", "guestbook.admin.token_rejected");
    return json({ error: "That token isn't right." }, 401);
  }
  return json({ ok: true }, 200, { "Set-Cookie": cookie(await issueAdminCookie(expected), ADMIN_SESSION_SECONDS) });
}

export function DELETE() {
  return json({ ok: true }, 200, { "Set-Cookie": cookie("", 0) });
}
