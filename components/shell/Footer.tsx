import Link from "next/link";
import { LeopardRest } from "@/components/mascot/Leopard";
import { contact, nav, person, secondaryNav, studio } from "@/content/site";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__row">
        <div className="site-footer__id">
          <p className="h3">Let’s build something careful.</p>
          <p className="meta">
            <a className="text-link" href={`mailto:${contact.personalEmail}`}>{contact.personalEmail}</a>
            {" · "}
            <a className="text-link" href={`mailto:${contact.workEmail}`}>{contact.workEmail}</a>
          </p>
        </div>
        <div className="site-footer__den" title="Shh. The leopard is resting.">
          <LeopardRest size={104} />
        </div>
      </div>
      <div className="site-footer__row">
        <nav aria-label="Footer">
          {[...nav, ...secondaryNav].map((item) => (
            <Link key={item.href} href={item.href}>{item.label}</Link>
          ))}
        </nav>
        <p className="meta">
          © {new Date().getFullYear()} {person.name} · {person.location} · Founder,{" "}
          <a href={studio.url} className="text-link">{studio.name}</a>
        </p>
      </div>
    </footer>
  );
}
