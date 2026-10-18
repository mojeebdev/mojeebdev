import type { Metadata } from "next";
import Link from "next/link";
import WorkCard from "@/components/work/WorkCard";
import JsonLd from "@/components/ui/JsonLd";
import { caseStudies } from "@/content/caseStudies";
import { breadcrumbs } from "@/lib/jsonLd";

export const metadata: Metadata = {
  title: "Work",
  description: "Case studies from Mojeeb Titilayo: Arcapush, StackBrief, StyleGraft, Revel, Admon and AITAX. Problem, role, engineering approach, decisions and verified outcomes.",
  alternates: { canonical: "/work" },
};

export default function WorkPage() {
  return (
    <>
      <JsonLd data={breadcrumbs([{ name: "Profile", path: "/" }, { name: "Work", path: "/work" }])} />
      <header className="page-head">
        <p className="label">Work</p>
        <h1 className="h1">Selected work</h1>
        <p className="dek">
          Six case studies chosen for evidence, not volume. Each one states my exact role, the constraints, the decisions and what can be verified today.
          The full archive of 50+ builds lives in <Link href="/projects" className="text-link">All projects</Link>.
        </p>
      </header>
      <div className="work-grid">
        {caseStudies.map((c) => <WorkCard key={c.slug} study={c} />)}
      </div>
    </>
  );
}
