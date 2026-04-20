# leff.in

Hand-built portfolio website showcasing my projects and experiments.

**Live at [leff.in](https://leff.in)**

---

## Architecture

- **Next.js 16** App Router with static site generation
- **React 19** with CSS Modules and CSS custom properties
- **Editorial design system** — warm cream palette, Neuzeit Grotesk + Times New Roman italic
- Deployed on **Vercel** with branch-based environments (`master` &rarr; production, `2025` &rarr; archived version)

## Features

### Playground — Shuffleable Visual Identity

The hero section is a rotating set of **Playground** items — each one a distinct visual interpretation of the same identity information. Every playground carries three layers: the name ("Leffin"), the positioning ("Artist and Engineer"), and ten identity words (Multidisciplinary, Interactive, Technologist, Introspective, Embodied, Immersive, Experimental, Human, Storyteller, Builder). The constraint is that each playground must present this information in its own native format, so the identity feels discovered rather than declared.

Visitors cycle through playgrounds via an earmark button in the bottom-right corner. The site always starts with the Explosion playground, then shuffles randomly. Each cycle is tracked via Umami (`playground-cycle`). All playgrounds live in `src/components/playground/`, each in its own subfolder, registered in `playgroundRegistry.ts`.

- **Explosion** — 17 SVG rectangles animate between chaos and letterforms using `requestAnimationFrame` with custom easing. Three positional states (random scatter &rarr; "LEFF.IN" &rarr; "LEFFIN.") with per-frame interpolation and responsive scaling via `ResizeObserver`. The identity words and positioning appear as animated text beneath the letterforms.
- **Dictionary** — Presents the identity as a dictionary entry — phonetic spelling, part of speech, numbered definitions, usage examples, and etymology. The identity words appear as synonyms. The format makes the self-description feel like a found object rather than a bio.
- **Terminal** — A simulated command-line session that runs `cat tags.txt`, listing the identity words line by line with character-by-character typing animation (35ms per char) and a blinking cursor. The positioning and name appear as the terminal prompt and file contents.
- **2D Bodies** — Physics simulation using `planck.js` (Box2D). The name's letters hang from threads attached to the ceiling via revolute joints; the ten identity words fall as rigid bodies and pile up on a floor. A kinematic cursor body lets visitors push elements around. The identity is literally physical and playful.
- **Word Search** — A responsive letter grid (40x20 landscape, 20x30 portrait) with "LEFFIN" centered and identity words placed as crosswords. Hovering or touching cells swaps their color, with a self-healing timer that restores them after 3 seconds. The identity words are hidden in plain sight, waiting to be found.

### JSON-Driven Content System

All site content lives in `src/content/` as plain JSON files. No CMS, no database:

- **Projects**: `src/content/projects/[slug].json` — metadata, tags, thumbnail info, and a flexible content array of text/image/video/heading sections with configurable sizes
- **About**: `src/content/about.json` — bio, credentials, exhibitions, speaking, press
- **News**: `src/content/news.json` — ticker items with explicit expiry dates
- **Interactives**: `src/content/lab.json` — interactive experiments

A build script (`scripts/generate-projects-array.mjs`) reads all project JSONs, sorts by `order`, and generates a static `src/data/projects.ts` array. This runs automatically before every build. Client components import the generated array; server components use an fs-based loader with **Zod validation** (`src/lib/projectSchema.ts`).

An external admin tool (separate Docker project) writes optimized media and JSON directly to the repo, with git push triggering Vercel deploys.

### Intelligent Media Loading

Thumbnail loading uses a three-layer strategy:

1. **Deferred rendering** — Media elements aren't rendered on first paint. A `useEffect` enables them after mount, showing the container background as a natural placeholder. The `loadedMedia` Set (a shared singleton store) tracks what's been loaded, so revisits skip the defer entirely.

2. **Visibility-based video playback** — An `IntersectionObserver` hook (threshold 0.25) plays videos when they scroll into view and pauses them when they leave. If `play()` is called before the video has buffered, it catches the rejection and retries via a one-time `canplay` event listener.

3. **Background preloading** — A `ThumbnailPreloader` component runs on the landing page, waits 2 seconds for above-the-fold content to settle, then uses `requestIdleCallback` to preload every project thumbnail sequentially in the background. Images use `new Image()`, videos use a temporary `<video>` element with `preload="metadata"`. Each is added to the `loadedMedia` store, so the projects grid renders instantly on navigation.

### Project Detail Pages

Each project page is statically generated at build time via `generateStaticParams()`. The content system supports flexible section layouts:

- **Section types**: text, image, video, heading
  - `text` — body paragraphs (Times New Roman italic), supports multiple strings rendered as separate `<p>` elements
  - `image` — static media with alt text
  - `video` — auto-playing looping background video via `ResponsiveVideo` (supports quality variants via `<source>` elements). Optional `controls: true` switches to user-controlled playback (non-muted, non-looping, no autoplay). Optional `poster` for a preview frame.
  - `heading` — section divider rendered as `<h3>` (uppercase Neuzeit Grotesk with red accent underline). Always full-width (`"size": "f"`) and alone in its section group.
- **Section sizes**: half (`h`), full (`f`), third (`t`), two-thirds (`t2`), quarter (`q`), small (`s`), single (`1`) — mapped to CSS classes
- Header displays project name, description, year, tags, and a thumbnail/video hero

### Filtering & Discovery

The projects grid offers two-tier filtering backed by URL query params (`?tags=tag1,tag2`):

- **Presets** — broad categories ("New Media Art", "Design") that map to multiple tags at once
- **Individual tags** — all unique tags sorted by frequency, top 8 visible with expandable "more" toggle
- OR logic within active tags, with intelligent preset detection

### News Ticker

A seamless horizontal scroll loop built with CSS `translateX` animation. Content is repeated 6x for gapless looping. Items have explicit `expires` dates — expired items are filtered client-side. Pauses on hover. Masked edges with CSS `mask-image` gradient.

### Interactives

A collection of interactive prototypes, p5.js sketches, and experiments. One route (`/interactives/dinoRevenge`) is proxied via Vercel rewrite to a separate deployment. External experiments open in new tabs; internal ones route within the site.

### Tracking Redirects

The `[source]` catch-all route maps short URLs to Umami events and redirects home:

- `/cv` &rarr; tracks "resume" visit
- `/li` &rarr; tracks "linkedin-profile" visit
- `/gm` &rarr; tracks "email-signature" visit

Configured in `src/config/trackingSources.ts`. Invalid paths redirect to 404.

### SEO & Structured Data

- **JSON-LD** `ItemList` schema on the landing page for featured projects
- **Dynamic metadata** per project page via `generateMetadata()`
- **OpenGraph image** and Twitter card configuration
- **Sitemap** generation

### Accessibility

- Screen reader text via `.sr-only` utility class
- `aria-label` on interactive elements (nav toggle, playground button, project cards)
- `aria-current="page"` on active navigation links
- `aria-expanded` on hamburger menu
- Semantic HTML (`<nav>`, `<main>`, `<section>`, `<article>`)
- Focus-visible states on all interactive elements

### Performance Details

- `will-change: transform` on animated elements
- `preload="metadata"` on all videos (not full download)
- `requestIdleCallback` for non-blocking background preloading
- Next.js `<Image>` for automatic optimization
- CSS `clamp()` for fluid responsive spacing
- Vercel Speed Insights integration

## Design System

| Token | Value | Usage |
| ----- | ----- | ----- |
| `--background` | `rgb(235, 232, 224)` | Warm cream base |
| `--foreground` | `rgb(39, 39, 38)` | Dark brown text |
| `--accent` | `#da1f26` | Red highlights, CTAs |
| `--disabled` | `#a39f90` | Muted taupe |

**Typography**: Neuzeit Grotesk (Adobe Typekit) for headings and UI — uppercase, tight tracking. Times New Roman for body/descriptive text.

## Project Structure

```text
src/
  app/            # Next.js routes (/, /projects, /about, /interactives, /[source])
  components/     # UI components, playground/, hooks, CSS modules
  content/        # JSON content (projects/, about, news, interactives)
  data/           # Auto-generated projects.ts
  lib/            # Zod schema, fs-based project loader
  config/         # Tracking sources config
public/
  media/[slug]/   # Project thumbnails and detail media
scripts/
  generate-projects-array.mjs
```
