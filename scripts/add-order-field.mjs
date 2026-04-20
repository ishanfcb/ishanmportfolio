/**
 * One-time script: Adds `order` field to each project JSON
 * based on the original projectsArray ordering from projects.ts.
 *
 * Run with: node scripts/add-order-field.mjs
 */

import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectsDir = join(__dirname, "..", "src", "projects");

// Original order from projects.ts (before migration)
const originalOrder = [
  "ephemera",
  "andWordsWillEchoInMySoul",
  "notesToSelf",
  "stainedMask",
  "palimpsest",
  "aiDiscoversFire",
  "constructor",
  "humanCondition",
  "readMyLips",
  "conversationSculpture",
  "petmania",
  "uniicode",
  "organicMetal",
  "crew",
  "humbleBee",
  "unraveling",
  "bitByBit",
  "clock",
  "grimmerTales",
  "discourseParkour",
  "quantumTouch",
  "quantumTriptych",
];

for (let i = 0; i < originalOrder.length; i++) {
  const slug = originalOrder[i];
  const filePath = join(projectsDir, `${slug}.json`);

  const data = JSON.parse(readFileSync(filePath, "utf-8"));
  data.order = i;

  writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n");
  console.log(`  ${slug}: order = ${i}`);
}

console.log(`\nDone! Added order field to ${originalOrder.length} projects.`);
