import type { Metadata } from "next";
import Link from "next/link";
import Constellation from "@/components/lab/Constellation";

export const metadata: Metadata = {
  title: "Repository constellation",
  description: "An interactive force-directed graph of a real repository, built from StackBrief scan output. Select a file to see its imports, dependents and blast radius.",
  alternates: { canonical: "/lab/constellation" },
};

export default function ConstellationPage() {
  return (
    <>
      <nav aria-label="Breadcrumb" className="meta" style={{ marginBottom: 20 }}><Link href="/lab">Lab</Link> / Constellation</nav>
      <header className="page-head">
        <p className="label">Lab · Engineering visualisation</p>
        <h1 className="h1">Repository constellation</h1>
        <p className="dek">Every dot is a source file in <a className="text-link" href="https://github.com/mojeebdev/outship">Outship</a>, and every line is a local import that <Link className="text-link" href="/work/stackbrief">StackBrief</Link> found and cited. Pick a file and the graph lights up everything that depends on it. That’s the question StackBrief answers before a code change.</p>
      </header>
      <Constellation />
    </>
  );
}
