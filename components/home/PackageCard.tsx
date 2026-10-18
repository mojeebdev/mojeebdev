import Image from "next/image";
import Link from "next/link";
import CopyButton from "@/components/ui/CopyButton";
import type { PackageStats } from "@/lib/data/npm";
import { formatCount } from "@/lib/data/types";
import type { flagshipPackages } from "@/content/tools";

type Meta = (typeof flagshipPackages)[number];
const fmt = (n: number | null) => (n === null ? "—" : formatCount(n));
const day = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }) : "unknown");

export default function PackageCard({ meta, stats, leader }: { meta: Meta; stats: PackageStats; leader: boolean }) {
  return (
    <article className="pkg" data-leader={leader || undefined}>
      <header className="pkg__head">
        <Image src={meta.logo} alt="" width={40} height={40} className="pkg__logo" />
        <div>
          <h3 className="h3"><Link href={meta.caseStudy}>{meta.name}</Link></h3>
          <p className="pkg__name mono">{meta.pkg}</p>
        </div>
        {leader && <span className="chip chip--blue pkg__chip">Most downloaded · all time</span>}
      </header>
      <p className="pkg__pos">{meta.positioning}</p>
      <p className="pkg__total">
        <span className="pkg__total-value">{fmt(stats.total)}</span>
        <span className="pkg__total-label">downloads all time{stats.firstPublished ? <>, since {day(stats.firstPublished)}</> : null}</span>
      </p>
      <dl className="pkg__stats">
        <div><dt>Version</dt><dd className="mono">{stats.version ? `v${stats.version}` : "—"}</dd></div>
        <div><dt>Last 7 days</dt><dd className="mono">{fmt(stats.last7)}</dd></div>
        <div><dt>Last 30 days</dt><dd className="mono">{fmt(stats.last30)}</dd></div>
      </dl>
      <div className="code-line"><code tabIndex={0} aria-label={`Install command: ${meta.install}`}>{meta.install}</code><CopyButton text={meta.install} /></div>
      <footer className="pkg__foot">
        <a href={meta.repo} className="arrow-link">Source <span aria-hidden="true">↗</span></a>
        <a href={`https://www.npmjs.com/package/${meta.pkg}`} className="arrow-link">npm <span aria-hidden="true">↗</span></a>
        <span className="meta pkg__stamp">
          {stats.ok ? <>Released {day(stats.versionDate)} · npm data fetched {day(stats.fetchedAt)}</> : <>npm data unavailable right now; retrying in the background</>}
        </span>
      </footer>
    </article>
  );
}
