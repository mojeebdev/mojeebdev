import Link from "next/link";
import Icon from "@/components/ui/Icon";
import { PortraitCircle } from "@/components/ui/Portrait";
import { alsoBehind, contact, creatorOfProduct, founderOf, person } from "@/content/site";

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
          Founder of <a href={founderOf.href}>{founderOf.name}</a>. Creator of <a href={creatorOfProduct.href}>{creatorOfProduct.name}</a>.
        </p>
        <p className="hero__creator">
          Also behind{" "}
          {alsoBehind.map((c, i) => (
            <span key={c.name}>
              <a href={c.href}>{c.name}</a>
              {i < alsoBehind.length - 2 ? ", " : i === alsoBehind.length - 2 ? ", and " : "."}
            </span>
          ))}
        </p>
      </div>
      <p className="hero__headline">
        {person.headline.lead} <span className="serif">{person.headline.accent}</span> {person.headline.tail}
      </p>
      <div className="hero__ctas">
        <Link href="/work" className="btn btn--primary">Explore my work</Link>
        <Link href="/contact" className="btn">Work with me</Link>
        <a href={contact.github} className="btn btn--ghost btn--icon">
          <Icon name="github" size={16} />
          <span>GitHub</span>
          <Icon name="external" size={14} className="icon--external" />
        </a>
      </div>
      <p className="hero__meta">
        <span>{person.location}</span>
        {person.availability && <span className="chip chip--blue">{person.availability}</span>}
      </p>
    </section>
  );
}
