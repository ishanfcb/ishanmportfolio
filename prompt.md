I need to build a self-hosted admin panel for managing my portfolio website (leff.in). This will run as a Docker container on my NUC, accessible at admin.leff.in via Cloudflared + nginx (already configured for other services).

## Architecture

- **Portfolio site**: Next.js 16 (App Router, React 19) on Vercel, deployed from GitHub repo `falcyon/react-portfolio-2025` (branch: `refresh`)
- **This admin app**: Standalone Node.js server in Docker on my NUC
- **Content model**: All editable content lives in `src/content/` in the portfolio repo
- **Media model**: Optimized media lives in `public/media/[slug]/` — originals stay on the NUC, only processed files go to the repo
- **Workflow**: Admin edits content → saves JSON + optimized media to local repo clone → commits and pushes → Vercel auto-deploys (no manual build trigger needed — the build script runs `generate-projects-array.mjs` automatically before `next build`)

## Content directory structure

All admin-editable content is in `src/content/`:

```
src/content/
├── projects/              # One JSON file per project
│   ├── ephemera.json
│   ├── palimpsest.json
│   └── ...
├── about.json             # Bio, credentials, experience, exhibitions, speaking, press
├── lab.json               # Interactives/lab experiments list (renders at /interactives on the site)
└── news.json              # News ticker items
```

## How the site consumes content

Understanding this helps the admin write correct data:

1. **`src/data/projects.ts`** — AUTO-GENERATED at build time from project JSONs. Contains only metadata (no `content` field). Used by client components for the projects grid, featured projects, etc. **Never edit manually.**
2. **Project detail pages** — Server components dynamically import the full JSON (`content` included) from `src/content/projects/[slug].json` at build time (SSG).
3. **About, News, Lab** — Imported directly by their respective page components.

The build command is:
```
node scripts/generate-projects-array.mjs && next build
```

The generate script extracts metadata from each project JSON, sorts by `order` (defaults to 999 if missing), and writes a TypeScript file. It maps `thumbnailWidth` → `width` and `thumbnailHeight` → `height` in the output.

## Site routes (for reference)

- `/` — Landing page (playground hero → news ticker → featured projects)
- `/projects` — Projects grid with tag filtering
- `/projects/[slug]` — Individual project detail page
- `/about` — Bio, experience, exhibitions, speaking, press
- `/interactives` — Lab experiments / p5.js sketches (note: content file is `lab.json` but route is `/interactives`)
- `/interactives/dinoRevenge` — Proxied via Vercel rewrite

## Project JSON schema

Each project file (`src/content/projects/[slug].json`) follows this Zod-validated schema:

```json
{
  "name": "Project Name",
  "slug": "projectName",
  "year": 2025,
  "tags": ["Tag1", "Tag2"],
  "description": "Short description for cards and meta tags",
  "thumbnail": "/media/projectName/filename.mp4",
  "thumbnailWidth": 1080,
  "thumbnailHeight": 1080,
  "size": "2x2",
  "position": 2,
  "order": 0,
  "featured": true,
  "featuredOrder": 0,
  "content": [
    {
      "sections": [
        { "type": "text", "size": "h", "text": ["paragraph 1", "paragraph 2"] },
        { "type": "image", "size": "h", "src": "/media/projectName/image.jpg", "alt": "Description" },
        { "type": "video", "size": "f", "src": "/media/projectName/video.mp4", "alt": "Description" },
        { "type": "image", "size": "t2", "src": "/media/projectName/pic.webp", "alt": "Desc", "style": "border: none;" }
      ]
    }
  ]
}
```

### Field reference

**Top-level fields:**
- **name** (string, required) — project title
- **slug** (string, required) — URL-safe identifier, must match the JSON filename
- **year** (integer, required) — 1900–2100
- **tags** (string[], required, min 1) — at least one tag. Current tags in use: `AI/ML`, `Branding`, `Digital`, `Interactive`, `Performance`, `Physical`, `Product Design`, `Quantum`
- **description** (string, required) — short description shown on project cards and in meta tags
- **thumbnail** (string, required) — path to thumbnail media file (e.g., `/media/ephemera/ephemera.mp4`). The admin provides the filename — do not rename to a generic name like `thumbnail.ext`
- **thumbnailWidth** (integer, required) — original width in pixels
- **thumbnailHeight** (integer, required) — original height in pixels
- **size** (enum, required) — grid thumbnail size: `1x1`, `1x2`, `2x1`, `2x2`
- **position** (integer, optional) — 1–6, placement hint within the grid row
- **order** (integer, optional) — display order in the projects grid (0 = first). Defaults to 999 if missing (appears last)
- **featured** (boolean, optional) — whether this project appears on the landing page featured section. Defaults to `false`
- **featuredOrder** (integer, optional) — sort order among featured projects (0 = first)
- **content** (array, required) — array of section groups (see below)

