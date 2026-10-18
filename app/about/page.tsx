import type { Metadata } from "next";
import Link from "next/link";
import { PortraitFull } from "@/components/ui/Portrait";
import JsonLd from "@/components/ui/JsonLd";
import SocialLinks from "@/components/ui/SocialLinks";
import { certificates, daeto, milestones, principles } from "@/content/about";
import { person, studio } from "@/content/site";
import { breadcrumbs } from "@/lib/jsonLd";
import "./about.css";

export const metadata: Metadata = {
  title: "About",
  description: "Mojeeb Titilayo: product engineer and strategist from Lagos. Founder of BlindspotLab, creator of Arcapush, and behind StackBrief, StyleGraft and the Arcapush CLI. Story, working principles and the DAETO framework.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <>
      <JsonLd data={breadcrumbs([{ name: "Profile", path: "/" }, { name: "About", path: "/about" }])} />
      <header className="about-head">
        <div className="about-head__copy">
          <p className="label">About</p>
          <h1 className="h1">I think in products, and I build the systems behind them.</h1>
          <p className="dek">{person.summary}</p>
        </div>
        <PortraitFull className="about-head__portrait" />
      </header>

      <dl className="info-rows">
        <div className="info-row">
          <dt>Story</dt>
          <dd>
            <p>My background is in history education. That training is still how I work: I start with context, ask what changed and why, and look for the explanation underneath the obvious one.</p>
            <p>Today I turn rough ideas, useful information and overlooked problems into products people can use. I usually own the whole path: the strategy that decides what should exist, the architecture that lets it last, and the engineering that ships it.</p>
          </dd>
        </div>
        <div className="info-row">
          <dt>Now</dt>
          <dd>
            <p>I’m the founder of <a href={studio.url}>{studio.name}</a> ({studio.legalName}, {studio.registration}, incorporated {studio.incorporatedLabel}) and the creator of <Link href="/work/arcapush">Arcapush</Link>, which I’ve built since February 2026. I also maintain three open-source developer tools on npm. See <Link href="/now">what I’m working on now</Link>.</p>
          </dd>
        </div>
        <div className="info-row" id="experience">
          <dt>Evolution</dt>
          <dd>
            <ol role="list" className="timeline">
              {milestones.map((m) => (
                <li key={m.title}>
                  <span className="timeline__date mono">{m.date}</span>
                  <div><p className="timeline__title">{m.href.startsWith("/") ? <Link href={m.href}>{m.title}</Link> : <a href={m.href}>{m.title}</a>}</p><p className="muted">{m.body}</p></div>
                </li>
              ))}
            </ol>
          </dd>
        </div>
        <div className="info-row" id="principles">
          <dt>Principles</dt>
          <dd>
            <div className="principles">
              {principles.map((p) => <div key={p.title}><h2 className="h3">{p.title}</h2><p className="muted">{p.body}</p></div>)}
            </div>
          </dd>
        </div>
        <div className="info-row" id="daeto">
          <dt>DAETO</dt>
          <dd>
            <p>The framework I use to move from an unclear idea to a product that can be built, shipped, measured and improved.</p>
            <ol role="list" className="daeto">
              {daeto.map((d) => <li key={d.letter}><span className="daeto__letter" aria-hidden="true">{d.letter}</span><div><p className="timeline__title">{d.name}</p><p className="muted">{d.body}</p></div></li>)}
            </ol>
          </dd>
        </div>
        <div className="info-row" id="credentials">
          <dt>Credentials</dt>
          <dd>
            <p>{certificates.length} Anthropic Academy certificates. Each link opens its public verification page.</p>
            <ul role="list" className="certs">{certificates.map((c) => <li key={c.url}><a href={c.url}>{c.name} <span aria-hidden="true">↗</span></a></li>)}</ul>
          </dd>
        </div>
        <div className="info-row">
          <dt>Elsewhere</dt>
          <dd>
            <SocialLinks className="social-links social-links--inline" />
          </dd>
        </div>
      </dl>
    </>
  );
}
