import Link from "next/link";
import NavList from "./NavList";
import ThemeToggle from "./ThemeToggle";
import MobileNav from "./MobileNav";
import SocialLinks from "@/components/ui/SocialLinks";
import { person } from "@/content/site";

export default function Sidebar() {
  return (
    <>
      <header className="sidebar" aria-label="Site">
        <div className="sidebar__inner">
          <Link href="/" className="sidebar__id">
            <span className="sidebar__name">{person.name}</span>
            <span className="sidebar__role">{person.role}</span>
          </Link>
          <nav aria-label="Primary" className="sidebar__nav">
            <NavList />
            <p className="sidebar__help">Product engineer’s public log. Built in Lagos, {new Date().getFullYear()}.</p>
          </nav>
          <div className="sidebar__foot">
            <SocialLinks className="sidebar__social" />
            <ThemeToggle />
          </div>
        </div>
      </header>
      <MobileNav />
    </>
  );
}
