# The Leopard's Den — creative and implementation brief

Date: 25 October 2026
Route: /den
Status: first interactive release, ready for real-device visual QA
Owner: Mojeeb Titilayo

## Product intent

A cinematic miniature atelier guided by the existing 2.5D SVG leopard. Visitors can orbit, pan, zoom and focus handcrafted physical stations, each linking to a real project, experiment, guestbook or contact page. The studio's work, not empty 3D decoration, is the reason to explore.

Objectives: (1) memorable identity, (2) demonstrable engineering ability, (3) visits to real case studies, (4) qualified enquiries, (5) shareable 12-second walkthrough. Do not invent testimonials, visitor counts or impact metrics.

## Creative direction

"Midnight Atelier": dark-ink architecture, warm paper, signal blue and leopard gold. Materials should be tactile, slightly rough, miniature, and deliberately restrained. Avoid generic neon, excessive glass, continual motion, and science-fiction clichés.

- Environment: one island platform, six stations, a central leopard dais.
- Typography: existing Hanken Grotesk, Instrument Serif and IBM Plex Mono.
- Character: keep the existing SVG rig, outlines, rosettes, cream bib and expressive eyes. A 2.5D projection is preferred over an unnecessary new 3D rig.
- Camera: orthographic, three-quarter view. Pointer drag to orbit; right drag or two-finger pan; wheel/pinch zoom; click to focus; Reset restores overview.
- Interface: semantic React/HTML overlay. The stations and controls must remain keyboard-operable.

## Stage composition / storyboard

1. **Arrival / close-up.** A solitary leopard greets the visitor in a dark atelier. Headline: "High five the leopard." Two immediate choices: high five or skip.
2. **Reveal / world.** The foreground fades to disclose a single architectural island. The leopard sits on the central dais. Six objects are visibly arranged in a ring around it. The first impression should have large dark negative space and a focused gold accent.
3. **Overview / free exploration.** A quiet floating caption says "Welcome to my world." An optional guided tour exists, but drag, touch and station selection are primary. No WASD movement.
4. **Discovery / focus.** Selecting an object eases the camera to it and opens a compact explanatory panel with its real purpose, proof type and direct link. No dead-end generic 3D animation.
5. **Visitor corner / connection.** Guestbook is moderated through the existing route; do not reimplement its data store. Collaboration Door links to the real contact form.
6. **Exit.** Portfolio, projects, guestbook and contact are always one click away.

## Spatial layout

Approximate world coordinates on a single 13.4 × 10.75 unit island:

| Node | X | Z | Object |
| --- | ---: | ---: | --- |
| Leopard dais | 0 | 0 | Gold-edged central plinth, SVG character projected above |
| Discovery Beacon | -4.3 | -2.55 | Cylindrical illuminated tower and satellite points |
| Engineering Workbench | 0 | -3.48 | Miniature table and code blocks |
| Research Chamber | 4.3 | -2.55 | Concentric analytic rings and blue sphere |
| Wall of Builds | -4.3 | 2.55 | Product tiles on a display wall |
| Visitor Corner | 0 | 3.48 | Table with small paper notes |
| Collaboration Door | 4.3 | 2.55 | Warm-lit architectural doorway |

For the next art pass, improve silhouettes and geometry but preserve the coordinates, navigation semantics and evidence links.

## Motion specification

- Intro: 700ms transition, after deliberate "high five" action; skip is immediate.
- Camera: smooth interpolation approximately 0.6–1.2 seconds; manual orbit/pan cancels an in-progress camera focus.
- Character: existing rig reacts with a happy pose on selection. Preserve idle animations from mascot CSS.
- Scene detail: restrained movement on floating stations; no autoplay music, no loud particles.
- Reduced motion: suppress CSS motion and reduce or disable decorative world motion. Existing text-based navigation must always work.
- Visibility: pause rendering on background tabs; cap pixel ratio, maintain manageable geometry.

## Route and technical ownership

- app/den/page.tsx: metadata and route.
- components/den/DenExperience.tsx: UI, intro, selected station panel, accessible station directory and scene lifecycle.
- components/den/denWorldScene.ts: lazy-loaded Three.js renderer, geometry, lighting, controls, raycasting, projection and disposal.
- components/den/denStations.ts: content and coordinates for the six stations.
- components/den/den-experience.css: route-scoped responsive visual language.
- content/site.ts: primary navigation entry.
- components/home/Hero.tsx: clear invitation from the professional homepage.

Continue to reuse /work, /lab/constellation, /guestbook and /contact. Maintain the existing Cloudflare setup and D1. Do not add analytics scripts, trackers, paid services, secrets, or new infrastructure by default.

## QA and shipping checklist

