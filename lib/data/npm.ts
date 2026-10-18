import "server-only";
import { errorFields, logEvent } from "@/lib/server/log";

/**
 * npm registry + downloads API, fetched server-side and cached for 6 hours.
 * Approach adapted from blindspotlab/lib/npm-stats.ts: allowlisted packages, timeouts, nullable metrics on failure.
 */
export const PACKAGES = ["@blindspotlab/stackbrief", "@blindspotlab/stylegraft", "@blindspotlab/arcapush", "@blindspotlab/didcore"] as const;
export type PackageName = (typeof PACKAGES)[number];

export type PackageStats = {
  name: PackageName;
  version: string | null;
  versionDate: string | null;
  firstPublished: string | null;
  versions: number | null;
  license: string | null;
  last7: number | null;
  last30: number | null;
  total: number | null;
  /** publish dates of every version — used by the shipping log */
  releases: { version: string; date: string }[];
  fetchedAt: string;
  ok: boolean;
};

const REVALIDATE = 60 * 60 * 6;
const TIMEOUT = 8000;
const HEADERS = { accept: "application/json", "user-agent": "mojeeb.xyz (+https://mojeeb.xyz)" };

/**
 * Cloudflare Workers allow 6 simultaneous outbound connections per request and queue the rest. A page needs ~16 npm
 * calls, so run at most 4 at a time: each request's timeout then starts when it actually starts, not while queued.
 */
const MAX_CONCURRENT = 4;
let active = 0;
const waiting: (() => void)[] = [];
async function limited<T>(task: () => Promise<T>): Promise<T> {
  if (active >= MAX_CONCURRENT) await new Promise<void>((resolve) => waiting.push(resolve));
  active++;
  try { return await task(); }
  finally { active--; waiting.shift()?.(); }
}

type EdgeCache = { match(key: string): Promise<Response | undefined>; put(key: string, res: Response): Promise<void> };
/** Cloudflare's Cache API (caches.default) when running on Workers; undefined under Node. No-op on *.workers.dev. */
const edgeCache = (): EdgeCache | undefined => (globalThis as unknown as { caches?: { default?: EdgeCache } }).caches?.default;

async function fetchJson<T>(url: string): Promise<T | null> {
  return limited(async () => {
    const res = await fetch(url, { next: { revalidate: REVALIDATE, tags: ["npm"] }, signal: AbortSignal.timeout(TIMEOUT), headers: HEADERS });
    if (!res.ok) {
      logEvent("warn", "data.npm_failed", { host: new URL(url).host, status: res.status });
      if (res.status === 429 || res.status >= 500) throw new Error(`npm ${res.status}`); // retryable
      return null;
    }
    // The body is read inside the slot too: the connection stays open until it has been consumed.
    return (await res.json()) as T;
  });
}

/**
 * npm's downloads API fails intermittently from Workers (timeouts / rate limits on shared egress), so: serve from the
 * edge cache when possible, retry a failed call once, and cache successes for the revalidation window.
 */
async function getJson<T>(url: string): Promise<T | null> {
  const cache = edgeCache();
  try {
    const hit = await cache?.match(url);
    if (hit) return (await hit.json()) as T;
  } catch {}
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const data = await fetchJson<T>(url);
      if (data !== null && cache) {
        try { await cache.put(url, new Response(JSON.stringify(data), { headers: { "content-type": "application/json", "cache-control": `public, max-age=${REVALIDATE}` } })); } catch {}
      }
      return data;
    } catch (err) {
      if (attempt === 2) { logEvent("warn", "data.npm_failed", { host: new URL(url).host, attempt, ...errorFields(err) }); return null; }
      await new Promise((r) => setTimeout(r, 400));
    }
  }
  return null;
}

type RegistryDoc = { "dist-tags"?: { latest?: string }; time?: Record<string, string>; versions?: Record<string, unknown>; license?: string };
type Point = { downloads: number };
type Range = { downloads: { day: string; downloads: number }[] };

export async function getPackageStats(name: PackageName): Promise<PackageStats> {
  const enc = name.replace("/", "%2F");
  const [doc, week, month] = await Promise.all([
    getJson<RegistryDoc>(`https://registry.npmjs.org/${enc}`),
    getJson<Point>(`https://api.npmjs.org/downloads/point/last-week/${name}`),
    getJson<Point>(`https://api.npmjs.org/downloads/point/last-month/${name}`),
  ]);
  const created = doc?.time?.created ?? null;
  let total: number | null = null;
  if (created) {
    // Range API allows up to 18 months; every package was first published in 2026.
    const start = created.slice(0, 10);
    const end = new Date().toISOString().slice(0, 10);
    const range = await getJson<Range>(`https://api.npmjs.org/downloads/range/${start}:${end}/${name}`);
    total = range ? range.downloads.reduce((s, d) => s + d.downloads, 0) : null;
  }
  const version = doc?.["dist-tags"]?.latest ?? null;
  const releases = Object.entries(doc?.time ?? {})
    .filter(([k]) => k !== "created" && k !== "modified")
    .map(([v, date]) => ({ version: v, date }))
    .sort((a, b) => a.date.localeCompare(b.date));
  return {
    name,
    version,
    versionDate: version ? doc?.time?.[version] ?? null : null,
    firstPublished: created,
    versions: doc?.versions ? Object.keys(doc.versions).length : null,
    license: typeof doc?.license === "string" ? doc.license : null,
    last7: week?.downloads ?? null,
    last30: month?.downloads ?? null,
    total,
    releases,
    fetchedAt: new Date().toISOString(),
    ok: Boolean(doc && week && month),
  };
}

export async function getAllPackageStats() {
  return Promise.all(PACKAGES.map(getPackageStats));
}
