import "server-only";
import { getArcapushMetrics } from "./arcapush";
import { githubMetric } from "./github";
import { getAllPackageStats, type PackageStats } from "./npm";
import { formatCount, type Metric } from "./types";

/** Founder-reported snapshots from the brief (2026-10-18). Different, undocumented windows; never summed or relabelled. */
export const founderReported: Metric[] = [
  { key: "fr-projects", label: "Projects and experiments shipped", value: "40+", display: "40+", definition: "Mojeeb's own count of products, tools, experiments and hackathon builds shipped. The public archive on this site documents the subset with verifiable links.", source: "Founder-reported", sourceType: "founder-reported", window: "All time", asOf: "2026-10-18T00:00:00Z", status: "ok" },
  { key: "fr-arcapush-visits", label: "Arcapush all-time platform visits", value: "22K+", display: "22K+", definition: "Founder-reported total of all-time visits to the Arcapush platform. It uses a different collection window from the public counter, which only records visits since 19 Aug 2026.", source: "Founder-reported", sourceType: "founder-reported", window: "All time (source and window: TODO(mojeeb))", asOf: "2026-10-18T00:00:00Z", status: "ok" },
  { key: "fr-arcapush-listing", label: "Arcapush listing visits", value: "22K+", display: "22K+", definition: "Founder-reported visits to individual listing pages. This is a separate metric, not part of the platform-visits figure.", source: "Founder-reported", sourceType: "founder-reported", window: "All time (TODO(mojeeb))", asOf: "2026-10-18T00:00:00Z", status: "ok" },
  { key: "fr-arcapush-attention", label: "Arcapush attention delivered", value: "9K+", display: "9K+", definition: "Founder-reported outbound attention delivered to listed builds. Recorded with a different method and window from the public 'clicks to builds' counter.", source: "Founder-reported", sourceType: "founder-reported", window: "All time (TODO(mojeeb))", asOf: "2026-10-18T00:00:00Z", status: "ok" },
];

function npmMetrics(pkgs: PackageStats[]): Metric[] {
  const ok = pkgs.filter((p) => p.total !== null);
  const sumAll = ok.reduce((s, p) => s + (p.total ?? 0), 0);
  const published = pkgs.filter((p) => p.version).length;
  const fetchedAt = pkgs[0]?.fetchedAt ?? null;
  return [
    { key: "npm-packages", label: "Published npm packages", value: published, display: String(published), definition: `Packages published under the @blindspotlab scope: ${pkgs.map((p) => p.name.split("/")[1]).join(", ")}.`, source: "npm registry", sourceUrl: "https://www.npmjs.com/org/blindspotlab", sourceType: "live-api", window: "Current", asOf: fetchedAt, status: published ? "ok" : "unavailable" },
    { key: "npm-downloads-all", label: "npm downloads, all time", value: ok.length ? sumAll : null, display: ok.length ? formatCount(sumAll) : "—", definition: `Combined all-time downloads of ${ok.length} @blindspotlab packages (${ok.map((p) => `${p.name.split("/")[1]} ${formatCount(p.total ?? 0)}`).join(", ")}), summed from npm's daily counts since each package was first published. Downloads are not unique users; CI and mirrors count too.`, source: "npm downloads API", sourceUrl: "https://www.npmjs.com/org/blindspotlab", sourceType: "live-api", window: "Since first publication (Jul 2026)", asOf: fetchedAt, status: ok.length ? "ok" : "unavailable" },
  ];
}

export async function getHomeMetrics() {
  const [pkgs, arcapush] = await Promise.all([getAllPackageStats(), getArcapushMetrics()]);
  const npm = npmMetrics(pkgs);
  const primary: Metric[] = [npm[0], npm[1], arcapush[0], arcapush[1], githubMetric()];
  return { primary, arcapush, packages: pkgs, founderReported };
}
