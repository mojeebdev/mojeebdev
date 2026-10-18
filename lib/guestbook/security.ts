import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";

const SALT = () => process.env.GUESTBOOK_IP_SALT || (process.env.NODE_ENV === "production" ? "" : "dev-only-salt");

/** IPs are never stored: only a salted SHA-256, used for rate limiting and abuse review. */
export function hashIp(ip: string) {
  return createHash("sha256").update(`${SALT()}:${ip}`).digest("hex").slice(0, 32);
}

export function clientIp(headers: Headers) {
  return (headers.get("x-forwarded-for")?.split(",")[0] || headers.get("x-real-ip") || "0.0.0.0").trim();
}

/** Form tokens: issued by the server, must be 3 s – 6 h old when submitted. Defeats replay and instant bot posts. */
export function issueToken(now = Date.now()) {
  const ts = String(now);
  return `${ts}.${createHmac("sha256", SALT() || "unset").update(ts).digest("hex").slice(0, 32)}`;
}
export function checkToken(token: unknown, now = Date.now()): "ok" | "fast" | "invalid" {
  if (typeof token !== "string" || !token.includes(".")) return "invalid";
  const [ts, mac] = token.split(".");
  const expected = createHmac("sha256", SALT() || "unset").update(ts).digest("hex").slice(0, 32);
  if (mac.length !== expected.length || !timingSafeEqual(Buffer.from(mac), Buffer.from(expected))) return "invalid";
  const age = now - Number(ts);
  if (!Number.isFinite(age) || age > 6 * 60 * 60 * 1000 || age < -60_000) return "invalid";
  return age < 3000 ? "fast" : "ok";
}

/** Per-instance sliding-window limiter. The store also enforces a database-backed limit across instances. */
const hits = new Map<string, number[]>();
export function rateLimited(key: string, max: number, windowMs: number) {
  const now = Date.now();
  const list = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (list.length >= max) { hits.set(key, list); return true; }
  list.push(now); hits.set(key, list);
  if (hits.size > 5000) for (const [k, v] of hits) if (!v.some((t) => now - t < windowMs)) hits.delete(k);
  return false;
}

const SPAM_WORDS = /\b(viagra|casino|crypto\s*giveaway|airdrop\s*claim|seo\s*services|backlinks?|loan\s*offer|whatsapp\s*\+?\d)/i;
/** Cheap heuristics; anything suspicious goes to the spam queue for review rather than being silently dropped. */
export function looksSpammy(name: string, message: string) {
  const links = (message.match(/https?:\/\/|www\./gi) ?? []).length;
  return links > 1 || SPAM_WORDS.test(`${name} ${message}`) || /(.)\1{9,}/.test(message);
}

export function adminTokenOk(candidate: string | undefined | null) {
  const expected = process.env.GUESTBOOK_ADMIN_TOKEN;
  if (!expected || !candidate) return false;
  const a = createHash("sha256").update(candidate).digest(), b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}
export const ADMIN_COOKIE = "gb_admin";
export function adminCookieValue() {
  return createHmac("sha256", process.env.GUESTBOOK_ADMIN_TOKEN || "unset").update("guestbook-admin-v1").digest("hex");
}
export function adminCookieOk(value: string | undefined) {
  if (!value || !process.env.GUESTBOOK_ADMIN_TOKEN) return false;
  const e = adminCookieValue();
  return value.length === e.length && timingSafeEqual(Buffer.from(value), Buffer.from(e));
}
