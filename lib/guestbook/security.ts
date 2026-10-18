import "server-only";

/**
 * Guestbook security primitives. Web Crypto only, so the same code runs on Cloudflare Workers and Node.
 * Every secret is passed in explicitly (from the Worker env); nothing here reads globals.
 */

const enc = new TextEncoder();
const hex = (buf: ArrayBuffer) => Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");

async function hmac(secret: string, data: string) {
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return hex(await crypto.subtle.sign("HMAC", key, enc.encode(data)));
}

/** Constant-time string comparison (both sides hashed first so lengths never leak). */
export async function safeEqual(a: string, b: string) {
  const [x, y] = await Promise.all([crypto.subtle.digest("SHA-256", enc.encode(a)), crypto.subtle.digest("SHA-256", enc.encode(b))]);
  const u = new Uint8Array(x), v = new Uint8Array(y);
  let diff = 0;
  for (let i = 0; i < u.length; i++) diff |= u[i] ^ v[i];
  return diff === 0;
}

/** IPs are never stored: only a salted SHA-256, used for rate limiting. */
export async function hashIp(ip: string, salt: string) {
  return (await hmac(salt, `ip:${ip}`)).slice(0, 32);
}

/** On Cloudflare the client IP is `CF-Connecting-IP`; the others cover local development. */
export function clientIp(headers: Headers) {
  return (headers.get("cf-connecting-ip") || headers.get("x-forwarded-for")?.split(",")[0] || headers.get("x-real-ip") || "0.0.0.0").trim();
}

/** Form tokens: issued by the server, must be 3 s – 6 h old when submitted. Defeats replay and instant bot posts. */
export async function issueToken(salt: string, now = Date.now()) {
  const ts = String(now);
  return `${ts}.${(await hmac(salt, `form:${ts}`)).slice(0, 32)}`;
}
export async function checkToken(token: unknown, salt: string, now = Date.now()): Promise<"ok" | "fast" | "invalid"> {
  if (typeof token !== "string" || !/^\d{10,16}\.[0-9a-f]{32}$/.test(token)) return "invalid";
  const [ts, mac] = token.split(".");
  if (!(await safeEqual(mac, (await hmac(salt, `form:${ts}`)).slice(0, 32)))) return "invalid";
  const age = now - Number(ts);
  if (!Number.isFinite(age) || age > 6 * 60 * 60 * 1000 || age < -60_000) return "invalid";
  return age < 3000 ? "fast" : "ok";
}

/** Per-isolate sliding window: a cheap first line. D1 and the Workers rate limiter enforce limits across isolates. */
const hits = new Map<string, number[]>();
export function rateLimited(key: string, max: number, windowMs: number, now = Date.now()) {
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

/* ---------- Admin token sign-in (used only when Cloudflare Access is not configured) ---------- */

export const ADMIN_COOKIE = "gb_admin";
export const ADMIN_SESSION_SECONDS = 60 * 60 * 8;

/** Session cookie: `<expiry>.<hmac>`, signed with the admin token, so it expires and dies when the token rotates. */
export async function issueAdminCookie(adminToken: string, now = Date.now()) {
  const exp = String(Math.floor(now / 1000) + ADMIN_SESSION_SECONDS);
  return `${exp}.${await hmac(adminToken, `admin-session:${exp}`)}`;
}
export async function adminCookieOk(value: string | undefined, adminToken: string | undefined, now = Date.now()) {
  if (!value || !adminToken || !/^\d{9,12}\.[0-9a-f]{64}$/.test(value)) return false;
  const [exp, mac] = value.split(".");
  if (Number(exp) * 1000 < now) return false;
  return safeEqual(mac, await hmac(adminToken, `admin-session:${exp}`));
}