**Content sections:**

Each item in `content` is a section group containing a `sections` array. Sections within a group render side-by-side in a flex row (wrapping on mobile).

Section fields:
- **type** (enum, required): `text`, `image`, or `video`
- **size** (enum, required): layout width — `h` (half/50%), `f` (full/100%), `t` (third/33%), `t2` (two-thirds/66%), `q` (quarter/25%), `s` (sixth/16%), `1` (single)
- **text** (string[], optional) — array of paragraph strings, used when `type` is `text`
- **src** (string, optional) — path to media file, used when `type` is `image` or `video`
- **alt** (string, optional) — alt text for images/videos
- **style** (string, optional) — inline CSS overrides as a semicolon-separated string (e.g., `"border: none;"`)

All sizes collapse to 100% width on screens < 700px.

## about.json schema

```json
{
  "name": "Leffin",
  "summary": "Multidisciplinary New Media Artist...",
  "credentials": {
    "education": [
      { "text": "MFA Design & Technology, Parsons", "note": "Honors" },
      { "text": "B.Tech Aerospace, IIT Bombay", "note": "Minor in Industrial Design" }
    ],
    "current": "Experience Design Lead, Citibank"
  },
  "contact": {
    "email": "leffin7@gmail.com",
    "instagram": "https://www.instagram.com/leffinc/",
    "linkedin": "https://www.linkedin.com/in/leffin"
  },
  "exhibitions": [
    { "venue": "...", "work": "...", "slug": "projectSlug", "location": "City, ST", "year": "2025", "href": "https://..." }
  ],
  "speaking": [
    { "event": "...", "role": "...", "year": "2023", "href": "https://..." }
  ],
  "press": [
    { "publication": "...", "type": "Artist Feature", "year": "2024", "href": "https://..." }
  ],
  "experience": [
    { "title": "VP, Experience Design Lead", "description": "Leading design of an enterprise AI platform", "company": "Citibank", "period": "2024 - Present" }
  ]
}
```

### about.json field details

- **exhibitions**: `venue` (string), `work` (string — project name), `slug` (string — links to `/projects/[slug]`), `location` (string), `year` (string), `href` (string, optional — external link)
- **speaking**: `event` (string), `role` (string), `year` (string), `href` (string, optional)
- **press**: `publication` (string), `type` (string, optional — e.g., "Artist Feature", "Profile"), `year` (string), `href` (string, optional)
- **experience**: `title` (string), `description` (string), `company` (string), `period` (string — e.g., "2024 - Present")

## news.json schema

Each news item has an explicit `expires` date set by the admin (not auto-expiring):

```json
[
  {
    "text": "Upcoming: Currents New Media Festival June 12 - 21, 2026, Santa Fe, New Mexico",
    "date": "2026-02-01",
    "expires": "2026-07-01"
  },
  {
    "text": "Ephemera shown at NYCxDesign 2025",
    "link": "/projects/ephemera",
    "linkText": "View project",
    "date": "2025-05-01",
    "expires": "2025-11-01"
  }
]
```

- **text** (string, required) — the news ticker text
- **date** (string, required) — ISO date (YYYY-MM-DD), when the news was posted
- **expires** (string, required) — ISO date (YYYY-MM-DD), when to stop showing it
- **link** (string, optional) — internal path or external URL
- **linkText** (string, optional) — display text for the link

Items are hidden from the site when `expires` is in the past.

## lab.json schema

These render at the `/interactives` route on the site. The content file is still named `lab.json`.

```json
[
  {
    "name": "Dino Revenge",
    "description": "A Gemini-powered twist on the Chrome dinosaur game.",
    "href": "https://leff.in/interactives/dinoRevenge"
  },
  {
    "name": "Human Condition",
    "description": "Real-time body segmentation with pose detection overlays.",
    "href": "https://editor.p5js.org/Falcyon/full/NmCT_pCwr",
    "thumbnail": "/media/humanCondition/portraiture.mp4"
  }
]
```

