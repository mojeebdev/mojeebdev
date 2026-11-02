/** Live facts the leopard can say. Every value comes from a source the site already publishes with a definition. */
export type Pulse = {
  github: {
    /** Public contributions in the last seven days of the profile calendar (profile/stats.json). */
    week: number;
    /** Last day of the calendar snapshot, YYYY-MM-DD. */
    weekEnd: string | null;
    /** Current run of days with at least one public contribution. */
    streak: number;
  };
  arcapush: { indexed: number | null; visits: number | null };
  /** Combined npm downloads of the three flagship packages over npm's rolling 30 days. */
  npm30: number | null;
  /** Projects in the archive (content/projects.ts). */
  projects: number;
  caseStudies: number;
};

export type LeopardLine = { text: string; href?: string; cta?: string };
export type LeopardAnswer = { text: string; href?: string; source: "claude" | "site" };
