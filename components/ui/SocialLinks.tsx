import Icon, { type IconName } from "./Icon";
import { contact } from "@/content/site";

type Item = { key: IconName; label: string; href: string; me?: boolean };

/** The confirmed social destinations, each as icon + text. Order matches the existing sidebar. */
export const SOCIALS: Item[] = [
  { key: "github", label: "GitHub", href: contact.github, me: true },
  { key: "x", label: "X", href: contact.x, me: true },
  { key: "linkedin", label: "LinkedIn", href: contact.linkedin, me: true },
  { key: "mail", label: "Email", href: `mailto:${contact.personalEmail}` },
];

export default function SocialLinks({ className = "social-links", only }: { className?: string; only?: IconName[] }) {
  const items = only ? SOCIALS.filter((s) => only.includes(s.key)) : SOCIALS;
  return (
    <ul role="list" className={className}>
      {items.map((s) => (
        <li key={s.key}>
          <a className="social-link" href={s.href} rel={s.me ? "me" : undefined}>
            <Icon name={s.key} size={15} />
            <span>{s.label}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
