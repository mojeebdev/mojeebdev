import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Now",
  description: "What Mojeeb Titilayo is building and exploring right now.",
  alternates: { canonical: "/now" },
};

const UPDATED = "18 October 2026";

export default function NowPage() {
  return (
    <>
      <header className="page-head">
        <p className="label">Now</p>
        <h1 className="h1">What I’m working on</h1>
        <p className="dek">Taken from public repository and release activity as of {UPDATED}. This is a <a className="text-link" href="https://nownownow.com/about">now page</a>.</p>
      </header>
      <dl className="info-rows">
        <div className="info-row"><dt>Building</dt><dd><p><Link href="/work/arcapush">Arcapush</Link>: the registry, founder analytics and the CLI. Arcapush CLI 0.2.4 shipped on 8 Oct 2026 with guided terminal onboarding.</p></dd></div>
        <div className="info-row"><dt>Studio</dt><dd><p>Setting up <a href="https://blindspotlab.xyz">BlindspotLab Limited</a> after its incorporation on 14 Sep 2026, including a new “Blindspot Thesis” format on the studio site.</p></dd></div>
        <div className="info-row"><dt>Open source</dt><dd><p>Maintaining <Link href="/work/stackbrief">StackBrief</Link>, <Link href="/work/stylegraft">StyleGraft</Link> and the Arcapush CLI.</p></dd></div>
        <div className="info-row"><dt>This site</dt><dd><p>The rebuild you’re looking at: live npm and Arcapush metrics, a GitHub activity heatmap, a <Link href="/lab">lab</Link> and a <Link href="/guestbook">guestbook</Link>.</p></dd></div>
        <div className="info-row"><dt>Note</dt><dd><p className="muted">TODO(mojeeb): add what you’re exploring, reading or learning, in your own words.</p></dd></div>
      </dl>
    </>
  );
}