Must verify on real deployment before calling polished:
- [ ] npm run typecheck and npm run build (Vinext and standard Next builds as needed)
- [ ] Intro button, skip, second visit, and replay
- [ ] Keyboard access: station directory, controls, focus states, links, Escape behavior where applicable
- [ ] Mouse: orbit, pan, zoom, station hitboxes, reset
- [ ] Touch: single-finger orbit, two-finger pan/pinch zoom, labels and controls
- [ ] Mobile layout at 320, 375, 430, 768px and desktop 1366px
- [ ] Reduced motion, background-tab pause, WebGL-disabled fallback
- [ ] All six project destinations, including live case studies
- [ ] No overlap between scene labels and mobile detail panel
- [ ] No regression in home SEO, guestbook moderation, original intro or contact
- [ ] Production deployment successful; network JS, rendering and runtime verified

## Next visual polish

The first release deliberately uses procedural low-poly primitives, no external images or massive models. Subsequent art passes may add custom hand-crafted textures, the exact approved leopard artwork and better environmental details. Validate the first interaction and conversion path before creating a giant 3D game.

## Launch recording

0–2s leopard raises paw; 2–4s high-five; 4–7s reveal miniature workshop; 7–10s click the Engineering Workbench; 10–12s show the real StackBrief constellation and portfolio URL. Record the true application, not a composited fake interaction.

## Acceptance

The immersive experience is additive, not the default interface. The main homepage remains fast and crawlable. Exit and direct navigation always work. The six stations must present true, useful content, not marketing filler.

## Living Den (layers 1 and 2)

The leopard and the Den now run on live, sourced data. Nothing is invented: a figure whose source doesn't respond is left out.

**The leopard talks** (`components/leopard/`, `lib/leopard/`)
- Homepage: after the intro, the leopard peeks in from the bottom-right corner with a speech bubble (on phones, a "tap me" teaser instead). Its first line fits where the visitor came from (X, LinkedIn, GitHub, Arcapush, search) or the time in Lagos. Then it rotates true facts from `pulseLines()`: public GitHub contributions in the last 7 days of the calendar and the current streak, builds indexed on Arcapush, npm downloads over 30 days, the project count.
- /den: click the leopard on the dais (or "Ask the leopard" in the directory) to open the same chat in the panel slot.
- "Ask me about Mojeeb's work" posts to `/api/leopard`. With the `OPENROUTER_API_KEY` Worker secret set, a low-cost OpenRouter model answers from `knowledgeText()`, which is the site's own content, plus the live figures. The default is `google/gemini-2.5-flash-lite` ($0.10/$0.40 per million tokens, about $0.0005 a question), falling back to `openai/gpt-oss-120b` and `mistralai/mistral-small-3.2-24b-instruct`; set the `OPENROUTER_MODEL` var to put another model first. Links are checked against an allowlist. Without the key, or if the model fails, `answerLocally()` answers from hand-written entries. Questions are never stored. Rate limits: 8 a minute per isolate, plus the `LEOPARD_LIMITER` Workers binding.

**The world is built from data** (`components/den/denWorldScene.ts`, `DenWorldData`)
- Wall of Builds: one tile per project in `content/projects.ts`.
- Engineering Workbench: one rising spark per public GitHub contribution in the last 7 days (capped at 40).
- Discovery Beacon: glow scales with Arcapush platform visits (log scale).
- Lanterns: one paper lantern per approved guestbook note (latest 30), floating over the island. Click one to read the note.
- Each station panel shows its live figure.

**Day and night.** Lagos time (UTC+1). 6am–6pm is day, 6pm–6am is night. The boot script in `app/layout.tsx` sets `data-theme="day"|"night"` on `<html>` before first paint, and `components/shell/TimeOfDay.tsx` re-checks every minute so an open page changes over at 6am and 6pm. The theme toggle cycles Lagos time (default), Day and Night. `?time=night` or `?time=day` on any URL previews either. At night the leopard is asleep until tapped, the 3D world has stars and brighter lanterns; by day it sits under a pale sky.

## The website is the Den

`/` is the Den (`app/page.tsx` → `DenExperience`): visitors land in the full-screen 3D workshop, high-five the leopard and explore. There is no separate `/den` page any more (`/den` redirects to `/`). The title, a short line and shortcuts (Profile, Work, Contact, Controls) float over the world; the station directory, the help text and the footer sit below the fold, so every destination stays a plain link for keyboards and search engines.

Mojeeb's profile is **the golden lantern**: a large gold lantern hanging above the leopard, labelled "Mojeeb · Profile". Clicking it (or Profile in the shortcuts or the directory) opens a profile panel with the portrait, summary and availability, and a link to the full profile at **`/profile`** (`app/profile/page.tsx`: metrics, flagship, tools, case studies, activity, guestbook preview and the corner leopard guide).

The rest of the site shares the Den's look (`app/styles/den-theme.css`, tokens in `app/styles/tokens.css`) and follows Lagos time: night is the Midnight Atelier (dark ink, warm paper text, signal blue, leopard gold, stars and a floor grid), day is the same world under a pale sky. Glass panels with gold edges, gold mono eyebrows, gold primary buttons and a gold tick on every section rule.
