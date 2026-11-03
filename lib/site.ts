export const BASE_URL = "https://mojeeb.xyz";
export const SITE_EMAIL = "hello@mojeeb.xyz";

const WORDS = ["Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve"];
/** "Eight" for 8, so counts in copy come from the records instead of being typed by hand. */
export const countWord = (n: number) => WORDS[n] ?? String(n);
