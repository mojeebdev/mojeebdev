/** Lagos is on West Africa Time (UTC+1) all year; there is no daylight saving. */
const OFFSET_HOURS = 1;

export const lagosHour = (now: Date = new Date()) => (now.getUTCHours() + OFFSET_HOURS) % 24;

/** Night in the Den runs from 8pm to 6am Lagos time. */
export const isLagosNight = (now: Date = new Date()) => {
  const h = lagosHour(now);
  return h >= 20 || h < 6;
};

export const lagosTimeLabel = (now: Date = new Date()) =>
  new Intl.DateTimeFormat("en-GB", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: "Africa/Lagos" }).format(now).replace(" ", "");
