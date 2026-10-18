import Link from "next/link";
import Hero from "@/components/home/Hero";
import MetricStrip from "@/components/home/MetricStrip";
import ToolsSection from "@/components/home/ToolsSection";
import Flagship from "@/components/home/Flagship";
import WorkCard from "@/components/work/WorkCard";
import Heatmap from "@/components/activity/Heatmap";
import ToolTiles from "@/components/activity/ToolTiles";
import GuestbookPreview from "@/components/guestbook/GuestbookPreview";
import DenIntro from "@/components/den/DenIntro";
import Section from "@/components/ui/Section";
import JsonLd from "@/components/ui/JsonLd";
import { getHomeMetrics } from "@/lib/data/metrics";
import { busiest, calendarDays, calendarEnd, streaks } from "@/lib/data/github";
import { profilePageJsonLd } from "@/lib/jsonLd";
import { caseStudies } from "@/content/caseStudies";
import { contact, studio } from "@/content/site";

export const revalidate = 21600;

export default async function Home() {
  const { arcapush, openSource, packages, arcapushMilestones, workMilestones } = await getHomeMetrics();
  const s = streaks(calendarDays);
  const b = busiest(calendarDays);
  const last90 = calendarDays.slice(-91);
  const last90Total = last90.reduce((t, d) => t + d.count, 0);

  return (
    <>
      <JsonLd data={profilePageJsonLd} />
      <DenIntro />
      <Hero />
      <MetricStrip
        groups={[
          { id: "arcapush", title: "Arcapush", href: "https://arcapush.com", caption: "Flagship product · live from Arcapush’s public metrics", metrics: arcapush },
          { id: "arcapush-all-time", title: "Arcapush, all time", caption: "Since launch in February 2026 · Arcapush analytics", metrics: arcapushMilestones },
          { id: "oss", title: "Open source", caption: "Developer tools on npm · live from the npm registry", metrics: openSource },
          { id: "work", title: "Across all work", caption: "Products, tools and experiments", metrics: workMilestones },
        ]}
      />

      <Flagship index="01" />

      <ToolsSection packages={packages} index="02" />

      <Section
        id="work"
        index="03"
        label="Selected work"
        title="Case studies"
        dek="Six projects with the strongest evidence: studio products, open-source tools, a hackathon build carried further, and client engineering."
        action={<Link href="/projects" className="arrow-link">All projects <span aria-hidden="true">→</span></Link>}
      >
        <div className="work-grid">
          {caseStudies.map((c) => <WorkCard key={c.slug} study={c} curious={c.slug === "stackbrief"} />)}
        </div>
      </Section>

      <Section
        id="activity"
        index="04"
        label="Activity"
        title="Shipping activity"
        dek="Public GitHub contributions over the trailing year, refreshed weekly by the profile workflow."
        action={<Link href="/activity" className="arrow-link">Full activity <span aria-hidden="true">→</span></Link>}
      >
        <Heatmap days={calendarDays} compact source="GitHub public contribution calendar for @mojeebdev" asOf={calendarEnd ? `${calendarEnd}T00:00:00Z` : null} />
        <dl className="insights" style={{ marginTop: 32 }}>
          <div><dt>Active days, trailing year</dt><dd>{s.activeDays} of {calendarDays.length}</dd></div>
          <div><dt>Longest streak in this window</dt><dd>{s.longest} days</dd></div>
          <div><dt>Contributions, last 13 weeks</dt><dd>{last90Total.toLocaleString("en-GB")}</dd></div>
          <div><dt>Busiest weekday</dt><dd>{b.weekday}</dd></div>
        </dl>
        <div style={{ marginTop: 40 }}>
          <h3 className="h3" style={{ marginBottom: 16 }}>Tools I use regularly</h3>
          <ToolTiles />
        </div>
      </Section>

      <Section id="profile" index="05" label="Profile" title="Information">
        <dl className="info-rows">
          <div className="info-row">
            <dt>Studio</dt>
            <dd>
              <p>I founded <a href={studio.url}>{studio.legalName}</a> ({studio.registration}), incorporated in {studio.country} on {studio.incorporatedLabel}. The studio takes rough ideas from founders and turns them into live products: strategy, design, engineering and automation.</p>
            </dd>
          </div>
          <div className="info-row">
            <dt>Created</dt>
            <dd><p><Link href="/work/arcapush">Arcapush</Link>, which I&rsquo;ve built since February 2026, and the developer tools behind it and beside it: StackBrief, StyleGraft and the Arcapush CLI.</p></dd>
          </div>
          <div className="info-row">
            <dt>Focus</dt>
            <dd><p>AI-native products, systems architecture, SaaS, developer tooling, product strategy and selected Web3 engineering.</p></dd>
          </div>
          <div className="info-row">
            <dt>Method</dt>
            <dd><p><Link href="/about#daeto">DAETO</Link>: Discovery, Approach, Execution, Tracking, Optimisation. Understand the problem before choosing the build, and improve from evidence rather than adding features.</p></dd>
          </div>
          <div className="info-row">
            <dt>Recently</dt>
            <dd>
              <p><Link href="/work/aitax">AITAX</Link> (client engineering, pre-release), <Link href="/work/revel">Revel</Link>, <Link href="/projects#outship">Outship</Link>, and Arcapush CLI releases through v0.2.x.</p>
            </dd>
          </div>
        </dl>
      </Section>

      <Section id="guestbook" index="06" label="Guestbook" title="Leave a note" dek="No account needed. Say hello, share a thought, or leave a link back to your work.">
        <GuestbookPreview />
      </Section>

      <section className="section" aria-labelledby="hire-title">
        <div className="cta-band">
          <div>
            <p className="label" style={{ marginBottom: 10 }}>07 / Work with me</p>
            <h2 id="hire-title" className="h2">Have a product that needs building, or a system that needs untangling?</h2>
            <p className="dek" style={{ marginTop: 10 }}>I take on product engineering and strategy engagements, personally or through BlindspotLab.</p>
          </div>
          <div className="cta-band__actions">
            <Link href="/contact" className="btn btn--primary">Work with me</Link>
            <a href={`mailto:${contact.personalEmail}`} className="btn">{contact.personalEmail}</a>
          </div>
        </div>
      </section>
    </>
  );
}
