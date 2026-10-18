import { describe, expect, it } from "vitest";
import { adminCookieOk, checkToken, clientIp, hashIp, issueAdminCookie, issueToken, looksSpammy, rateLimited, safeEqual } from "@/lib/guestbook/security";

const SALT = "test-salt-0123456789abcdef";

describe("form tokens", () => {
  it("accepts a token after 3 seconds and rejects instant, tampered, foreign and expired ones", async () => {
    const t0 = 1_760_000_000_000;
    const token = await issueToken(SALT, t0);
    expect(await checkToken(token, SALT, t0 + 5_000)).toBe("ok");
    expect(await checkToken(token, SALT, t0 + 500)).toBe("fast");
    expect(await checkToken(token.replace(/.$/, (c) => (c === "a" ? "b" : "a")), SALT, t0 + 5_000)).toBe("invalid");
    expect(await checkToken(token, "another-salt-xxxxxxxxxx", t0 + 5_000)).toBe("invalid");
    expect(await checkToken(token, SALT, t0 + 7 * 60 * 60 * 1000)).toBe("invalid");
    expect(await checkToken(undefined, SALT)).toBe("invalid");
  });
});

describe("IP handling", () => {
  it("hashes IPs with the salt and never returns the IP", async () => {
    const a = await hashIp("203.0.113.9", SALT);
    expect(a).toMatch(/^[0-9a-f]{32}$/);
    expect(a).not.toContain("203");
    expect(await hashIp("203.0.113.9", SALT)).toBe(a);
    expect(await hashIp("203.0.113.9", "different-salt-xxxxxxxx")).not.toBe(a);
  });
  it("prefers CF-Connecting-IP", () => {
    expect(clientIp(new Headers({ "cf-connecting-ip": "198.51.100.1", "x-forwarded-for": "10.0.0.1" }))).toBe("198.51.100.1");
    expect(clientIp(new Headers({ "x-forwarded-for": "10.0.0.1, 10.0.0.2" }))).toBe("10.0.0.1");
  });
});

describe("admin session cookie", () => {
  const TOKEN = "admin-token-that-is-long-enough";
  it("verifies, expires, and dies when the token rotates", async () => {
    const now = Date.now();
    const cookie = await issueAdminCookie(TOKEN, now);
    expect(await adminCookieOk(cookie, TOKEN, now + 1000)).toBe(true);
    expect(await adminCookieOk(cookie, TOKEN, now + 9 * 60 * 60 * 1000)).toBe(false);
    expect(await adminCookieOk(cookie, "rotated-admin-token-xxxxxxxx", now)).toBe(false);
    expect(await adminCookieOk(cookie.replace(/\.\w/, ".0"), TOKEN, now)).toBe(false);
    expect(await adminCookieOk(undefined, TOKEN)).toBe(false);
    expect(await adminCookieOk(cookie, undefined)).toBe(false);
  });
  it("compares in constant time without length leaks", async () => {
    expect(await safeEqual("abc", "abc")).toBe(true);
    expect(await safeEqual("abc", "abcd")).toBe(false);
  });
});

describe("abuse heuristics", () => {
  it("flags link-stuffed and keyword spam", () => {
    expect(looksSpammy("Bob", "visit https://a.com and https://b.com")).toBe(true);
    expect(looksSpammy("SEO services", "cheap")).toBe(true);
    expect(looksSpammy("Ada", "Lovely site, keep building!")).toBe(false);
  });
  it("rate limits within a window", () => {
    const key = `t:${crypto.randomUUID()}`;
    expect([1, 2, 3].map(() => rateLimited(key, 2, 60_000))).toEqual([false, false, true]);
  });
});
