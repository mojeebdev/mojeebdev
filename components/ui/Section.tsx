import type { ReactNode } from "react";

export default function Section({ id, index, label, title, dek, action, children, className = "", flush = false }: {
  id?: string; index?: string; label: string; title?: ReactNode; dek?: ReactNode; action?: ReactNode; children: ReactNode; className?: string; flush?: boolean;
}) {
  const headingId = id ? `${id}-title` : undefined;
  return (
    <section id={id} className={`section ${flush ? "section--flush" : ""} ${className}`} aria-labelledby={title ? headingId : undefined}>
      <div className="section-head">
        <div className="section-head__row">
          <p className="label">{index ? `${index} / ` : ""}{label}</p>
          {action}
        </div>
        {title && <h2 id={headingId} className="h2">{title}</h2>}
        {dek && <p className="dek">{dek}</p>}
      </div>
      {children}
    </section>
  );
}
