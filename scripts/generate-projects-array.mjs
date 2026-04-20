/**
 * Reads all project JSON files and generates src/data/projects.ts
 * as a static array for client-side consumption.
 *
 * Run with: node scripts/generate-projects-array.mjs
 */

import { readFileSync, writeFileSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, "..");
const projectsDir = join(rootDir, "src", "content", "projects");
const outputPath = join(rootDir, "src", "data", "projects.ts");

const files = readdirSync(projectsDir).filter((f) => f.endsWith(".json"));
const projects = [];

for (const file of files) {
  const raw = JSON.parse(readFileSync(join(projectsDir, file), "utf-8"));
  // Extract only the metadata fields needed for listings (no content)
  projects.push({
    name: raw.name,
    slug: raw.slug,
    thumbnail: raw.thumbnail,
    height: raw.thumbnailHeight || raw.height || 1080,
    width: raw.thumbnailWidth || raw.width || 1080,
    year: raw.year,
    tags: raw.tags,
    size: raw.size || "1x1",
    ...(raw.position !== undefined && { position: raw.position }),
    description: raw.description,
    featured: raw.featured ?? false,
    ...(raw.locked && { locked: true }),
    ...(raw.featuredOrder !== undefined && { featuredOrder: raw.featuredOrder }),
    _order: raw.order ?? 999,
  });
}

// Sort by order field to preserve original curation, then strip _order
projects.sort((a, b) => a._order - b._order);
projects.forEach((p) => delete p._order);

const output = `// AUTO-GENERATED — Do not edit manually.
// Generated from src/content/projects/*.json by scripts/generate-projects-array.mjs
// To regenerate: node scripts/generate-projects-array.mjs

export interface Project {
  name: string;
  slug: string;
  thumbnail: string;
  height: number;
  width: number;
  year: number;
  tags: string[];
  size: "1x1" | "1x2" | "2x1" | "2x2";
  position?: 1 | 2 | 3 | 4 | 5 | 6;
  description: string;
  featured: boolean;
  featuredOrder?: number;
  locked?: boolean;
}

export const projectsArray: Project[] = ${JSON.stringify(projects, null, 2)};
`;

writeFileSync(outputPath, output);
console.log(`Generated ${outputPath} with ${projects.length} projects`);
