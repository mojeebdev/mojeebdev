import type { Metadata } from "next";
import Heatmap from "@/components/activity/Heatmap";
import ToolTiles from "@/components/activity/ToolTiles";
import Section from "@/components/ui/Section";
import { busiest, calendarDays, calendarEnd, calendarStart, publicRepos, streaks, totalContributions } from "@/lib/data/github";
import { getAllPackageStats } from "@/lib/data/npm";

export const metadata: Metadata = {
  title: "Activity",
  description: "Mojeeb Titilayo's public engineering activity: GitHub contribution heatmap, release log from npm, and the tools he uses.",
  alternates: { canonical: "/activity" },
};
export const revalidate = 21600;

const short = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

export default async function ActivityPage() {
  const s = streaks(calendarDays);
  const b = busiest(calendarDays);
  const pkgs = await getAllPackageStats();
  const releases = pkgs
    .flatMap((p) => p.releases.map((r) => ({ pkg: p.name, ...r })))
    .sort((a, b) => b.date.localeCompare(a.date));
  const months = Array.from(
    calendarDays.reduce((m, d) => m.set(d.date.slice(0, 7), (m.get(d.date.slice(0, 7)) ?? 0) + d.count), new Map<string, number>()),
  );

  return (
    <>
      <header className="page-head">
        <p className="label">Activity</p>
        <h1 className="h1">Engineering activity</h1>
        <p className="dek">Only public data is shown: GitHub’s public contribution calendar and npm’s release history. Private repository content is never read, guessed or inferred.</p>
      </header>

      <Section id="contributions" label="GitHub" title="Contributions" dek={`${totalContributions.toLocaleString("en-GB")} public contributions between ${short(calendarStart!)} and ${short(calendarEnd!)} across ${publicRepos} public repositories.`} flush>
        <Heatmap days={calendarDays} source="GitHub public contribution calendar for @mojeebdev (profile/stats.json, refreshed weekly by GitHub Actions)" asOf={calendarEnd ? `${calendarEnd}T00:00:00Z` : null} />
        <dl className="insights" style={{ marginTop: 32 }}>
          <div><dt>Active days</dt><dd>{s.activeDays} of {calendarDays.length}</dd></div>
          <div><dt>Longest streak in this window</dt><dd>{s.longest} days</dd></div>
          <div><dt>Current streak at snapshot</dt><dd>{s.current} days</dd></div>
          <div><dt>Busiest single day</dt><dd>{b.topDay.count} on {short(b.topDay.date)}</dd></div>
          <div><dt>Busiest weekday</dt><dd>{b.weekday}</dd></div>
        </dl>
        <details className="data-table">
          <summary>Monthly totals as a table</summary>
          <table>
            <thead><tr><th scope="col">Month</th><th scope="col">Contributions</th></tr></thead>
            <tbody>{months.map(([m, n]) => <tr key={m}><td>{new Date(`${m}-01T00:00:00Z`).toLocaleDateString("en-GB", { month: "long", year: "numeric", timeZone: "UTC" })}</td><td className="mono">{n}</td></tr>)}</tbody>
          </table>
        </details>
      </Section>

      <Section id="releases" label="Shipping log" title="Releases" dek="Every version published to npm under the @blindspotlab scope, newest first. Timestamps come from the npm registry.">
        {releases.length ? (
          <ol role="list" className="release-log">
            {releases.map((r) => (
              <li key={`${r.pkg}@${r.version}`}>
                <span className="mono meta">{short(r.date)}</span>
                <a href={`https://www.npmjs.com/package/${r.pkg}/v/${r.version}`}><span className="mono">{r.pkg}</span> <strong>v{r.version}</strong></a>
              </li>
            ))}
          </ol>
        ) : <p className="muted">The npm registry didn’t respond, so the release log is unavailable right now. It refreshes automatically.</p>}
      </Section>

      <Section id="tools" label="Workbench" title="Tools I use regularly" dek="Technologies that recur across my repositories, grouped by layer.">
        <ToolTiles />
      </Section>

      <Section id="private" label="AI coding usage" title="Private activity" dek="An authenticated panel for AI coding usage (tokens, task duration, streaks) will appear here only once there is an approved data source. Nothing is simulated in the meantime.">
        <p className="meta">Status: no approved source connected.</p>
      </Section>
    </>
  );
}