- **name** (string, required) — experiment title
- **description** (string, required) — brief description
- **href** (string, required) — link to the interactive (internal or external p5.js editor links)
- **thumbnail** (string, optional) — path to thumbnail image or video

## Media organization

All media is organized per-project in `public/media/[slug]/`:

```
public/media/
├── ephemera/
│   ├── ephemera.mp4        # thumbnail (original filename, not renamed)
│   ├── teaser.jpg           # detail media
│   ├── 01_TeaserPoster.jpg
│   └── ...
├── palimpsest/
│   ├── palimpsest2.mp4      # thumbnail
│   ├── 1.jpg
│   ├── Asset 2-100.jpg      # filenames can have spaces
│   └── ...
├── zoe/                     # future project, media already staged
└── ...
```

**Important**: Thumbnail files keep their original filenames — the admin provides the filename and the project JSON stores the full path (e.g., `/media/ephemera/ephemera.mp4`). Do not rename files to `thumbnail.ext`.

Site-level assets (`Logo.png`, `leffin_opengraphimage.png`, `Leffin_Resume.pdf`) are in `public/` root, not in `media/`.

### Media optimization strategy

- **Originals stay on the NUC** — the NUC is the archive for raw/uncompressed media
- **Only optimized/compressed files** are written to the portfolio repo's `public/media/[slug]/`
- This keeps the git repo lean and Vercel deploys fast

## What the admin writes to

The Docker container mounts the portfolio repo clone and writes to:

| Content type | File path(s) |
|---|---|
| Project data | `src/content/projects/[slug].json` |
| About page | `src/content/about.json` |
| News ticker | `src/content/news.json` |
| Lab / Interactives | `src/content/lab.json` |
| Project media | `public/media/[slug]/` (optimized files only) |

## Requirements

### Stack
- Node.js + Express (or Fastify)
- Tiptap for rich text editing (bold, italic, underline, links)
- File upload with drag-and-drop
- ffmpeg for video processing (already installed on NUC)
- Docker + docker-compose
- Password-protected (simple env var password, session-based)

### Admin UI features
- **Projects**: List, create, edit, delete projects (read/write `src/content/projects/*.json`)
  - Form fields: name, slug (auto-generated from name, editable), year, tags, description, thumbnail, thumbnailWidth, thumbnailHeight, size, position, order, **featured** (toggle), **featuredOrder** (number)
  - Content editor: ordered list of section groups, each with sections (text/image/video)
  - Text sections: Tiptap rich text editor, output as array of paragraph strings
  - Image sections: file upload + alt text + optional style override
  - Video sections: file upload + alt text, triggers ffmpeg processing
  - Reorder sections and section groups via up/down buttons
  - Section size picker (h, f, t, t2, q, s, 1)
- **About**: Edit bio, credentials, experience, exhibitions, speaking engagements, press (read/write `src/content/about.json`)
- **News**: Manage news ticker items with explicit expiration dates (read/write `src/content/news.json`)
- **Interactives**: Manage lab experiments list (read/write `src/content/lab.json`)

### Video processing (ffmpeg)
When a video is uploaded:
1. Analyze with ffprobe (resolution, duration, codec)
2. Transcode to web-optimized versions:
   - 1080p (H.264, CRF 23, 24fps, no audio)
   - 720p (H.264, CRF 25, 24fps)
   - 480p (H.264, CRF 28, 24fps)
   - Skip qualities higher than input resolution
3. Generate poster thumbnail (first frame or at 1s)
4. Output to: `public/media/[slug]/` in the repo clone (keep original filenames)

### Git integration
- The Docker container mounts the portfolio repo clone as a volume
- After saving: write JSON + copy optimized media to repo
- Provide a "Commit & Push" button that runs git add, commit, push
- Show git status in the UI
- Pushing to `refresh` branch auto-triggers Vercel deploy — no manual build needed

### Docker setup
- Dockerfile with Node.js + ffmpeg
- docker-compose.yml with volume mount to the repo clone
- Environment variables: ADMIN_PASSWORD, REPO_PATH (path to mounted repo)

### Security
- Password gate (check against ADMIN_PASSWORD env var)
- Session stored in cookie
- Only accessible via admin.leff.in (Cloudflared handles HTTPS)
