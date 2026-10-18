import "server-only";
import { errorFields, logEvent } from "@/lib/server/log";
import type { Metric } from "./types";
import { formatCount } from "./types";

/**
 * Arcapush public homepage metrics (https://arcapush.com/api/hero-metrics). Each value ships with Arcapush's own
 * definition and recording start date; the endpoint serves a 15-minute server cache. Arcapush is created by
 * Mojeeb Titilayo. These are platform metrics: never combined with npm figures or with each other.
 */
type HeroMetric = { key: string; label: string; value: number; definition: string };
type Payload = { metrics: HeroMetric[]; refreshedAt?: string; stale?: boolean };

const SOURCE_URL = "https://arcapush.com/api/hero-metrics";

const SHAPE: { key: string; label: string; window: string }[] = [
  { key: "indexed", label: "Builds indexed on Arcapush", window: "Current count" },
  { key: "builders", label: "Builders with a live listing", window: "Current count" },
  { key: "visits", label: "Platform visits since 19 Aug", window: "Since 19 Aug 2026, when recording began" },
  { key: "clicks", label: "Outbound attention since 15 Aug", window: "Since 15 Aug 2026" },
];

export async function getArcapushMetrics(): Promise<Metric[]> {
  let data: Payload | null = null;
  try {
    const res = await fetch(SOURCE_URL, { next: { revalidate: 1800, tags: ["arcapush"] }, signal: AbortSignal.timeout(6000) });
    if (res.ok) data = await res.json();
    else logEvent("warn", "data.arcapush_failed", { status: res.status });
  } catch (err) {
    logEvent("warn", "data.arcapush_failed", errorFields(err));
  }
  const asOf = data ? data.refreshedAt ?? new Date().toISOString() : null;
  return SHAPE.map(({ key, label, window }) => {
    const m = data?.metrics.find((x) => x.key === key);
    return {
      key: `arcapush-${key}`,
      label,
      value: m?.value ?? null,
      display: m ? formatCount(m.value) : "—",
      definition: m ? `${m.definition}${data?.stale ? " (Arcapush marked this snapshot as stale.)" : ""}` : "Unavailable right now. The public Arcapush metrics endpoint did not respond; it refreshes automatically.",
      source: "Arcapush public metrics API",
      sourceUrl: SOURCE_URL,
      sourceType: "live-api",
      window,
      asOf,
      status: m ? "ok" : "unavailable",
    } satisfies Metric;
  });
}
