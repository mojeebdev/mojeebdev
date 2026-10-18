export type SourceType = "live-api" | "repository-snapshot" | "founder-reported";

/** Every number shown on the site carries this provenance (DESIGN.md §10, metric cell). */
export type Metric = {
  key: string;
  label: string;
  value: number | string | null;
  display: string;
  definition: string;
  source: string;
  sourceUrl?: string;
  sourceType: SourceType;
  window: string;
  /** ISO timestamp of when the value was fetched or snapshotted */
  asOf: string | null;
  status: "ok" | "unavailable";
};

export const formatCount = (n: number) => new Intl.NumberFormat("en-GB").format(n);
export const formatCompact = (n: number) =>
  n >= 10_000 ? new Intl.NumberFormat("en-GB", { notation: "compact", maximumFractionDigits: 1 }).format(n) : formatCount(n);
