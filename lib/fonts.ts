import localFont from "next/font/local";

/** All faces are SIL Open Font License 1.1 — see app/fonts/LICENSES.md. */
export const hanken = localFont({
  src: "../app/fonts/hanken-grotesk-latin-wght-normal.woff2",
  variable: "--font-hanken",
  weight: "100 900",
  display: "swap",
  fallback: ["Helvetica Neue", "Arial", "sans-serif"],
  adjustFontFallback: "Arial",
});

export const instrument = localFont({
  src: "../app/fonts/instrument-serif-latin-400-italic.woff2",
  variable: "--font-instrument",
  weight: "400",
  style: "italic",
  display: "swap",
  fallback: ["Georgia", "serif"],
  preload: false,
});

export const plexMono = localFont({
  src: [
    { path: "../app/fonts/ibm-plex-mono-latin-400-normal.woff2", weight: "400" },
    { path: "../app/fonts/ibm-plex-mono-latin-500-normal.woff2", weight: "500" },
  ],
  variable: "--font-plex-mono",
  display: "swap",
  fallback: ["ui-monospace", "Menlo", "monospace"],
  preload: false,
});
