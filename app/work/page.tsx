import type { Metadata } from "next";
import Link from "next/link";
import WorkCard from "@/components/work/WorkCard";
import JsonLd from "@/components/ui/JsonLd";
import { caseStudies } from "@/content/caseStudies";
import { projects } from "@/content/projects";
import { countWord } from "@/lib/site";
import { breadcrumbs } from "@/lib/jsonLd";

export const metadata: Metadata = {
  title: "Work",
  description: `Case studies from Mojeeb Titilayo: ${caseStudies.map((c) => c.title).join(", ").replace(/, ([^,]*)$/, " and $1")}. Problem, role, engineering approach, decisions and verified outcomes.`,
  alternates: { canonical: "/work" },
};

export default function WorkPage() {
  return (
    <>
      <JsonLd data={breadcrumbs([{ name: "Home", path: "/" }, { name: "Work", path: "/work" }])} />
      <header className="page-head">
        <p className="label">Work</p>
        <h1 className="h1">Selected work</h1>
        <p className="dek">
          {countWord(caseStudies.length)} case studies chosen for evidence, not volume. Each one states my exact role, the constraints, the decisions and what can be verified today.
          The full archive of {projects.length} documented builds lives in <Link href="/projects" className="text-link">All projects</Link>.
        </p>
      </header>
      <div className="work-grid">
        {caseStudies.map((c) => <WorkCard key={c.slug} study={c} level={2} />)}
      </div>
    </>
  );
}
