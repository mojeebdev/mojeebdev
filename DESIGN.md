---
name: "mojeeb.xyz Design System"
product: "mojeeb.xyz, personal portfolio of Mojeeb Titilayo"
source: "Adapted from three user-supplied screenshots (A: centred developer profile, B: blue activity heatmap, C: Swiss editorial profile) and a supplied mascot character sheet"
status: "draft"
confidence: "high"
generated_by: "StyleGraft method (skills/stylegraft, design-md-schema), applied manually"
---

> **Evidence note.** The reference screenshots arrived mid-build (2026-10-18). Observations are marked *(observed)*; anything I chose for this product is marked *(selected)*. The mascot rules come directly from the supplied character sheet *(observed)*.
>
> **Reference read (observed):**
> - **A.** A large centred circular portrait (about 200 px), a semibold name (about 44 px) with a grey handle below, and generous white space. The stat strip is one rounded container (radius about 24 px) with five equal cells split by vertical hairlines; each cell has a regular-weight value above a grey label. Below it, a "Showcase" heading sits over a soft grey, heavily rounded panel.
> - **B.** A token-activity heatmap of rounded-square cells (about 30% radius), a light-grey empty state and an azure-to-navy blue ramp. Text-only view tabs (Daily · Weekly · Cumulative) sit top-right, with the active tab in darker ink, and month labels sit below. "Top plugins" are full-colour brand icons in white rounded-square tiles with hairline borders. "Insights" are label-left (grey) / value-right rows.
> - **C.** A tiny-type (about 13 px) left nav (Home / Explore / Profile) with a ▸ marker on the active item and grey helper text beneath. The centre column is framed by vertical hairlines and holds a small avatar, name, role and link lines, then tabs. Content is laid out as a definition list: a grey label column (Projects, Now, Previously) beside a content column with small thumbnails and long-form text.

## 1. Product context
- **Purpose:** prove, within one screen, who Mojeeb is and what he builds, then let people dig into evidence: tools, case studies, activity.
- **Audiences:** recruiters and founders (who want to evaluate fast), designers and developers (who appreciate the craft and share it), and clients (who need to know how to hire him).
- **Primary actions:** *Explore my work*, *Work with me*, *GitHub*.
- **Trust requirement:** high. Every number carries its definition, source, window and timestamp.
- **Emotional target:** calm and confident at rest, delightful in interaction, personal through the portrait and the leopard.

## 2. Translation summary
| Reference principle | Decision | Expression on mojeeb.xyz |
|---|---|---|
| A: centred profile, circular portrait *(observed)* | Preserve | The hero centres the round portrait, name, role and headline in the content column |
| A: semibold name, regular values, grey secondary text *(observed)* | Preserve | Name in Hanken Grotesk 600; headline in 300 for contrast; values in 400 |
| A: rounded stat strip, value above label *(observed)* | Preserve | A single 24 px-radius container with vertical hairlines; value above a grey label; each cell opens its source definition |
| A: spacious showcase *(observed)* | Adapt | Generous section spacing; showcase cards use real diagrams, not decoration |
| B: rounded-cell blue heatmap, Daily / Weekly / Cumulative tabs *(observed)* | Preserve | GitHub contribution heatmap with rounded cells, an azure-to-navy ramp and the same three text tabs |
| B: full-colour icons in white rounded tiles *(observed)* | Preserve | Brand-colour tool icons in hairline tiles, grouped by layer (Build / Data & infra / AI / Onchain / Workbench) |
| B: minimal analytical insights *(observed)* | Preserve | Two or three plain-language insights computed from the data, never invented |
| C: tiny left nav with ▸ active marker and helper text *(observed)* | Preserve | Fixed 240 px sidebar in 14 px type, ▸ marker on the active item, grey helper line; top bar plus sheet on mobile |
| C: centre column framed by hairlines; label / content rows *(observed)* | Adapt | Content column with vertical hairlines on wide screens; definition-list rows (grey label column) on /about, /now and project info |
| C: monochrome palette, quiet type *(observed)* | Preserve | Charcoal, cool grey and off-white; blue is the only accent |
| C: project imagery *(observed)* | Adapt | Technical visuals drawn from the source code plus product OG art |
| C: long-form professional history *(observed)* | Preserve | `/about` and case studies use a long-form editorial measure (68ch) |
| Any reference brand assets or layouts | Exclude | No copied logos, copy or exact compositions |

## 3. Design intent
**North star:** *Minimal at rest. Extraordinary in interaction. Credible in evidence. Personal in character.*
1. **Identity first.** Mojeeb's face and name lead. BlindspotLab is the studio he founded, never the headline.
2. **Evidence beats adjectives.** Prefer a live number with its source to a sentence of praise.
3. **One accent.** Electric blue marks interaction, data and focus. Nothing else is coloured, except the mascot.
4. **Motion reveals, never decorates.** Every animation either explains state or rewards curiosity.
5. **The leopard is a guest, not a theme.** It appears at a handful of deliberate moments.

