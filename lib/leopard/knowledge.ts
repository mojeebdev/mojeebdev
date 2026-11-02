import { daeto, milestones, principles } from "@/content/about";
import { caseStudies } from "@/content/caseStudies";
import { kindLabel, projects, statusLabel } from "@/content/projects";
import { contact, person, studio } from "@/content/site";
import { toolGroups } from "@/content/tools";
import type { LeopardAnswer } from "./types";

/**
 * What the leopard knows: only what this site already publishes. Used two ways:
 *  - `answerLocally` matches a question to a hand-written entry (no API key, no cost, always available);
 *  - `knowledgeText` is the reference material the AI model answers from when OPENROUTER_API_KEY is set.
 */

type Entry = { keys: string[]; text: string; href?: string };

const study = (slug: string) => caseStudies.find((c) => c.slug === slug);

const ENTRIES: Entry[] = [
  { keys: ["who is", "who's", "about mojeeb", "about you", "background", "bio", "introduce", "summary"], text: person.summary, href: "/about" },
  { keys: ["hire", "work with", "available", "availability", "freelance", "contract", "engagement", "collaborate", "project for me"], text: `${person.availability ?? "Mojeeb takes on selected work"}. Product engineering and strategy, personally or through BlindspotLab. The quickest route is the contact form or ${contact.personalEmail}.`, href: "/contact" },
  { keys: ["contact", "email", "reach", "message", "dm", "talk to"], text: `Email ${contact.personalEmail} (personal) or ${contact.workEmail} (studio), or use the contact form.`, href: "/contact" },
  { keys: ["where", "location", "based", "lagos", "nigeria", "live", "timezone"], text: `Mojeeb is based in ${person.location}, on West Africa Time (UTC+1).`, href: "/about" },
  { keys: ["blindspotlab", "studio", "company", "agency", "rc"], text: `${studio.legalName} (${studio.registration}) is the studio Mojeeb founded, incorporated in ${studio.country} on ${studio.incorporatedLabel}. It turns rough ideas into live products: strategy, design, engineering and automation.`, href: studio.url },
  { keys: ["arcapush", "flagship", "registry", "discovery", "distribution"], text: study("arcapush")?.dek ?? "", href: "/work/arcapush" },
  { keys: ["stackbrief", "architecture brief", "repository brief", "constellation", "code graph"], text: study("stackbrief")?.dek ?? "", href: "/work/stackbrief" },
  { keys: ["stylegraft", "design.md", "design system"], text: study("stylegraft")?.dek ?? "", href: "/work/stylegraft" },
  { keys: ["revel", "reveal index", "product strategist", "x402"], text: study("revel")?.dek ?? "", href: "/work/revel" },
  { keys: ["admon", "monad", "build record", "erc-721"], text: study("admon")?.dek ?? "", href: "/work/admon" },
  { keys: ["aitax", "robinhood", "prediction arcade", "client work", "client"], text: study("aitax")?.dek ?? "", href: "/work/aitax" },
  { keys: ["cli", "terminal", "mcp", "arcapush cli"], text: projects.find((p) => p.slug === "arcapush-cli")?.summary ?? "", href: "https://www.npmjs.com/package/@blindspotlab/arcapush" },
  { keys: ["open source", "npm", "package", "packages", "tools", "downloads"], text: "Mojeeb maintains three open-source npm packages: StackBrief, StyleGraft and the Arcapush CLI. Download figures on the homepage come live from npm.", href: "/#tools" },
  { keys: ["stack", "tech", "technology", "language", "languages", "framework", "use", "typescript", "next"], text: `The tools Mojeeb reaches for most. ${toolGroups.map((g) => `${g.label}: ${g.tools.slice(0, 4).map((t) => t.name).join(", ")}.`).join(" ")}`, href: "/activity" },
  { keys: ["daeto", "method", "process", "approach", "how do you work", "workflow"], text: `DAETO: ${daeto.map((d) => d.name).join(", ")}. Understand the problem before choosing the build, and improve from evidence rather than adding features.`, href: "/about#daeto" },
  { keys: ["principle", "philosophy", "believe", "values"], text: principles.map((p) => p.title).join(". ") + ".", href: "/about" },
  { keys: ["how many", "projects", "built", "portfolio", "archive", "shipped"], text: `${projects.length} projects are documented in the archive, ${caseStudies.length} with full case studies. Mojeeb's own records put the total shipped at 40+.`, href: "/projects" },
  { keys: ["guestbook", "lantern", "note", "sign"], text: "Leave a note in the guestbook. Once it's approved, it floats over the Den as a lantern.", href: "/guestbook" },
  { keys: ["den", "leopard", "mascot", "you", "your name", "cat"], text: "I'm the leopard who guards this Den. Mojeeb drew me as a layered SVG rig, and the workshop around me is Three.js. Everything I point at is real work.", href: "/den" },
  { keys: ["token", "$mojeeb", "coin", "crypto"], text: "There's a page about the $MOJEEB creator token, with its risks spelled out. I can't give financial advice.", href: "/token" },
  { keys: ["started", "history", "timeline", "journey", "when"], text: milestones.map((m) => `${m.date}: ${m.title}`).join(". ") + ".", href: "/about" },
  { keys: ["writing", "blog", "articles"], text: "Writing lives on the writing page.", href: "/writing" },
];

