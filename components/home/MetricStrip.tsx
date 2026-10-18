import MetricCell from "./MetricCell";
import type { Metric } from "@/lib/data/types";

type Group = { id: string; title: string; caption: string; href?: string; metrics: Metric[] };

/** Social proof: products people use first (Arcapush), then tools developers build with (npm). Never mixed. */
export default function MetricStrip({ groups, founderReported }: { groups: Group[]; founderReported: { title: string; metrics: Metric[] }[] }) {
  return (
    <section className="metrics" aria-label="Evidence">
      {groups.map((g) => (
        <div key={g.id} className="metrics__group">
          <p className="metrics__caption">
            <span className="metrics__title">{g.href ? <a href={g.href}>{g.title}</a> : g.title}</span>
            <span className="meta">{g.caption}</span>
          </p>
          <div className="metric-strip" style={{ ["--cols" as string]: g.metrics.length }}>
            {g.metrics.map((m) => <MetricCell key={m.key} metric={m} />)}
          </div>
        </div>
      ))}
      <details className="metrics__fr">
        <summary>Founder-reported figures <span className="meta">(historical, different collection windows; tap any figure for its definition)</span></summary>
        {founderReported.map((f) => (
          <div key={f.title} className="metrics__group">
            <p className="metrics__caption"><span className="metrics__title">{f.title}</span></p>
            <div className="metric-strip metric-strip--quiet" style={{ ["--cols" as string]: f.metrics.length }}>
              {f.metrics.map((m) => <MetricCell key={m.key} metric={m} />)}
            </div>
          </div>
        ))}
      </details>
    </section>
  );
}
