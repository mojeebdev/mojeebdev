/** Verified milestones only. Dates come from repositories, npm and the CAC record (docs/rebirth-audit.md). */
export const milestones = [
  { date: "Feb 2026", title: "Started Arcapush", body: "First commit on 16 Feb 2026. It has since become the discovery and distribution registry I maintain today.", href: "/work/arcapush" },
  { date: "Apr 2026", title: "PeerFix and CommitCar", body: "A builder marketplace with USDC escrow on Base, and the GitHub-to-car experiment that later became Admon.", href: "/projects#peerfix" },
  { date: "Jul 2026", title: "StackBrief, Revel and Admon", body: "StackBrief v1 on npm (OpenAI Build Week), Revel's agent and payment stack, and Admon's contracts on Monad Mainnet.", href: "/work/stackbrief" },
  { date: "Aug 2026", title: "StyleGraft and the Arcapush CLI", body: "Two more open-source npm packages: design systems from visual references, and terminal and MCP submission for Arcapush.", href: "/work/stylegraft" },
  { date: "Sep 2026", title: "BlindspotLab Limited incorporated", body: "Incorporated in Nigeria on 14 Sep 2026 (RC 9855946). The same month: AITAX client engineering, Outship and Ratssacre.", href: "https://blindspotlab.xyz" },
  { date: "Oct 2026", title: "Arcapush CLI 0.2.4", body: "Guided terminal onboarding and MCP configuration, released 8 Oct 2026.", href: "https://www.npmjs.com/package/@blindspotlab/arcapush" },
];

export const principles = [
  { title: "Understand before changing", body: "Most bad changes come from an incomplete picture of the system. I trace the real architecture first; StackBrief exists because of this habit." },
  { title: "Improve before rebuilding", body: "A rebuild brings new risks. I ask what must stay untouched and whether a focused fix solves the actual problem." },
  { title: "Evidence over adjectives", body: "Numbers ship with their definitions. Products should be able to show what they did, not just claim it." },
  { title: "AI as leverage, not judgement", body: "Your input shapes the output. I treat prompts, evals and quality gates as engineering, and I credit them as such." },
];

export const daeto = [
  { letter: "D", name: "Discovery", body: "The problem, the people, the context and the real constraints." },
  { letter: "A", name: "Approach", body: "Direction, positioning, architecture and the execution path." },
  { letter: "E", name: "Execution", body: "The smallest strong version, built with clear priorities and disciplined scope." },
  { letter: "T", name: "Tracking", body: "What is working, what is failing, and what users actually do." },
  { letter: "O", name: "Optimisation", body: "Improvement from evidence, not assumptions or random feature additions." },
];

/** Anthropic Academy certificates, each verifiable (source: blindspotlab/data/certifications.ts). */
export const certificates = [
  { name: "Claude 101", url: "https://verify.skilljar.com/c/k3hn2g58cway" },
  { name: "Claude Code 101", url: "https://verify.skilljar.com/c/wensq6sctwjz" },
  { name: "Claude Code in Action", url: "https://verify.skilljar.com/c/brm3qw44eyk4" },
  { name: "Building with the Claude API", url: "https://verify.skilljar.com/c/a8w8mb5daeq8" },
  { name: "Introduction to Model Context Protocol", url: "https://verify.skilljar.com/c/3gks8s488u94" },
  { name: "Model Context Protocol: Advanced Topics", url: "https://verify.skilljar.com/c/ykxqffqedeku" },
  { name: "Introduction to Agent Skills", url: "https://verify.skilljar.com/c/ertfda5n9c5q" },
  { name: "Introduction to Subagents", url: "https://verify.skilljar.com/c/jm9cyk2wzbov" },
  { name: "AI Fluency: Framework & Foundations", url: "https://verify.skilljar.com/c/hhsgtv8stwzy" },
  { name: "AI Capabilities and Limitations", url: "https://verify.skilljar.com/c/srcpwo9j8wqw" },
  { name: "Introduction to Claude Cowork", url: "https://verify.skilljar.com/c/8miyxz95p4hj" },
];
