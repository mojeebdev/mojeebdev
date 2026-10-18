import stats from "@/profile/stats.json";
import type { Metric } from "./types";
import { formatCount } from "./types";

/**
 * Public GitHub contribution calendar, taken from profile/stats.json. The profile-update workflow refreshes it weekly
 * with GitHub's built-in Actions token (see profile/MAINTENANCE.md). Counts are what GitHub shows publicly on the
 * profile; nothing is inferred from private repository content.
 */
export type Day = { date: string; count: number };

type Raw = { contributionsCollection: { contributionCalendar: { totalContributions: number; weeks: { contributionDays: { date: string; contributionCount: number }[] }[] } }; repositories: { totalCount: number } };
const raw = stats as unknown as Raw;

export const calendarDays: Day[] = raw.contributionsCollection.contributionCalendar.weeks
  .flatMap((w) => w.contributionDays)
  .map((d) => ({ date: d.date, count: d.contributionCount }));

export const publicRepos = raw.repositories.totalCount;
export const totalContributions = raw.contributionsCollection.contributionCalendar.totalContributions;
export const calendarStart = calendarDays[0]?.date ?? null;
export const calendarEnd = calendarDays[calendarDays.length - 1]?.date ?? null;

export function streaks(days: Day[]) {
  let longest = 0, run = 0;
  for (const d of days) { run = d.count > 0 ? run + 1 : 0; longest = Math.max(longest, run); }
  let current = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].count > 0) current++;
    else if (i === days.length - 1) continue; // today may not have activity yet
    else break;
  }
  return { longest, current, activeDays: days.filter((d) => d.count > 0).length };
}

export function busiest(days: Day[]) {
  const byWeekday = Array.from({ length: 7 }, () => 0);
  let top = days[0];
  for (const d of days) { byWeekday[new Date(`${d.date}T00:00:00Z`).getUTCDay()] += d.count; if (d.count > top.count) top = d; }
  const names = ["Sundays", "Mondays", "Tuesdays", "Wednesdays", "Thursdays", "Fridays", "Saturdays"];
  return { weekday: names[byWeekday.indexOf(Math.max(...byWeekday))], topDay: top };
}

export function githubMetric(): Metric {
  return {
    key: "github-contributions",
    label: "Public GitHub contributions",
    value: totalContributions,
    display: formatCount(totalContributions),
    definition: "Contributions on GitHub's public profile calendar for @mojeebdev, as visible to GitHub's Actions token. Private activity may be excluded.",
    source: "GitHub GraphQL contribution calendar (profile/stats.json)",
    sourceUrl: "https://github.com/mojeebdev",
    sourceType: "repository-snapshot",
    window: `${calendarStart} → ${calendarEnd}`,
    asOf: calendarEnd ? `${calendarEnd}T00:00:00Z` : null,
    status: "ok",
  };
}
