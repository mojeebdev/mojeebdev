import { afterEach, describe, expect, it, vi } from "vitest";
import { getPackageStats, type PackageStats } from "@/lib/data/npm";
import { openSourceMetrics } from "@/lib/data/metrics";

const ok = (body: unknown) => new Response(JSON.stringify(body), { status: 200, headers: { "content-type": "application/json" } });
const doc = { "dist-tags": { latest: "1.0.0" }, time: { created: "2026-07-12T00:00:00.000Z", "1.0.0": "2026-07-12T00:00:00.000Z" }, versions: { "1.0.0": {} } };

function mockNpm(rangeResponses: (() => Response | Promise<Response>)[]) {
  let range = 0;
  return vi.fn(async (input: string | URL | Request, _init?: RequestInit) => {
    void _init;
    const url = String(input);
    if (url.includes("registry.npmjs.org")) return ok(doc);
    if (url.includes("/point/")) return ok({ downloads: 10 });
    if (url.includes("/range/")) return rangeResponses[Math.min(range++, rangeResponses.length - 1)]();
    throw new Error(`unexpected ${url}`);
  });
}

describe("npm stats on Workers", () => {
  afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });
  vi.spyOn(console, "warn").mockImplementation(() => {});

  it("retries a rate-limited or failed call once", async () => {
    const fetchMock = mockNpm([() => new Response("busy", { status: 429 }), () => ok({ downloads: [{ day: "2026-07-12", downloads: 7 }, { day: "2026-07-13", downloads: 5 }] })]);
    vi.stubGlobal("fetch", fetchMock);
    const s = await getPackageStats("@blindspotlab/stackbrief");
    expect(s.total).toBe(12);
    expect(fetchMock.mock.calls.filter(([u]) => String(u).includes("/range/"))).toHaveLength(2);
  });

  it("gives up after two failures and reports null rather than a guess", async () => {
    vi.stubGlobal("fetch", mockNpm([() => { throw new Error("timeout"); }]));
    const s = await getPackageStats("@blindspotlab/stylegraft");
    expect(s.total).toBeNull();
    expect(s.last30).toBe(10);
  });

  it("sends a User-Agent", async () => {
    const fetchMock = mockNpm([() => ok({ downloads: [] })]);
    vi.stubGlobal("fetch", fetchMock);
    await getPackageStats("@blindspotlab/arcapush");
    const init = fetchMock.mock.calls[0][1]!;
    expect((init.headers as Record<string, string>)["user-agent"]).toContain("mojeeb.xyz");
  });
});

describe("combined open-source metrics", () => {
  const pkg = (name: PackageStats["name"], total: number | null, last30: number | null): PackageStats => ({ name, version: "1.0.0", versionDate: null, firstPublished: null, versions: 1, license: null, last7: 1, last30, total, releases: [], fetchedAt: "2026-10-18T00:00:00Z", ok: true });

  it("sums all three flagship packages", () => {
    const [all, last30] = openSourceMetrics([pkg("@blindspotlab/stackbrief", 807, 64), pkg("@blindspotlab/stylegraft", 372, 67), pkg("@blindspotlab/arcapush", 1384, 873)]);
    expect(all.display).toBe("2,563");
    expect(last30.display).toBe("1,004");
  });

  it("never shows a partial sum as the all-time total", () => {
    const [all, last30] = openSourceMetrics([pkg("@blindspotlab/stackbrief", 807, 64), pkg("@blindspotlab/stylegraft", 372, 67), pkg("@blindspotlab/arcapush", null, 873)]);
    expect(all).toMatchObject({ display: "—", status: "unavailable", value: null });
    expect(last30.display).toBe("1,004");
  });
});