## 4. Colour system (selected values)
| Token | Light | Dark | Role |
|---|---|---|---|
| `--bg` | `#FAFAF8` | `#0E0F11` | Page |
| `--surface` | `#FFFFFF` | `#15171A` | Raised panels |
| `--surface-2` | `#F2F3F4` | `#1C1F23` | Wells, code, hover |
| `--ink` | `#16171A` | `#ECEDEF` | Primary text (≈17:1 / 16:1) |
| `--ink-2` | `#4A4E56` | `#A9AEB6` | Secondary text (≈8:1 / 8:1) |
| `--ink-3` | `#5F646D` | `#868B94` | Meta text (≈5.8:1 on bg, ≥4.9:1 on surface-2 / 5.2:1) |
| `--line` | `#E4E5E8` | `#25282D` | Hairlines |
| `--line-strong` | `#CDD0D5` | `#363A40` | Control borders |
| `--blue` | `#1F66E0` | `#6EA8FF` | Accent, links, focus (≈5.4:1 / 7.6:1); azure family taken from reference B *(selected for contrast)* |
| `--heat-0…4` | `#EFF1F3 #CDE3FF #7DB8FF #2E86FF #0B4C9A` | `#1A1D22 #12305C #1B5BB8 #3D8DFF #A8D0FF` | Heatmap ramp (follows reference B) |

- **Usage ratio:** about 90% neutrals, 8% ink, at most 2% blue.
- Mascot colours (from the sheet, *observed*): fur `#F5C66B`, fur light `#FBEBD3`, fur shadow `#E0A653`, spots `#4A2A16`, nose `#E9727C`, ear `#F3A383`, outline `#111111`. They appear **only** inside mascot artwork.
- **Contrast cautions:** `--ink-3` is never used below 14 px. Blue text on `--surface-2` is checked at 6.0:1 or better.

## 5. Typography
| Role | Face | Spec |
|---|---|---|
| Name | Hanken Grotesk (OFL, variable) | 600, `clamp(2rem, 4vw, 2.75rem)`, tracking −0.025em (reference A) |
| Display | Hanken Grotesk | 300, `clamp(1.6rem, 3vw, 2.25rem)` headline under the name |
| Accent | Instrument Serif Italic (OFL) | One phrase per view at most: "products", "systems" |
| Heading | Hanken Grotesk | 500, h2 1.75rem / h3 1.25rem, tracking −0.02em |
| Body | Hanken Grotesk | 400, 1rem / 1.65, measure 68ch |
| Metric values | Hanken Grotesk | 400, 1.5rem, tabular numbers (reference A) |
| Data and labels | IBM Plex Mono (OFL) | 400–500, 0.6875–0.8125rem, for code, timestamps and source notes only |

- Fonts are self-hosted from `app/fonts` through `next/font/local`, with `display: swap` and metric-matched fallbacks.
- The commercial Freight Display Pro is removed because no licence is on file.

## 6. Layout and rhythm
- **Desktop (≥1024 px):** a fixed 240 px sidebar, then a content column of at most 960 px centred in the remaining space. Long-form text is capped at 68ch.
- **Spacing scale:** 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 128. Sections are separated by 96 px on desktop and 64 px on mobile, plus a hairline and a mono section label (`01 / Tools`).
- **Grid:** 12 columns, 24 px gutters. Cards span 6 or 4 columns. The metric strip has 4 equal cells on desktop and 2×N on mobile.
- **Controlled break:** the heatmap and the lab canvases may run edge to edge within the content column.

## 7. Composition grammar
- Each section is: mono label → short heading → one-line dek → evidence.
- The hero is **centred**. Everything after it is **left-aligned**, which preserves the tension between reference A and reference C.
- Case studies are numbered sections (Problem → Direction → Role → Approach → Stack → Decisions → Visual → Outcome → Status), with a sticky mini-index on desktop.
- Variation comes from content type (table, heatmap, diagram, quote) rather than decorative backgrounds.

## 8. Imagery and art direction
- **Portrait:** natural, un-retouched, on its original grey background.
  - Circular crop in the hero, focal point on the face and cap.
  - Full composition, including crossed arms, on `/about`.
  - Served as AVIF/WebP via `next/image`.
- **Product visuals:** technical diagrams drawn as SVG from the actual source (routes, cascades, contracts), plus the product's own OG art. No stock photos.
- **Prohibited:** generic 3D blobs, AI-generated "tech" imagery, any third-party mascot.

## 9. Shape and material
- 1 px hairlines. Radii: 6 px for controls, 12 px for panels, full circles for the portrait and avatar dots.
- Shadows only on floating layers (menu sheet, tooltip): `0 8px 24px rgb(0 0 0 / .08)`.
- Grain: a 2% noise texture on the intro canvas only.

