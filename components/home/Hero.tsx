import Link from "next/link";
import { PortraitCircle } from "@/components/ui/Portrait";
import { contact, creatorOf, person } from "@/content/site";

export default function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-name">
      <PortraitCircle size={200} priority className="hero__portrait" />
      <div className="hero__id">
        <h1 id="hero-name" className="hero__name">{person.name}</h1>
        <p className="hero__role">
          {person.role} <span aria-hidden="true">·</span> <a href={contact.github} className="hero__handle">@{contact.githubHandle}</a>
        </p>
        <p className="hero__studio">
          {person.studioLine.replace("BlindspotLab", "")}
          <a href="https://blindspotlab.xyz">BlindspotLab</a>
        </p>
      </div>
      <p className="hero__headline">
        {person.headline.lead} <span className="serif">{person.headline.accent}</span> {person.headline.tail}
      </p>
      <p className="hero__creator">
        Creator of{" "}
        {creatorOf.map((c, i) => (
          <span key={c.name}>
            <Link href={c.href}>{c.name}</Link>
            {i < creatorOf.length - 2 ? ", " : i === creatorOf.length - 2 ? " and " : "."}
          </span>
        ))}
      </p>
      <div className="hero__ctas">
        <Link href="/work" className="btn btn--primary">Explore my work</Link>
        <Link href="/contact" className="btn">Work with me</Link>
        <a href={contact.github} className="btn btn--ghost">GitHub <span aria-hidden="true">↗</span></a>
      </div>
      <p className="hero__meta">
        <span>{person.location}</span>
        {person.availability && <span className="chip chip--blue">{person.availability}</span>}
      </p>
    </section>
  );
}
