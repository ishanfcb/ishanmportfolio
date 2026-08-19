/**
 * Static full-site content index for the command palette.
 *
 * Each entry describes a discrete section of content that a visitor might
 * search for.  The `keywords` array is matched against the user's query in
 * addition to the `label` — add synonyms, topic words, or body-copy excerpts
 * here so the entry surfaces for natural searches.
 *
 * `href` may include a hash (e.g. `/about#experience`) to deep-link into a
 * section.  Add a matching `id` attribute to the target element in the page
 * when a hash is specified.
 *
 * Add entries freely as the site grows — the palette picks them up
 * automatically.
 */

export interface SiteEntry {
  /** Display label shown in the palette */
  label: string;
  /** The page / section this result points to */
  href: string;
  /** Short descriptor shown as trailing meta in the row */
  section: string;
  /** Extra terms that should match this entry (case-insensitive) */
  keywords: string[];
}

export const siteIndex: SiteEntry[] = [
  // ── About page ────────────────────────────────────────────────────────────

  {
    label: "Bio",
    href: "/about",
    section: "About",
    keywords: [
      "bio",
      "about",
      "who",
      "ishan",
      "interaction design",
      "student",
      "data visualization",
      "football",
      "photographer",
      "lens",
      "museo camera",
      "gurgaon",
      "user research",
      "systems design",
    ],
  },
  {
    label: "Professional Experience",
    href: "/about#experience",
    section: "About",
    keywords: [
      "experience",
      "work",
      "job",
      "internship",
      "intern",
      "career",
      "professional",
      "employment",
      "razornext",
      "sixth element",
      "ux intern",
      "ui ux designer",
      "e-commerce",
      "csr",
      "interactive map",
      "nda",
    ],
  },
  {
    label: "Exhibitions",
    href: "/about#exhibitions",
    section: "About",
    keywords: [
      "exhibition",
      "exhibit",
      "show",
      "gallery",
      "museo",
      "alag karo",
      "delhi",
      "photography exhibition",
      "museum",
    ],
  },
  {
    label: "Contact",
    href: "/about",
    section: "About",
    keywords: [
      "contact",
      "email",
      "instagram",
      "linkedin",
      "twitter",
      "resume",
      "cv",
      "reach out",
      "hire",
      "get in touch",
    ],
  },

  // ── Projects page ──────────────────────────────────────────────────────────

  {
    label: "All Projects",
    href: "/projects",
    section: "Projects",
    keywords: ["projects", "work", "portfolio", "all projects", "case studies"],
  },

  // ── Photographs page ───────────────────────────────────────────────────────

  {
    label: "Photographs",
    href: "/photographs",
    section: "Photography",
    keywords: [
      "photos",
      "photography",
      "photographs",
      "pictures",
      "gallery",
      "images",
      "shots",
      "film",
      "lens",
      "camera",
    ],
  },
];
