import "server-only";
import type { Metric } from "./types";
import { formatCount } from "./types";

/** Public Arcapush homepage metrics. Each comes with Arcapush's own definition. 15-minute server cache upstream. */
type HeroMetric = { key: string; label: string; value: number; definition: string };

const SOURCE_URL = "https://arcapush.com/api/hero-metrics";

export async function getArcapushMetrics(): Promise<Metric[]> {
  const keys = [
    { key: "indexed", window: "Current count" },
    { key: "clicks", window: "Since 15 Aug 2026" },
    { key: "visits", window: "Since 19 Aug 2026" },
    { key: "builders", window: "Current count" },
  ];
  let data: { metrics: HeroMetric[] } | null = null;
  let asOf: string | null = null;
  try {
    const res = await fetch(SOURCE_URL, { next: { revalidate: 1800, tags: ["arcapush"] }, signal: AbortSignal.timeout(6000) });
    if (res.ok) { data = await res.json(); asOf = new Date().toISOString(); }
  } catch {}
  return keys.map(({ key, window }) => {
    const m = data?.metrics.find((x) => x.key === key);
    return {
      key: `arcapush-${key}`,
      label: m ? `Arcapush ${m.label.toLowerCase().replace(/ since .*/, "")}` : `Arcapush ${key}`,
      value: m?.value ?? null,
      display: m ? formatCount(m.value) : "—",
      definition: m?.definition ?? "Unavailable right now. The public Arcapush metrics endpoint did not respond.",
      source: "Arcapush public metrics API",
      sourceUrl: SOURCE_URL,
      sourceType: "live-api",
      window,
      asOf,
      status: m ? "ok" : "unavailable",
    } satisfies Metric;
  });
}
