export type DenStationId = "beacon" | "workbench" | "research" | "builds" | "guestbook" | "contact";
export type DenStation = {
  id: DenStationId; number: string; title: string; kicker: string; description: string;
  href: string; linkLabel: string; x: number; z: number; proof: string;
};
// Factual claims here describe a product's purpose, not synthetic user or performance metrics.
export const denStations: DenStation[] = [
  { id: "beacon", number: "01", title: "Discovery Beacon", kicker: "Arcapush",
    description: "A product discovery and distribution platform. Explore the registry of software, AI agents and hackathon builds.",
    href: "/work/arcapush", linkLabel: "Explore the Arcapush case study", x: -4.3, z: -2.55,
    proof: "Live product · discovery and distribution" },
  { id: "workbench", number: "02", title: "Engineering Workbench", kicker: "StackBrief",
    description: "Explore a real repository as a constellation. Inspect imports, dependents and the change blast radius.",
    href: "/lab/constellation", linkLabel: "Open the interactive code graph", x: 0, z: -3.48,
    proof: "Interactive demonstration · real repository graph" },
  { id: "research", number: "03", title: "Research Chamber", kicker: "Revel",
    description: "Research tools designed to turn difficult questions into structured, inspectable insights.",
    href: "/work/revel", linkLabel: "Explore the Revel case study", x: 4.3, z: -2.55,
    proof: "AI product engineering · case study" },
  { id: "builds", number: "04", title: "Wall of Builds", kicker: "Selected work",
    description: "A growing collection of studio products, experiments, developer tools and client engineering.",
    href: "/work", linkLabel: "See selected work", x: -4.3, z: 2.55,
    proof: "Selected projects · documented outcomes" },
  { id: "guestbook", number: "05", title: "Visitor Corner", kicker: "Guestbook",
    description: "The door is open to everyone. Leave a note and become part of the story. Messages appear after review.",
    href: "/guestbook", linkLabel: "Leave your mark in the guestbook", x: 0, z: 3.48,
    proof: "Community · moderated guestbook" },
  { id: "contact", number: "06", title: "Collaboration Door", kicker: "Work together",
    description: "Have something worth building? Tell me about the problem, the product and what success looks like.",
    href: "/contact", linkLabel: "Start a conversation", x: 4.3, z: 2.55,
    proof: "Available for selected work" },
];
