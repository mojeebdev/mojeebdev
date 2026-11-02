import "server-only";
import { caseStudies } from "@/content/caseStudies";
import { projects } from "@/content/projects";
import type { Pulse } from "@/lib/leopard/types";
import { getArcapushMetrics } from "./arcapush";
import { calendarDays, calendarEnd, streaks } from "./github";
import { openSourceMetrics } from "./metrics";
import { getAllPackageStats, type PackageStats } from "./npm";
import type { Metric } from "./types";

const num = (metrics: Metric[], key: string) => {
  const v = metrics.find((m) => m.key === key)?.value;
  return typeof v === "number" ? v : null;
};

/** Build the leopard's facts from data a page has already fetched (no extra requests). */
export function buildPulse({ arcapush, packages }: { arcapush: Metric[]; packages?: PackageStats[] | null }): Pulse {
  const week = calendarDays.slice(-7).reduce((t, d) => t + d.count, 0);
  return {
    github: { week, weekEnd: calendarEnd, streak: streaks(calendarDays).current },
    arcapush: { indexed: num(arcapush, "arcapush-indexed"), visits: num(arcapush, "arcapush-visits") },
    npm30: packages ? num(openSourceMetrics(packages), "npm-30") : null,
    projects: projects.length,
    caseStudies: caseStudies.length,
  };
}

/** Fetch and build. `npm: false` skips the npm registry calls (used by the per-question API route). */
export async function getPulse({ npm = true } = {}): Promise<Pulse> {
  const [arcapush, packages] = await Promise.all([getArcapushMetrics(), npm ? getAllPackageStats() : Promise.resolve(null)]);
  return buildPulse({ arcapush, packages });
}
