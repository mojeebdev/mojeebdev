import { beforeEach, describe, expect, it } from "vitest";
import { normaliseTeamDomain, resetAccessKeyCache, verifyAccessJwt } from "@/lib/guestbook/access";

const TEAM = "mojeeb.cloudflareaccess.com";
const AUD = "aud-tag-123";
const b64url = (b: ArrayBuffer | Uint8Array) => Buffer.from(b instanceof Uint8Array ? b : new Uint8Array(b)).toString("base64url");

async function setup() {
  const { privateKey, publicKey } = await crypto.subtle.generateKey({ name: "RSASSA-PKCS1-v1_5", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" }, true, ["sign", "verify"]);
  const jwk = { ...(await crypto.subtle.exportKey("jwk", publicKey)), kid: "k1" };
  const fetcher = (async () => new Response(JSON.stringify({ keys: [jwk] }))) as unknown as typeof fetch;
  const sign = async (payload: Record<string, unknown>, header: Record<string, unknown> = { alg: "RS256", kid: "k1" }) => {
    const h = b64url(new TextEncoder().encode(JSON.stringify(header)));
    const p = b64url(new TextEncoder().encode(JSON.stringify(payload)));
    const sig = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", privateKey, new TextEncoder().encode(`${h}.${p}`));
    return `${h}.${p}.${b64url(sig)}`;
  };
  return { fetcher, sign };
}

const now = Date.now();
const good = { iss: `https://${TEAM}`, aud: [AUD], email: "mojeeb@example.com", exp: Math.floor(now / 1000) + 600, nbf: Math.floor(now / 1000) - 10 };

describe("Cloudflare Access JWT verification", () => {
  beforeEach(() => resetAccessKeyCache());

  it("accepts a valid token and returns the email", async () => {
    const { fetcher, sign } = await setup();
    expect(await verifyAccessJwt(await sign(good), { teamDomain: TEAM, aud: AUD, fetcher, now })).toEqual({ ok: true, email: "mojeeb@example.com" });
  });
  it.each([
    ["wrong audience", { ...good, aud: ["other"] }, "aud"],
    ["wrong issuer", { ...good, iss: "https://evil.cloudflareaccess.com" }, "iss"],
    ["expired", { ...good, exp: Math.floor(now / 1000) - 120 }, "expired"],
    ["no identity", { ...good, email: undefined }, "identity"],
  ])("rejects %s", async (_label, payload, reason) => {
    const { fetcher, sign } = await setup();
    expect(await verifyAccessJwt(await sign(payload), { teamDomain: TEAM, aud: AUD, fetcher, now })).toEqual({ ok: false, reason });
  });
  it("rejects a token signed by another key, an unknown kid, alg=none and garbage", async () => {
    const { fetcher } = await setup();
    const other = await setup();
    const forged = await other.sign(good);
    expect((await verifyAccessJwt(forged, { teamDomain: TEAM, aud: AUD, fetcher, now })).ok).toBe(false);
    resetAccessKeyCache();
    expect(await verifyAccessJwt(await other.sign(good, { alg: "RS256", kid: "nope" }), { teamDomain: TEAM, aud: AUD, fetcher: other.fetcher, now })).toEqual({ ok: false, reason: "kid" });
    const none = `${b64url(new TextEncoder().encode('{"alg":"none"}'))}.${b64url(new TextEncoder().encode(JSON.stringify(good)))}.`;
    expect(await verifyAccessJwt(none, { teamDomain: TEAM, aud: AUD, fetcher, now })).toEqual({ ok: false, reason: "alg" });
    expect((await verifyAccessJwt("not.a.jwt", { teamDomain: TEAM, aud: AUD, fetcher, now })).ok).toBe(false);
    expect(await verifyAccessJwt(null, { teamDomain: TEAM, aud: AUD, fetcher, now })).toEqual({ ok: false, reason: "missing" });
  });
  it("normalises the team domain", () => {
    expect(normaliseTeamDomain("mojeeb")).toBe(TEAM);
    expect(normaliseTeamDomain("https://mojeeb.cloudflareaccess.com/")).toBe(TEAM);
  });
});
