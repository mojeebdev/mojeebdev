import Section from "@/components/ui/Section";
import PackageCard from "./PackageCard";
import { flagshipPackages } from "@/content/tools";
import type { PackageStats } from "@/lib/data/npm";
import { formatCount } from "@/lib/data/types";

export default function ToolsSection({ packages, index = "01" }: { packages: PackageStats[]; index?: string }) {
  const rows = flagshipPackages
    .map((meta) => ({ meta, stats: packages.find((p) => p.name === meta.pkg)! }))
    .filter((r) => r.stats)
    .sort((a, b) => (b.stats.total ?? -1) - (a.stats.total ?? -1));
  const leaderPkg = rows[0]?.stats.total ? rows[0].meta.pkg : null;
  const others = packages.filter((p) => !flagshipPackages.some((f) => f.pkg === p.name));
  return (
    <Section id="tools" index={index} label="Open source" title="Tools I created and maintain" dek="Three flagship npm packages, ranked by verified all-time downloads. Every figure comes from npm and refreshes every six hours.">
      <div className="pkg-grid">
        {rows.map(({ meta, stats }) => <PackageCard key={meta.pkg} meta={meta} stats={stats} leader={meta.pkg === leaderPkg} />)}
      </div>
      {others.length > 0 && (
        <ul role="list" className="pkg-others">
          {others.map((p) => (
            <li key={p.name}>
              <a href={`https://www.npmjs.com/package/${p.name}`} className="mono">{p.name}</a>
              <span className="muted">{p.name.endsWith("didcore") ? "Onboarding wrapper for zunmax/technocore-did-starter" : ""}</span>
              <span className="pkg-others__n"><strong>{p.total === null ? "—" : formatCount(p.total)}</strong> all time{p.version ? <> · v{p.version}</> : null}</span>
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}
