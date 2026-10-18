import "server-only";
import { getArcapushMetrics } from "./arcapush";
import { githubMetric } from "./github";
import { getAllPackageStats, type PackageStats } from "./npm";
import { formatCount, type Metric } from "./types";

const FR_AS_OF = "2026-10-18T00:00:00Z";

/**
 * Founder-reported historical Arcapush milestones (supplied 2026-10-18). Their collection windows are not documented
 * in any public source, and they differ from the live public counters, so they are shown separately, labelled, and
 * never summed with each other or relabelled. "300+ indexed builds" is superseded by the live count and not shown.
 */
export const founderReportedArcapush: Metric[] = [
  { key: "fr-arcapush-visits", label: "All-time platform visits", value: "22K+", display: "22K+", definition: "Founder-reported all-time visits to the Arcapush platform. This includes the period before 19 Aug 2026, when the public visit counter began recording, so it is larger than the live figure.", source: "Founder-reported (Arcapush analytics)", sourceType: "founder-reported", window: "All time, Feb 2026 to Oct 2026 (exact source and window: TODO(mojeeb))", asOf: FR_AS_OF, status: "ok" },
  { key: "fr-arcapush-listing", label: "Listing visits", value: "22K+", display: "22K+", definition: "Founder-reported visits to individual listing pages. A separate metric: not part of, and not added to, platform visits.", source: "Founder-reported (Arcapush analytics)", sourceType: "founder-reported", window: "All time (exact window: TODO(mojeeb))", asOf: FR_AS_OF, status: "ok" },
  { key: "fr-arcapush-attention", label: "Attention delivered, all time", value: "9K+", display: "9K+", definition: "Founder-reported outbound attention delivered from Arcapush to listed builds. These are visits sent onward, not unique visitors. Recorded over a longer window than the live 'clicks to builds' counter.", source: "Founder-reported (Arcapush analytics)", sourceType: "founder-reported", window: "All time (exact window: TODO(mojeeb))", asOf: FR_AS_OF, status: "ok" },
];

export const founderReportedGeneral: Metric[] = [
  { key: "fr-projects", label: "Projects and experiments shipped", value: "40+", display: "40+", definition: "Mojeeb's own count of products, tools, experiments and hackathon builds. The archive on this site documents the subset with verifiable links.", source: "Founder-reported", sourceType: "founder-reported", window: "All time", asOf: FR_AS_OF, status: "ok" },
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
    founderReportedArcapush,
    founderReportedGeneral,
  };
}
