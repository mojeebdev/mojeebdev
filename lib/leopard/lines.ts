import type { LeopardLine, Pulse } from "./types";

const count = (n: number) => new Intl.NumberFormat("en-GB").format(n);
const day = (iso: string) => new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });

/**
 * What the leopard says, built only from live or published figures. A fact whose source didn't respond is left out
 * rather than guessed. The leopard refers to Mojeeb by name.
 */
export function pulseLines(p: Pulse, { den = false } = {}): LeopardLine[] {
  const lines: LeopardLine[] = [];
  if (p.github.week > 0 && p.github.weekEnd) {
    lines.push({
      text: `Mojeeb made ${count(p.github.week)} public GitHub contributions in the 7 days to ${day(p.github.weekEnd)}.${p.github.streak >= 3 ? ` That's a ${p.github.streak}-day streak.` : ""}`,
      href: "/activity", cta: "See the activity",
    });
  }
  if (p.arcapush.indexed !== null) {
    lines.push({ text: `Arcapush, Mojeeb's flagship, is indexing ${count(p.arcapush.indexed)} builds right now.`, href: "/work/arcapush", cta: "How Arcapush works" });
  }
  if (p.npm30 !== null && p.npm30 > 0) {
    lines.push({ text: `Mojeeb's open-source tools were downloaded ${count(p.npm30)} times on npm in the last 30 days.`, href: "/profile#tools", cta: "Meet the tools" });
  }
  lines.push({ text: `There are ${p.projects} projects in the archive. The best ${p.caseStudies} have full case studies.`, href: "/work", cta: "Read the case studies" });
  if (!den) lines.push({ text: "Want to see all of it in one place? Step into the workshop on the homepage.", href: "/", cta: "Open the workshop" });
  else lines.push({ text: "Every glowing lantern up there is a note someone left in the guestbook.", href: "/guestbook", cta: "Light a lantern" });
  return lines;
}

/** A first line that fits where the visitor came from, or the time of day in Lagos. */
export function openerFor(referrer: string, ownHost: string, hour: number, time: string) {
  let host = "";
  try { host = referrer ? new URL(referrer).hostname.replace(/^www\./, "") : ""; } catch {}
  if (host && host !== ownHost.replace(/^www\./, "")) {
    if (/(^|\.)(x\.com|twitter\.com|t\.co)$/.test(host)) return "Came over from X? Welcome to Mojeeb's portfolio.";
    if (/linkedin\.com$/.test(host)) return "Hello from LinkedIn! Make yourself at home.";
    if (/github\.com$/.test(host)) return "A fellow GitHub dweller. Good to see you.";
    if (/arcapush\.com$/.test(host)) return "Back from Arcapush? That's Mojeeb's flagship.";
    if (/(google|bing|duckduckgo|perplexity|chatgpt|claude)\./.test(host)) return "Found your way here through search? Good instincts.";
  }
  if (hour >= 18 || hour < 6) return `It's ${time} in Lagos. I should be asleep, but hello.`;
  if (hour < 12) return "Good morning from Lagos.";
  if (hour < 17) return "Good afternoon from Lagos.";
  return "Good evening from Lagos.";
}
