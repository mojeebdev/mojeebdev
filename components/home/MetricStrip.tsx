import MetricCell from "./MetricCell";
import type { Metric } from "@/lib/data/types";

type Group = { id: string; title: string; caption: string; href?: string; metrics: Metric[] };

/** Social proof: products people use first (Arcapush), then tools developers build with (npm). Never mixed. */
export default function MetricStrip({ groups }: { groups: Group[] }) {
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
    </section>
  );
}
