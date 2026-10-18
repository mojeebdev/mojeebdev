import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Diagram from "@/components/work/Diagram";
import JsonLd from "@/components/ui/JsonLd";
import MetricCell from "@/components/home/MetricCell";
import { caseStudies, getCaseStudy } from "@/content/caseStudies";
import { breadcrumbs, caseStudyJsonLd } from "@/lib/jsonLd";
import { getArcapushMetrics } from "@/lib/data/arcapush";
import { getPackageStats, type PackageName } from "@/lib/data/npm";
import { formatCount, type Metric } from "@/lib/data/types";
import "./case.css";

export const revalidate = 21600;
export const dynamicParams = false;
export function generateStaticParams() { return caseStudies.map((c) => ({ slug: c.slug })); }

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const c = getCaseStudy(slug);
  if (!c) return {};
  return {
    title: `${c.title}: case study`,
    description: c.dek,
    alternates: { canonical: `/work/${c.slug}` },
    openGraph: { type: "article", title: `${c.title}: case study by Mojeeb Titilayo`, description: c.dek, url: `/work/${c.slug}` },
    twitter: { card: "summary_large_image", title: `${c.title}: case study`, description: c.dek },
  };
}

async function liveMetrics(key?: string): Promise<Metric[]> {
  if (!key) return [];
  if (key === "arcapush") return getArcapushMetrics();
  const name = key.replace("npm:", "") as PackageName;
  const s = await getPackageStats(name);
  const base = { source: "npm downloads API", sourceUrl: `https://www.npmjs.com/package/${name}`, sourceType: "live-api" as const, asOf: s.fetchedAt };
  return [
    { ...base, key: "v", label: "Published version", value: s.version, display: s.version ? `v${s.version}` : "—", definition: "Latest version tagged on the npm registry.", window: "Current", status: s.version ? "ok" : "unavailable" },
    { ...base, key: "30", label: "Downloads, 30 days", value: s.last30, display: s.last30 === null ? "—" : formatCount(s.last30), definition: "npm downloads over the rolling 30-day window. Not unique users.", window: "Rolling 30 days", status: s.last30 === null ? "unavailable" : "ok" },
    { ...base, key: "all", label: "Downloads since publication", value: s.total, display: s.total === null ? "—" : formatCount(s.total), definition: `Sum of npm's daily download counts from first publication (${s.firstPublished?.slice(0, 10) ?? "unknown"}) to today.`, window: "Since first publish", status: s.total === null ? "unavailable" : "ok" },
  ];
}

export default async function CaseStudyPage({ params }: Props) {
  const { slug } = await params;
  const c = getCaseStudy(slug);
  if (!c) notFound();
  const metrics = await liveMetrics(c.liveMetrics);
  const idx = caseStudies.findIndex((x) => x.slug === c.slug);
  const next = caseStudies[(idx + 1) % caseStudies.length];

  const toc = [
    ["problem", "Problem"], ["direction", "Product direction"], ["role", "My role"], ["approach", "Engineering approach"],
    ["stack", "Stack and constraints"], ["decisions", "Design decisions"], ["system", "System"], ["outcome", "Outcome and status"],
  ] as const;

  return (
    <article className="case">
      <JsonLd data={caseStudyJsonLd(c)} />
      <JsonLd data={breadcrumbs([{ name: "Profile", path: "/" }, { name: "Work", path: "/work" }, { name: c.title, path: `/work/${c.slug}` }])} />
      <nav aria-label="Breadcrumb" className="crumbs meta"><Link href="/work">Work</Link> <span aria-hidden="true">/</span> {c.title}</nav>
      <header className="case__head">
        <p className="label">Case study {c.number}</p>
        <h1 className="h1">{c.title}</h1>
        <p className="dek case__dek">{c.dek}</p>
        <div className="case__facts">
          <span className="chip">{c.kindLabel}</span>
          <span className={`status status--${c.status}`}>{c.statusLabel}</span>
          <span className="meta">{c.period}</span>
        </div>
        <div className="case__links">
          {c.links.map((l) => <a key={l.href} href={l.href} className="btn btn--sm">{l.label} <span aria-hidden="true">↗</span></a>)}
        </div>
      </header>

      <div className="case__layout">
        <aside className="case__toc" aria-label="On this page">
          <ol role="list">{toc.map(([id, label]) => <li key={id}><a href={`#${id}`}>{label}</a></li>)}</ol>
        </aside>
        <div className="case__body">
          <section id="problem" className="case__sec"><h2 className="label">Problem</h2><p className="case__lede">{c.problem}</p></section>
          <section id="direction" className="case__sec"><h2 className="label">Product direction</h2><p>{c.direction}</p></section>
          <section id="role" className="case__sec"><h2 className="label">My role</h2><p>{c.role}</p></section>
          <section id="approach" className="case__sec">
            <h2 className="label">Engineering approach</h2>
            <ul className="case__list">{c.approach.map((a, i) => <li key={i} dangerouslySetInnerHTML={{ __html: a.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/`([^`]+)`/g, "<code>$1</code>") }} />)}</ul>
          </section>
          <section id="stack" className="case__sec">
            <h2 className="label">Stack and constraints</h2>
            <dl className="case__stack">
              {c.stack.map((s) => <div key={s.layer}><dt>{s.layer}</dt><dd>{s.items.map((it) => <span key={it} className="chip">{it}</span>)}</dd></div>)}
            </dl>
            <ul className="case__list case__list--quiet">{c.constraints.map((x, i) => <li key={i}>{x}</li>)}</ul>
          </section>
          <section id="decisions" className="case__sec">
            <h2 className="label">Design decisions</h2>
            <div className="case__decisions">{c.decisions.map((d) => <div key={d.title}><h3 className="h3">{d.title}</h3><p className="muted">{d.body}</p></div>)}</div>
          </section>
          <section id="system" className="case__sec case__sec--wide">
            <h2 className="label">System</h2>
            <div className="case__visual"><Diagram kind={c.diagram} title={c.title} /></div>
          </section>
          <section id="outcome" className="case__sec">
            <h2 className="label">Outcome and status</h2>
            {metrics.length > 0 && <div className="metric-strip case__metrics" style={{ ["--cols" as string]: metrics.length }}>{metrics.map((m) => <MetricCell key={m.key} metric={m} />)}</div>}
            <ul className="case__list">{c.outcome.map((o, i) => <li key={i}>{o}</li>)}</ul>
            <p className="meta case__sources">Sources: {c.sources.map((s, i) => <span key={i}>{s.href ? <a href={s.href}>{s.label}</a> : s.label}{i < c.sources.length - 1 ? " · " : ""}</span>)}</p>
          </section>
        </div>
      </div>

      <nav className="case__next" aria-label="Next case study">
        <Link href={`/work/${next.slug}`} className="arrow-link"><span className="meta">Next</span> {next.title} <span aria-hidden="true">→</span></Link>
      </nav>
    </article>
  );
}
