import { siChainlink, siClaude, siCloudflareworkers, siEthereum, siGit, siGithub, siGithubactions, siGooglegemini, siNeon, siNextdotjs, siNodedotjs, siNpm, siOpenrouter, siPolygon, siPostgresql, siPrisma, siReact, siSolidity, siSupabase, siTailwindcss, siTypescript, siUpstash, siVercel, siVite, siWagmi } from "simple-icons";

/** Flagship open-source packages. Versions and downloads are fetched live (lib/data/npm.ts). */
export const flagshipPackages = [
  {
    pkg: "@blindspotlab/stackbrief" as const,
    name: "StackBrief",
    positioning: "An open-source, local-first CLI for understanding a repository's architecture before changing code.",
    repo: "https://github.com/mojeebdev/stackbrief",
    site: "https://stackbrief.peerfix.dev",
    install: "npx @blindspotlab/stackbrief scan",
    logo: "/logos/stackbrief-logo.svg",
    caseStudy: "/work/stackbrief",
  },
  {
    pkg: "@blindspotlab/stylegraft" as const,
    name: "StyleGraft",
    positioning: "An open-source design-system skill for ChatGPT and Codex that turns visual references into product-specific design systems.",
    repo: "https://github.com/mojeebdev/StyleGraft",
    site: "https://stylegraft.peerfix.dev",
    install: "npx @blindspotlab/stylegraft install",
    logo: "/logos/stylegraft-logo.svg",
    caseStudy: "/work/stylegraft",
  },
  {
    pkg: "@blindspotlab/arcapush" as const,
    name: "Arcapush CLI",
    positioning: "A CLI and agent-friendly MCP workflow for submitting and managing listings on Arcapush.",
    repo: "https://github.com/mojeebdev/arcapush-cli",
    site: "https://arcapush.com/docs",
    install: "npx --yes @blindspotlab/arcapush@latest",
    logo: "/logos/arcapush-mark.svg",
    caseStudy: "/work/arcapush",
  },
];

export type ToolIcon = { name: string; path?: string; hex?: string; monogram?: string };
const i = (icon: { title: string; path: string; hex: string }): ToolIcon => ({ name: icon.title, path: icon.path, hex: icon.hex });

/**
 * Technologies that appear repeatedly across Mojeeb's repositories (stacks in content/projects.ts).
 * Icons: simple-icons (CC0). Where no icon exists, a monogram tile is used.
 */
export const toolGroups: { label: string; tools: ToolIcon[] }[] = [
  { label: "Build", tools: [i(siTypescript), i(siNextdotjs), i(siReact), i(siNodedotjs), i(siTailwindcss), i(siVite)] },
  { label: "Data & infra", tools: [i(siCloudflareworkers), i(siVercel), i(siSupabase), i(siPostgresql), i(siPrisma), i(siNeon), i(siUpstash)] },
  { label: "AI", tools: [i(siClaude), i(siGooglegemini), i(siOpenrouter), { name: "Groq", monogram: "Gq" }, { name: "Model Context Protocol", monogram: "MCP" }] },
  { label: "Onchain", tools: [i(siSolidity), i(siEthereum), i(siWagmi), i(siChainlink), i(siPolygon)] },
  { label: "Workbench", tools: [{ name: "VS Code", monogram: "VS" }, i(siGithub), i(siGithubactions), i(siGit), i(siNpm)] },
];
