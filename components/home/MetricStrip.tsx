import MetricCell from "./MetricCell";
import type { Metric } from "@/lib/data/types";

export default function MetricStrip({ metrics, founderReported }: { metrics: Metric[]; founderReported: Metric[] }) {
  return (
    <section className="metrics" aria-label="Evidence">
      <div className="metric-strip">
        {metrics.map((m) => <MetricCell key={m.key} metric={m} />)}
      </div>
      <details className="metrics__fr">
        <summary>Founder-reported figures <span className="meta">(different collection windows; tap any figure for its definition)</span></summary>
        <div className="metric-strip metric-strip--quiet">
          {founderReported.map((m) => <MetricCell key={m.key} metric={m} />)}
        </div>
      </details>
    </section>
  );
}
