/**
 * Migration script: Merge metadata from projects.ts into each project JSON file.
 * Creates unified JSON files with both metadata and content.
 *
 * Run with: node scripts/migrate-projects.mjs
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const projectsDir = join(rootDir, 'src', 'projects');

// Metadata from projects.ts (extracted manually since we can't import TS directly)
const projectsMetadata = [
  { name: "Ephemera", slug: "ephemera", thumbnail: "/media/thumbnails/ephemera.mp4", thumbnailWidth: 1080, thumbnailHeight: 1080, year: 2025, tags: ["Installation", "Conceptual Art", "Physical"], size: "t", position: 2, description: "An installation reflecting on humanity's grapple with legacy" },
  { name: "...And Words Will Echo in My Soul", slug: "andWordsWillEchoInMySoul", thumbnail: "/media/thumbnails/insecurityMirror.mp4", thumbnailWidth: 1080, thumbnailHeight: 1080, year: 2024, tags: ["Performance", "Installation", "Conceptual Art"], size: "t", position: 2, description: "An interactive installation where users see a silhouette of their negative self-talk as their reflection" },
  { name: "Notes to Self", slug: "notesToSelf", thumbnail: "/media/thumbnails/notes.mp4", thumbnailWidth: 1080, thumbnailHeight: 1080, year: 2021, tags: ["Interactive", "Installation", "AI"], size: "t", position: 3, description: "An interactive installation where users engage in a conversation with their digital self" },
  { name: "Stained Mask", slug: "stainedMask", thumbnail: "/media/thumbnails/StainedMask.mp4", thumbnailWidth: 540, thumbnailHeight: 540, year: 2021, tags: ["Interactive", "Installation", "Conceptual Art"], size: "t", position: 1, description: "An interactive installation critiquing the Church's opinion on masks during Covid." },
  { name: "Palimpsest", slug: "palimpsest", thumbnail: "/media/thumbnails/palimpsest2.mp4", thumbnailWidth: 1920, thumbnailHeight: 1080, year: 2023, tags: ["Performance", "Installation", "Conceptual Art"], size: "h", position: 2, description: "A performance installation converting conversations into pieces of thread." },
  { name: "AI Discovers Fire", slug: "aiDiscoversFire", thumbnail: "/media/thumbnails/fire-gif.mp4", thumbnailWidth: 800, thumbnailHeight: 464, year: 2021, tags: ["Media Art", "AI", "Generative Art"], size: "h", position: 3, description: "Media Art created using DCGAN trained on images of fire." },
  { name: "Constructor", slug: "constructor", thumbnail: "/media/thumbnails/constructor.mp4", thumbnailWidth: 1080, thumbnailHeight: 1080, year: 2025, tags: ["Installation", "Kinetic", "Design"], size: "t", position: 1, description: "A piece created by designing a motion accumulator" },
  { name: "Human Condition", slug: "humanCondition", thumbnail: "/media/thumbnails/portraiture.mp4", thumbnailWidth: 500, thumbnailHeight: 590, year: 2021, tags: ["Performance", "Conceptual Art"], size: "q", position: 1, description: "An interpretive performance exploring the human condition." },
  { name: "Read my Lips", slug: "readMyLips", thumbnail: "/media/thumbnails/ReadMyLips2.mp4", thumbnailWidth: 720, thumbnailHeight: 850, year: 2021, tags: ["Interactive", "AI", "Installation"], size: "q", position: 2, description: "An interactive installation isolating viewers' lips and predicting their emotions." },
  { name: "Conversation Sculpture", slug: "conversationSculpture", thumbnail: "/media/thumbnails/pop2.mp4", thumbnailWidth: 1080, thumbnailHeight: 1080, year: 2022, tags: ["Sculpture", "Conceptual Art"], size: "q", position: 3, description: "A sculpture made up of conversations about nihilism." },
  { name: "Petmania", slug: "petmania", thumbnail: "/media/thumbnails/petmania.mp4", thumbnailWidth: 720, thumbnailHeight: 1158, year: 2022, tags: ["Product Design", "App Design"], size: "t", position: 2, description: "Product Design for an app for dogs to find companions." },
  { name: "unIIcode", slug: "uniicode", thumbnail: "/media/thumbnails/uniicode_2.mp4", thumbnailWidth: 1440, thumbnailHeight: 1080, year: 2021, tags: ["Digital Art", "Typography", "Generative Art"], size: "q", position: 1, description: "Generation of new character sets to fill up spaces in Unicode." },
  { name: "Organic Metal", slug: "organicMetal", thumbnail: "/media/thumbnails/rings.jpeg", thumbnailWidth: 3072, thumbnailHeight: 2807, year: 2022, tags: ["Sculpture", "Design", "Metalwork"], size: "q", position: 2, description: "Rings made out of metal but in a fluid and organic form." },
  { name: "Crew App Branding", slug: "crew", thumbnail: "/media/thumbnails/crew.mp4", thumbnailWidth: 1080, thumbnailHeight: 1080, year: 2023, tags: ["Branding", "Graphic Design"], size: "q", position: 3, description: "Branding, logo design, and design system for a social media startup." },
  { name: "Humble Bee", slug: "humbleBee", thumbnail: "/media/thumbnails/humblebee_sq.jpg", thumbnailWidth: 1500, thumbnailHeight: 1500, year: 2017, tags: ["Industrial Design", "Product Design"], size: "q", position: 4, description: "An MAV for military use." },
  { name: "Unraveling", slug: "unraveling", thumbnail: "/media/thumbnails/unraveling.mp4", thumbnailWidth: 700, thumbnailHeight: 700, year: 2021, tags: ["Digital Art", "Conceptual Art"], size: "t", position: 1, description: "Digital art visualizing a slow burn breakdown or an 'unraveling' of the self." },
  { name: "Bit by Bit", slug: "bitByBit", thumbnail: "/media/thumbnails/bitbybit.mp4", thumbnailWidth: 720, thumbnailHeight: 720, year: 2021, tags: ["Digital Art", "Generative Art"], size: "t", position: 2, description: "Digital art visualizing the passage of time in binary." },
  { name: "Clock", slug: "clock", thumbnail: "/media/thumbnails/clock.mp4", thumbnailWidth: 720, thumbnailHeight: 720, year: 2021, tags: ["Digital Art", "Conceptual Art"], size: "t", position: 3, description: "Digital art referencing the transitory nature of time in our memories." },
  { name: "Grimmer Tales", slug: "grimmerTales", thumbnail: "/media/thumbnails/Book.mp4", thumbnailWidth: 720, thumbnailHeight: 1080, year: 2022, tags: ["Illustration", "Book Design", "Narrative Art"], size: "t", position: 2, description: "An illustrated absurdist children's fairy tale book." },
  { name: "Discourse Parkour", slug: "discourseParkour", thumbnail: "/media/thumbnails/discourse.mp4", thumbnailWidth: 1098, thumbnailHeight: 700, year: 2021, tags: ["Interactive", "Installation"], size: "1", description: "An interactive installation where players read through a monologue as they play." },
  { name: "Quantum Touch", slug: "quantumTouch", thumbnail: "/media/thumbnails/qtouch.mp4", thumbnailWidth: 720, thumbnailHeight: 420, year: 2022, tags: ["Interactive", "Installation", "Media Art"], size: "h", position: 1, description: "A collaboration with IBM Quantum & TouchDesigner to create an interactive installation." },
  { name: "Quantum Triptych", slug: "quantumTriptych", thumbnail: "/media/thumbnails/triptych2.mp4", thumbnailWidth: 720, thumbnailHeight: 420, year: 2021, tags: ["Film", "Media Art"], size: "h", position: 2, description: "Using IBM's Quantum Composer to act as an editor for a short film." },
];

// Verify all JSON files exist
const existingFiles = readdirSync(projectsDir).filter(f => f.endsWith('.json'));
console.log(`Found ${existingFiles.length} existing JSON files`);
console.log(`Have metadata for ${projectsMetadata.length} projects`);

let migrated = 0;
let errors = 0;

for (const meta of projectsMetadata) {
  const jsonPath = join(projectsDir, `${meta.slug}.json`);

  try {
    const existing = JSON.parse(readFileSync(jsonPath, 'utf-8'));

    // Merge: metadata fields + existing content
    const merged = {
      name: meta.name,
      slug: meta.slug,
      year: meta.year,
      tags: meta.tags,
      description: meta.description,
      thumbnail: meta.thumbnail,
      thumbnailWidth: meta.thumbnailWidth,
      thumbnailHeight: meta.thumbnailHeight,
      size: meta.size,
      ...(meta.position !== undefined && { position: meta.position }),
      content: existing.content,
    };

    writeFileSync(jsonPath, JSON.stringify(merged, null, 2) + '\n');
    console.log(`  Migrated: ${meta.slug}`);
    migrated++;
  } catch (err) {
    console.error(`  ERROR: ${meta.slug} - ${err.message}`);
    errors++;
  }
}

console.log(`\nDone! Migrated: ${migrated}, Errors: ${errors}`);
