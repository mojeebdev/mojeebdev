import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import type { WorkerBindings } from "@/lib/server/types";
import { createTestD1 } from "./d1";

const env: { current: WorkerBindings } = { current: {} };
vi.mock("@/lib/server/bindings", () => ({ getBindings: () => env.current }));

const SALT = "integration-salt-0123456789";
const { GET, POST } = await import("@/app/api/guestbook/route");
const token = await import("@/app/api/guestbook/token/route");
const { issueToken } = await import("@/lib/guestbook/security");
const { getModerator } = await import("@/lib/guestbook/server");
const { default: GuestbookList } = await import("@/components/guestbook/GuestbookList");

let ipCounter = 0;
const post = (body: Record<string, unknown>, headers: Record<string, string> = {}) =>
  POST(new Request("https://mojeeb.xyz/api/guestbook", {
    method: "POST",
    headers: { "content-type": "application/json", origin: "https://mojeeb.xyz", "cf-connecting-ip": `198.51.100.${ipCounter}`, ...headers },
    body: JSON.stringify(body),
  }));
const oldToken = () => issueToken(SALT, Date.now() - 10_000);

describe("guestbook API on D1", () => {
  beforeEach(() => { ipCounter++; vi.spyOn(console, "log").mockImplementation(() => {}); vi.spyOn(console, "warn").mockImplementation(() => {}); });

  it("reports pending activation (no errors) when D1 isn't bound", async () => {
    env.current = {};
    const res = await GET(new Request("https://mojeeb.xyz/api/guestbook"));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ active: false, entries: [], nextCursor: null });
    expect((await post({ name: "A", message: "hello" })).status).toBe(503);
    expect((await token.GET()).status).toBe(503);
  });

  it("also stays inactive without the IP salt secret", async () => {
    env.current = { DB: createTestD1() };
    expect((await (await GET(new Request("https://mojeeb.xyz/api/guestbook"))).json()).active).toBe(false);
  });

  it("accepts a valid note into review, never publishing it before approval", async () => {
    env.current = { DB: createTestD1(), GUESTBOOK_IP_SALT: SALT };
    const res = await post({ name: "Ada", message: "Hello from Lagos", link: "ada.dev", token: await oldToken() });
    expect(res.status).toBe(201);
    expect(res.headers.get("cache-control")).toContain("no-store");
    expect(await res.json()).toEqual({ ok: true, status: "pending" });
    const list = await (await GET(new Request("https://mojeeb.xyz/api/guestbook"))).json();
    expect(list.entries).toEqual([]);
  });

  it("publishes immediately with auto-approve, and stores no raw IP", async () => {
    const db = createTestD1();
    env.current = { DB: db, GUESTBOOK_IP_SALT: SALT, GUESTBOOK_AUTO_APPROVE: "true" };
    await post({ name: "Ada", message: "Hello", token: await oldToken() }, { "cf-connecting-ip": "203.0.113.77" });
    const list = await (await GET(new Request("https://mojeeb.xyz/api/guestbook?limit=3"))).json();
    expect(list.entries[0]).toMatchObject({ name: "Ada", message: "Hello", link: null });
    const dump = JSON.stringify(db.raw.prepare("SELECT * FROM guestbook_entries").all());
    expect(dump).not.toContain("203.0.113.77");
  });

  it("rejects bots and bad input", async () => {
    env.current = { DB: createTestD1(), GUESTBOOK_IP_SALT: SALT };
    expect((await post({ name: "A", message: "hello", token: await oldToken(), company: "Acme" })).status).toBe(201); // honeypot: fake success
    expect((await post({ name: "A", message: "hello", token: await issueToken(SALT) })).status).toBe(429); // too fast
    expect((await post({ name: "A", message: "hello", token: "123.abc" })).status).toBe(400);
    expect((await post({ name: "", message: "", token: await oldToken() })).status).toBe(422);
    expect((await post({ name: "A", message: "hello", token: await oldToken() }, { origin: "https://evil.example" })).status).toBe(403);
    expect((await post({ name: "A", message: "hello", token: await oldToken() }, { "content-type": "text/plain" })).status).toBe(415);
    const rows = (env.current.DB as ReturnType<typeof createTestD1>).raw.prepare("SELECT COUNT(*) AS n FROM guestbook_entries").get() as { n: number };
    expect(rows.n).toBe(0);
  });

  it("rate limits repeated signing from one visitor", async () => {
    env.current = { DB: createTestD1(), GUESTBOOK_IP_SALT: SALT };
    const statuses = [];
    for (let i = 0; i < 4; i++) statuses.push((await post({ name: "A", message: `hello ${i}`, token: await oldToken() }, { "cf-connecting-ip": "192.0.2.50" })).status);
    expect(statuses).toEqual([201, 201, 201, 429]);
  });

  it("honours the Workers rate limiter binding when present", async () => {
    env.current = { DB: createTestD1(), GUESTBOOK_IP_SALT: SALT, GUESTBOOK_LIMITER: { limit: async () => ({ success: false }) } };
    expect((await post({ name: "A", message: "hello", token: await oldToken() })).status).toBe(429);
  });

  it("never trusts client-supplied identity for moderation", async () => {
    env.current = { DB: createTestD1(), GUESTBOOK_IP_SALT: SALT, ACCESS_TEAM_DOMAIN: "mojeeb.cloudflareaccess.com", ACCESS_AUD: "aud" };
    const forged = new Request("https://mojeeb.xyz/api/guestbook/admin", { headers: { "cf-access-authenticated-user-email": "mojeeb@example.com", "cf-access-jwt-assertion": "a.b.c" } });
    expect(await getModerator(forged, undefined)).toBeNull();
    env.current = { DB: createTestD1(), GUESTBOOK_IP_SALT: SALT };
    expect(await getModerator(new Request("https://mojeeb.xyz/"), "123.abc")).toBeNull();
  });

  it("renders visitor content as text with ugc nofollow links", () => {
    const html = renderToStaticMarkup(createElement(GuestbookList, {
      reactions: false,
      entries: [{ id: crypto.randomUUID(), created_at: "2026-10-18T10:00:00.000Z", name: "<img src=x onerror=alert(1)>", message: "<script>alert(1)</script>", link: "https://example.com/", reactions: { wave: 0, heart: 0, paw: 0 } }],
    }));
    expect(html).not.toContain("<script>");
    expect(html).not.toContain("<img src=x");
    expect(html).toContain("&lt;script&gt;");
    expect(html).toContain('rel="ugc nofollow noopener noreferrer"');
  });
});