const FALLBACK: LeopardAnswer = {
  text: `I only know what's on this site, and that one stumped me. Try asking about Arcapush, StackBrief, how Mojeeb works, or hiring. Or write to ${contact.personalEmail}.`,
  href: "/contact",
  source: "site",
};

const normalise = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}$.\- ]+/gu, " ").replace(/\s+/g, " ").trim();

export function answerLocally(question: string): LeopardAnswer {
  const q = ` ${normalise(question)} `;
  // A project named outright wins, unless it has its own hand-written entry.
  const named = projects.find((p) => !p.caseStudy && p.slug !== "arcapush-cli" && (q.includes(` ${p.name.toLowerCase()} `) || q.includes(` ${p.slug} `)));
  if (named) return projectAnswer(named);
  let best: Entry | null = null, bestScore = 0;
  for (const e of ENTRIES) {
    let score = 0;
    for (const k of e.keys) if (q.includes(k.includes(" ") ? k : ` ${k} `) || (k.length > 4 && q.includes(k))) score += k.split(" ").length + (k.length > 5 ? 1 : 0);
    if (score > bestScore) { best = e; bestScore = score; }
  }
  if (best && best.text) return { text: best.text, href: best.href, source: "site" };
  return FALLBACK;
}

function projectAnswer(project: (typeof projects)[number]): LeopardAnswer {
  return {
    text: `${project.name}: ${project.summary} (${kindLabel[project.kind]}, ${statusLabel[project.status].toLowerCase()}, ${project.year}.)`,
    href: project.url ?? `/projects#${project.slug}`,
    source: "site",
  };
}

/** Site paths and external URLs the leopard may link to. Anything else the model suggests is dropped. */
export const allowedLinks = new Set<string>([
  "/", "/about", "/about#daeto", "/work", "/projects", "/activity", "/lab", "/lab/constellation", "/writing", "/now", "/guestbook", "/contact", "/den", "/token", "/#tools",
  ...caseStudies.map((c) => `/work/${c.slug}`),
  ...projects.flatMap((p) => [p.url, `/projects#${p.slug}`]).filter((u): u is string => Boolean(u)),
  studio.url,
]);

/** Plain-text reference material for the AI model. */
export function knowledgeText() {
  const studies = caseStudies.map((c) => [
    `### ${c.title} (${c.kindLabel}, ${c.statusLabel}, ${c.period}) — page: /work/${c.slug}`,
    c.dek,
    `Role: ${c.role}`,
    `Problem: ${c.problem}`,
    `Direction: ${c.direction}`,
    `Approach: ${c.approach.join(" ")}`,
    `Stack: ${c.stack.map((s) => `${s.layer}: ${s.items.join(", ")}`).join("; ")}`,
    `Outcome: ${c.outcome.join(" ")}`,
    `Links: ${c.links.map((l) => `${l.label} ${l.href}`).join(", ")}`,
  ].join("\n")).join("\n\n");
  const archive = projects.map((p) => `- ${p.name} (${kindLabel[p.kind]}, ${statusLabel[p.status]}, ${p.year}${p.url ? `, ${p.url}` : ""}): ${p.summary}${p.note ? ` Note: ${p.note}` : ""}`).join("\n");
  return [
    "## Identity",
    `${person.name}, ${person.role}. ${person.summary} Based in ${person.location}. ${person.availability ?? ""}`,
    `Studio: ${studio.legalName}, ${studio.registration}, incorporated in ${studio.country} on ${studio.incorporatedLabel}. ${studio.url}`,
    `Contact: ${contact.personalEmail} (personal), ${contact.workEmail} (studio), contact form at /contact. GitHub ${contact.github}.`,
    "",
    "## Method (DAETO)",
    daeto.map((d) => `${d.name}: ${d.body}`).join("\n"),
    "",
    "## Principles",
    principles.map((p) => `${p.title}: ${p.body}`).join("\n"),
    "",
    "## Milestones",
    milestones.map((m) => `${m.date} — ${m.title}: ${m.body}`).join("\n"),
    "",
    "## Tools used regularly",
    toolGroups.map((g) => `${g.label}: ${g.tools.map((t) => t.name).join(", ")}`).join("\n"),
    "",
    "## Case studies",
    studies,
    "",
    `## Project archive (${projects.length} projects; Mojeeb's own records count 40+ shipped)`,
    archive,
    "",
    "## Site paths",
    "/ (profile), /about, /about#daeto, /work, /projects, /activity, /lab, /lab/constellation, /writing, /now, /guestbook, /contact, /den (the interactive workshop), /token (the $MOJEEB creator token page, with risk disclosures)",
  ].join("\n");
}
