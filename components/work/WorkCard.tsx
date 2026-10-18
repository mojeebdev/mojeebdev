import Link from "next/link";
import Diagram from "./Diagram";
import { LeopardPeek } from "@/components/mascot/Leopard";
import type { CaseStudy } from "@/content/caseStudies";

export default function WorkCard({ study, curious = false }: { study: CaseStudy; curious?: boolean }) {
  return (
    <article className="work-card" data-curious={curious || undefined}>
      {curious && <LeopardPeek size={92} className="work-card__peek" />}
      <Link href={`/work/${study.slug}`} className="work-card__link">
        <div className="work-card__visual"><Diagram kind={study.diagram} compact title={study.title} /></div>
        <div className="work-card__body">
          <div className="work-card__meta">
            <span className="label">{study.number}</span>
            <span className="chip">{study.kindLabel.split(" · ")[0]}</span>
            <span className={`status status--${study.status}`}>{study.statusLabel}</span>
          </div>
          <h3 className="h3">{study.title}</h3>
          <p className="muted">{study.dek}</p>
          <span className="arrow-link work-card__cta">Read case study <span aria-hidden="true">→</span></span>
        </div>
      </Link>
    </article>
  );
}
