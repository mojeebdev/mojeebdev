import "server-only";
import { getBindings } from "@/lib/server/bindings";
import { logEvent } from "@/lib/server/log";
import { verifyAccessJwt } from "./access";
import { ADMIN_COOKIE, adminCookieOk } from "./security";
import { guestbookStore, type GuestbookStore } from "./store";

/**
 * Guestbook runtime configuration, resolved per request from the Worker env.
 *
 * The guestbook is "active" only when the D1 binding `DB` and the `GUESTBOOK_IP_SALT` secret both exist. Until then
 * every surface reports "pending activation": the page shows a notice instead of a form and the API answers 503,
 * so a missing database never produces a broken form or a server error.
 */
export type Guestbook = {
  store: GuestbookStore;
  salt: string;
  autoApprove: boolean;
  limiter: ReturnType<typeof getBindings>["GUESTBOOK_LIMITER"];
};
export type GuestbookStatus = { active: true; guestbook: Guestbook } | { active: false; reason: "no-database" | "no-salt" };

export function getGuestbook(): GuestbookStatus {
  const env = getBindings();
  if (!env.DB) return { active: false, reason: "no-database" };
  if (!env.GUESTBOOK_IP_SALT || env.GUESTBOOK_IP_SALT.length < 16) return { active: false, reason: "no-salt" };
  return {
    active: true,
    guestbook: { store: guestbookStore(env.DB), salt: env.GUESTBOOK_IP_SALT, autoApprove: env.GUESTBOOK_AUTO_APPROVE === "true", limiter: env.GUESTBOOK_LIMITER },
  };
}

export type ModerationAuthMode = "access" | "token" | "none";
export function moderationAuthMode(): ModerationAuthMode {
  const env = getBindings();
  if (env.ACCESS_TEAM_DOMAIN && env.ACCESS_AUD) return "access";
  if (env.GUESTBOOK_ADMIN_TOKEN && env.GUESTBOOK_ADMIN_TOKEN.length >= 24) return "token";
  return "none";
}

/**
 * Who is moderating, or null. With Cloudflare Access configured, only a verified Access JWT counts and token sign-in
 * is disabled. Without it, a signed, expiring session cookie from token sign-in is accepted. Client-supplied identity
 * headers are never trusted.
 */
export async function getModerator(req: Request, cookieValue: string | undefined): Promise<string | null> {
  const env = getBindings();
  const mode = moderationAuthMode();
  if (mode === "access") {
    const result = await verifyAccessJwt(req.headers.get("cf-access-jwt-assertion"), { teamDomain: env.ACCESS_TEAM_DOMAIN!, aud: env.ACCESS_AUD! });
    if (!result.ok && result.reason !== "missing") logEvent("warn", "guestbook.admin.access_denied", { reason: result.reason });
    return result.ok ? result.email : null;
  }
  if (mode === "token" && (await adminCookieOk(cookieValue, env.GUESTBOOK_ADMIN_TOKEN))) return "admin-token";
  return null;
}

export { ADMIN_COOKIE };

/** Shared JSON response for guestbook APIs: never cached anywhere. */
export function noStoreJson(body: unknown, status = 200, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "private, no-store", ...headers },
  });
}
