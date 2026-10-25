/** Identity, contact and navigation. Every value here is verified in docs/rebirth-audit.md §3. */
export const person = {
  name: "Mojeeb Titilayo",
  givenName: "Mojeeb",
  familyName: "Titilayo",
  role: "Product Engineer + Strategist",
  studioLine: "Founder of BlindspotLab. Creator of Arcapush.",
  headline: { lead: "I think in", accent: "products.", tail: "I build the systems behind them." },
  location: "Lagos, Nigeria",
  /** As stated on the live mojeeb.xyz hero (18 Oct 2026). Set to null to hide. */
  availability: "Available for selected work" as string | null,
  summary:
    "Product engineer and strategist. Founder of BlindspotLab and creator of Arcapush, the discovery and distribution registry for products, AI agents and hackathon builds. Also behind the open-source developer tools StackBrief, StyleGraft and the Arcapush CLI.",
};

/**
 * Portrait.
 * OFFICIAL: the cream-cap, crossed-arms photograph (1122×1402, grey background), committed by Mojeeb on
 *   2026-10-18 as public/portrait/mojeeb-official.png. next/image serves resized AVIF/WebP variants; the
 *   original is never retouched or regenerated. After changing the portrait, run `npm run og:assets`.
 * INTERIM: the 2026-10-15 profile avatar (460×460, grey background).
 */
const USE_OFFICIAL_PORTRAIT = true;

const official = {
  src: "/portrait/mojeeb-official.png",
  width: 1122,
  height: 1402,
  /** circular crop: centre on face, keep the cream cap inside the circle */
  circle: { focal: "50% 30%", zoom: 1.75 },
  /** full composition (crossed arms) for /about */
  full: { focal: "50% 40%" },
  alt: "Mojeeb Titilayo in a cream cap and light-blue shirt, arms crossed, smiling against a plain grey background",
};

const interim = {
  src: "/portrait/mojeeb-portrait.png",
  width: 460,
  height: 460,
  circle: { focal: "50% 38%", zoom: 1.12 },
  full: { focal: "50% 40%" },
  alt: "Mojeeb Titilayo, smiling, photographed against a plain grey background",
};

export const portrait = USE_OFFICIAL_PORTRAIT ? official : interim;

export const studio = {
  name: "BlindspotLab",
  legalName: "BlindspotLab Limited",
  url: "https://blindspotlab.xyz",
  registration: "RC 9855946",
  incorporated: "2026-09-14",
  incorporatedLabel: "14 September 2026",
  country: "Nigeria",
};

export const contact = {
  personalEmail: "hello@mojeeb.xyz",
  workEmail: "mojeeb@blindspotlab.xyz",
  github: "https://github.com/mojeebdev",
  githubHandle: "mojeebdev",
  x: "https://x.com/MojeebMotion",
  xHandle: "@MojeebMotion",
  linkedin: "https://www.linkedin.com/in/tmojeeb",
  studio: "https://blindspotlab.xyz",
};

/** Hero attribution: founder/creator line, then the published developer tools (linked to npm). */
export const founderOf = { name: "BlindspotLab", href: "https://blindspotlab.xyz" } as const;
export const creatorOfProduct = { name: "Arcapush", href: "https://arcapush.com" } as const;
export const alsoBehind = [
  { name: "StackBrief", href: "https://www.npmjs.com/package/@blindspotlab/stackbrief" },
  { name: "StyleGraft", href: "https://www.npmjs.com/package/@blindspotlab/stylegraft" },
  { name: "the Arcapush CLI", href: "https://www.npmjs.com/package/@blindspotlab/arcapush" },
] as const;

export const nav = [
  { href: "/", label: "Profile" },
  { href: "/den", label: "The Den" },
  { href: "/work", label: "Work" },
  { href: "/activity", label: "Activity" },
  { href: "/lab", label: "Lab" },
  { href: "/writing", label: "Writing" },
  { href: "/guestbook", label: "Guestbook" },
  { href: "/contact", label: "Contact" },
] as const;

export const secondaryNav = [
  { href: "/about", label: "About" },
  { href: "/projects", label: "All projects" },
  { href: "/now", label: "Now" },
] as const;
