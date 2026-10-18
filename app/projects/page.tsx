import type { Metadata } from "next";
import Archive from "@/components/archive/Archive";
import JsonLd from "@/components/ui/JsonLd";
import { projects } from "@/content/projects";
import { breadcrumbs } from "@/lib/jsonLd";

export const metadata: Metadata = {
  title: "All projects",
  description: "The complete, filterable archive of Mojeeb Titilayo's builds: studio products, open-source tools, client engineering, hackathon entries and experiments, each with its current status.",
  alternates: { canonical: "/projects" },
};

export default function ProjectsPage() {
  const live = projects.filter((p) => ["live", "maintained"].includes(p.status)).length;
  return (
    <>
      <JsonLd data={breadcrumbs([{ name: "Profile", path: "/" }, { name: "All projects", path: "/projects" }])} />
      <header className="page-head">
        <p className="label">Archive</p>
        <h1 className="h1">All projects</h1>
        <p className="dek">
          {projects.length} documented builds, {live} of them live or maintained at the last check (18 Oct 2026). Every row says what it is (studio product, open source, client work, hackathon entry or experiment) and its current status.
        </p>
      </header>
      <Archive projects={projects} />
    </>
  );
}
