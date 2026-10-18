import "server-only";

/**
 * Cloudflare Access verification for the moderation routes.
 *
 * Access puts a signed JWT in the `Cf-Access-Jwt-Assertion` header of every request it lets through. We never trust
 * the header's presence or any identity header on its own: the token's RS256 signature is checked against the team's
 * published keys, and its issuer, audience (the Access application's AUD tag) and expiry must all match.
 * https://developers.cloudflare.com/cloudflare-one/identity/authorization-cookie/validating-json/
 */

type Jwk = JsonWebKey & { kid?: string };
type JwtHeader = { alg?: string; kid?: string };
type JwtPayload = { iss?: string; aud?: string | string[]; exp?: number; nbf?: number; email?: string; sub?: string };

const KEY_TTL_MS = 10 * 60_000;
let cache: { team: string; at: number; keys: Jwk[] } | null = null;

const b64url = (s: string) => Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(s.length / 4) * 4, "=")), (c) => c.charCodeAt(0));
const json = <T,>(s: string) => JSON.parse(new TextDecoder().decode(b64url(s))) as T;

export function normaliseTeamDomain(team: string) {
  const host = team.trim().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  return host.includes(".") ? host : `${host}.cloudflareaccess.com`;
}

async function teamKeys(team: string, fetcher: typeof fetch, now: number) {
  if (cache && cache.team === team && now - cache.at < KEY_TTL_MS) return cache.keys;
  const res = await fetcher(`https://${team}/cdn-cgi/access/certs`, { signal: AbortSignal.timeout(5000) });
  if (!res.ok) throw new Error(`access certs ${res.status}`);
  const { keys } = (await res.json()) as { keys: Jwk[] };
  cache = { team, at: now, keys };
  return keys;
}

export type AccessResult = { ok: true; email: string } | { ok: false; reason: string };

export async function verifyAccessJwt(
  token: string | null | undefined,
  opts: { teamDomain: string; aud: string; fetcher?: typeof fetch; now?: number },
): Promise<AccessResult> {
  if (!token) return { ok: false, reason: "missing" };
  const parts = token.split(".");
  if (parts.length !== 3) return { ok: false, reason: "malformed" };
  const team = normaliseTeamDomain(opts.teamDomain);
  const now = opts.now ?? Date.now();
  try {
    const header = json<JwtHeader>(parts[0]);
    const payload = json<JwtPayload>(parts[1]);
    if (header.alg !== "RS256") return { ok: false, reason: "alg" };
    const keys = await teamKeys(team, opts.fetcher ?? fetch, now);
    const jwk = keys.find((k) => k.kid === header.kid);
    if (!jwk) return { ok: false, reason: "kid" };
    const key = await crypto.subtle.importKey("jwk", { kty: jwk.kty, n: jwk.n, e: jwk.e, alg: "RS256", ext: true }, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]);
    const valid = await crypto.subtle.verify("RSASSA-PKCS1-v1_5", key, b64url(parts[2]), new TextEncoder().encode(`${parts[0]}.${parts[1]}`));
    if (!valid) return { ok: false, reason: "signature" };
    if (payload.iss !== `https://${team}`) return { ok: false, reason: "iss" };
    const aud = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
    if (!aud.includes(opts.aud)) return { ok: false, reason: "aud" };
    const sec = now / 1000;
    if (typeof payload.exp !== "number" || payload.exp < sec - 30) return { ok: false, reason: "expired" };
    if (typeof payload.nbf === "number" && payload.nbf > sec + 30) return { ok: false, reason: "nbf" };
    if (!payload.email) return { ok: false, reason: "identity" };
    return { ok: true, email: payload.email };
  } catch {
    return { ok: false, reason: "error" };
  }
}

/** Test hook. */
export function resetAccessKeyCache() { cache = null; }
