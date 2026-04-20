# CLAUDE.md — react-portfolio-2025

## Project Overview

Personal portfolio for Leffin, a multidisciplinary New Media Artist. Deployed at **leff.in** on Vercel.

## Tech Stack

- **Framework**: Next.js 16 (App Router), React 19
- **Styling**: CSS Modules, CSS custom properties
- **Validation**: Zod
- **Analytics**: Umami (website ID: `836b2b5c-a53a-48d3-88d4-06959b33b93d`), Vercel Analytics + Speed Insights
- **Fonts**: Neuzeit Grotesk (Adobe Typekit CDN), Times New Roman italic
- **Icons**: react-icons

## Branching Strategy

- `master` → leff.in (production)
- `2025` → 2025.leff.in (archived version)
- `refresh` → active development branch for the new version

## Content System

All editable content lives in `src/content/`:

- **Projects**: `src/content/projects/[slug].json` — unified metadata + content per project
- **About**: `src/content/about.json` — bio, credentials, exhibitions, speaking, press
- **News**: `src/content/news.json` — news ticker items (with explicit `expires` date)
- **Lab**: `src/content/lab.json` — lab experiments list
- **`src/data/projects.ts`**: AUTO-GENERATED from project JSONs. **Never edit manually.**
- **Build script**: `"build": "node scripts/generate-projects-array.mjs && next build"` — auto-regenerates before every build
- Client components import `projectsArray` from `data/projects.ts` (static, bundleable)
- Server components can use `src/lib/projects.ts` (fs-based loader with Zod validation)
- Zod schema at `src/lib/projectSchema.ts`

## Media Organization

- All project media in `public/media/[slug]/` (thumbnails + detail media together, per-project)
- Thumbnail filenames are kept as-is (admin provides the name, not renamed to `thumbnail.ext`)
- Site assets (`Logo.png`, `leffin_opengraphimage.png`) in `public/` root
- Favicon at `src/app/favicon.ico` (Next.js convention)
- An external admin project (Docker on NUC) writes optimized media here; originals stay on the NUC

## Key Architecture Decisions

- `projectsArray` is used in client components — cannot use `fs` in `data/projects.ts`
- Featured projects are data-driven: `featured` (boolean) + `featuredOrder` (number) in project JSONs
- The `[source]` route handles tracking redirects (/cv, /li, /gm) — server component checks source validity and calls `notFound()` for unknown paths; client `SourceTracker` handles Umami tracking + redirect
- Light mode is the default theme (warm cream editorial palette)
- CSS custom properties: `--background: rgb(235, 232, 224)`, `--foreground: rgb(39, 39, 38)`, `--accent: #da1f26`

## Landing Page — Playground

The hero section uses shuffleable visual identity cards called **Playground** items.

- Located in `src/components/playground/`, each in its own subfolder (`explosion/`, `dictionary/`, `terminal/`, `physics/`)
- `PlaygroundHost.tsx` manages the shuffle cycle (earmark button in bottom-right corner)
- `playgroundRegistry.ts` registers all playground items (each entry has `id`, `name`, `label`, `component`)
- Always starts with **ExplosionPlayground** (animated rectangles forming "LEFFIN.")
- 4 playground items: Explosion, Dictionary, Terminal, 2D Bodies (Physics)
- Umami tracks shuffles as `playground-cycle`

## Site Structure

- `/` — Landing page (PlaygroundHost → NewsSection → FeaturedProjects)
- `/projects` — Projects grid
- `/projects/[slug]` — Individual project pages (SSG from JSON, shows thumbnail in header)
- `/about` — Bio, exhibitions, speaking, press (from `content/about.json`)
- `/lab` — p5.js sketches and interactive experiments (from `content/lab.json`)
- `/lab/dinoRevenge` — Proxied via Vercel rewrite
- `not-found.tsx` — Custom 404 page with falling dot animation (CSS keyframes, no JS)

## Commands

- `npm run dev` — Start dev server
- `npm run build` — Production build (auto-generates projects.ts, then builds)
- `node scripts/generate-projects-array.mjs` — Manually regenerate projects.ts from JSON files

## Style Guidelines

- Editorial/newspaper aesthetic with warm cream background
- Neuzeit Grotesk for headings and UI (uppercase, tight tracking)
- Times New Roman italic for body/descriptive text
- Red accent (`#da1f26`) for highlights and interactive elements
- Minimal, clean layouts with generous whitespace