## 10. Components
- **Navigation:**
  - Sidebar: name, role, 7 items (Profile, Work, Activity, Lab, Writing, Guestbook, Contact), theme toggle, socials.
  - Active item gets a blue 2 px bar. The mobile sheet uses the same items.
- **Button:**
  - Primary: ink fill, bg text.
  - Secondary: hairline.
  - Tertiary: text link with an arrow.
  - Minimum height 44 px. Focus ring is 2 px blue with a 3 px offset.
- **Metric cell:** value (mono, tabular), label, and a source button that opens a popover with definition, source, window and updated time.
- **Package card:** logo, name, positioning, version, downloads (7d / 30d / total), copyable install command, repo and npm links, updated stamp. All-time downloads are the headline figure on each card. The package with the most verified all-time downloads gets a "Most downloaded" chip; the leader is computed, never hard-coded.
- **Case-study card:** number, kind badge (Studio / Open source / Client / Hackathon / Experiment), status dot, title, dek, diagram thumbnail.
- **Archive table:** filter chips plus search. Columns: name, kind, status, year, stack.
- **Heatmap:** SVG cells with roving-tabindex keyboard navigation and range selection.
- **Guestbook:** form (name, message, optional link), list, reactions.
- **Mascot:** `<Leopard pose expression size>`, with poses idle, walk, sit, look, reach, rest and peek, and expressions happy, curious and playful.

States: default, hover (surface-2), active, focus-visible, disabled (40% opacity), loading (skeleton at fixed height), error (plain text plus retry), empty (helpful sentence plus action).

## 11. Responsive behaviour
- **≥1280:** sidebar plus content, with a mini-index on case studies.
- **1024–1279:** sidebar plus content, no mini-index.
- **<1024:** top bar (name, menu button), then a full-screen sheet. Metric strip becomes a 2-column grid. Package cards stack. Heatmap scrolls horizontally inside its frame, starting at the latest week.
- **<480:** portrait 112 px, display 2.4rem, CTAs stacked full-width.

## 12. Motion and interaction
- **Durations:** 120 ms for UI, 240 ms for reveals, up to 700 ms for the intro transition. Easing is `cubic-bezier(.2,.7,0,1)`.
- **Properties:** transform and opacity only, plus `clip-path` for the intro reveal.
- Scroll reveals are 8 px rises, applied once.
- The intro (*Enter the Den*) takes under 5 s after the first interaction, is skippable at all times, is remembered for returning visitors, and is replaced by a static scene under `prefers-reduced-motion`.
- The mascot elsewhere is idle by default and reacts only to direct hover, focus or events.

## 13. Accessibility
- WCAG 2.2 AA contrast, as verified in §4.
- Visible focus everywhere. Skip link. Landmarks in this order: nav, main, footer.
- All targets are at least 44 px. Body text is at least 16 px; meta text at least 12 px mono.
- The heatmap exposes an equivalent data table. The intro is a modal dialog with a skip button focused first.
- Alt text describes people and content, not decoration. Purely decorative mascot art is `aria-hidden`.

## 14. Anti-slop constraints
1. No gradients, glows or floating blobs behind the hero.
2. No animated counters that tick up to unverified numbers.
3. No grid of identical rounded cards with emoji icons.
4. No "Hi, I'm …" with a waving hand, and no "passionate about" copy.
5. No logos of companies Mojeeb hasn't worked with, and no fake testimonials.
6. No 3D object on any route other than the intro.
7. No more than one serif accent per view.
8. No mascot on more than one element per page, outside the intro.

## 15. Do / Don't
- **Do** write "873 downloads · last 30 days · npm". **Don't** write "Hundreds of happy developers".
- **Do** label AITAX "Client engineering · pre-release". **Don't** imply it is live or owned.
- **Do** show the leopard napping in the footer. **Don't** put it in every card.
- **Do** show a clear "unavailable" state. **Don't** fall back to stale numbers without saying so.

## 16. Implementation guidance
- Tokens live in `app/styles/tokens.css` as CSS custom properties, switched by `[data-theme]` and `prefers-color-scheme`.
- Components live in `components/` (server by default). Client islands: theme toggle, mobile nav, metric popover, copy button, archive filter, heatmap, guestbook form, intro, lab canvas.
- Server data: `lib/data/*` fetchers with `next.revalidate` and typed `Metric` results `{ value, label, definition, source, window, fetchedAt, status }`.
- Three.js is imported dynamically by the intro only.

## 17. Uncertain decisions
- Reference screenshots are missing, so the exact spacing, stat-strip proportions and sidebar density are inferred.
- The mascot is a vector redraw from the character sheet and awaits Mojeeb's approval or source artwork.
- The new portrait was not received. The pipeline is ready; the current avatar is in place until it arrives.
- Availability status is not shown until confirmed.
