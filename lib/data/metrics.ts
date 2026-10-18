import "server-only";
import { getArcapushMetrics } from "./arcapush";
import { githubMetric } from "./github";
import { getAllPackageStats, type PackageStats } from "./npm";
import { formatCount, type Metric } from "./types";

const MILESTONES_AS_OF = "2026-10-18T00:00:00Z";

/**
 * Arcapush all-time milestones from Arcapush's own analytics, confirmed by Mojeeb (18 Oct 2026). They cover all of
 * Arcapush's history, so they are larger than the live public counters, which began recording in August. Each figure
 * is a separate metric: never summed with another.
 */
export const arcapushMilestones: Metric[] = [
  { key: "ms-arcapush-visits", label: "All-time platform visits", value: "22K+", display: "22K+", definition: "Visits to the Arcapush platform since launch in February 2026. Larger than the live counter above, which began recording on 19 Aug 2026.", source: "Arcapush analytics", sourceType: "records", window: "All time, since February 2026", asOf: MILESTONES_AS_OF, status: "ok" },
  { key: "ms-arcapush-listing", label: "Listing visits", value: "22K+", display: "22K+", definition: "Visits to individual listing pages. A separate metric: not part of, and not added to, platform visits.", source: "Arcapush analytics", sourceType: "records", window: "All time, since February 2026", asOf: MILESTONES_AS_OF, status: "ok" },
  { key: "ms-arcapush-attention", label: "Attention delivered, all time", value: "9K+", display: "9K+", definition: "Outbound visits Arcapush sent on to listed builds. Visits, not unique visitors.", source: "Arcapush analytics", sourceType: "records", window: "All time, since February 2026", asOf: MILESTONES_AS_OF, status: "ok" },
];

export const workMilestones: Metric[] = [
  { key: "ms-projects", label: "Projects and experiments shipped", value: "40+", display: "40+", definition: "Products, tools, experiments and hackathon builds shipped. The archive on this site documents the ones with public links.", source: "Mojeeb's project records", sourceType: "records", window: "All time", asOf: MILESTONES_AS_OF, status: "ok" },
];

const FLAGSHIP = ["@blindspotlab/stackbrief", "@blindspotlab/stylegraft", "@blindspotlab/arcapush"];

function openSourceMetrics(pkgs: PackageStats[]): Metric[] {
  const tools = pkgs.filter((p) => FLAGSHIP.includes(p.name));
  const okAll = tools.filter((p) => p.total !== null), ok30 = tools.filter((p) => p.last30 !== null);
  const sumAll = okAll.reduce((s, p) => s + (p.total ?? 0), 0), sum30 = ok30.reduce((s, p) => s + (p.last30 ?? 0), 0);
  const fetchedAt = pkgs[0]?.fetchedAt ?? null;
  const names = (list: PackageStats[], f: (p: PackageStats) => number | null) => list.map((p) => `${p.name.split("/")[1]} ${formatCount(f(p) ?? 0)}`).join(", ");
  return [
    { key: "npm-all", label: "npm downloads, all time", value: okAll.length ? sumAll : null, display: okAll.length ? formatCount(sumAll) : "—", definition: `Combined all-time npm downloads of StackBrief, StyleGraft and the Arcapush CLI (${names(okAll, (p) => p.total)}), summed from npm's daily counts since each was first published. Downloads are not unique users.`, source: "npm downloads API", sourceUrl: "https://www.npmjs.com/org/blindspotlab", sourceType: "live-api", window: "Since first publication (Jul–Aug 2026)", asOf: fetchedAt, status: okAll.length ? "ok" : "unavailable" },
    { key: "npm-30", label: "npm downloads, last 30 days", value: ok30.length ? sum30 : null, display: ok30.length ? formatCount(sum30) : "—", definition: `Combined downloads of the same three packages over npm's rolling 30-day window (${names(ok30, (p) => p.last30)}).`, source: "npm downloads API", sourceUrl: "https://www.npmjs.com/org/blindspotlab", sourceType: "live-api", window: "Rolling 30 days", asOf: fetchedAt, status: ok30.length ? "ok" : "unavailable" },
    { key: "npm-tools", label: "Developer tools published", value: tools.filter((p) => p.version).length, display: String(tools.filter((p) => p.version).length), definition: `Flagship packages on npm: ${tools.map((p) => `${p.name}${p.version ? ` v${p.version}` : ""}`).join(", ")}. A fourth package, @blindspotlab/didcore, is an onboarding wrapper listed in the tools section.`, source: "npm registry", sourceUrl: "https://www.npmjs.com/org/blindspotlab", sourceType: "live-api", window: "Current", asOf: fetchedAt, status: "ok" },
  ];
}

export async function getHomeMetrics() {
  const [pkgs, arcapush] = await Promise.all([getAllPackageStats(), getArcapushMetrics()]);
  return {
    arcapush,
    openSource: [...openSourceMetrics(pkgs), githubMetric()],
    packages: pkgs,
    arcapushMilestones,
    workMilestones,
  };
}
