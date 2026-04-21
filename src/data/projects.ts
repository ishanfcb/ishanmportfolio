// AUTO-GENERATED — Do not edit manually.
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

export const projectsArray: Project[] = [
  {
    "name": "Ajanta Caves",
    "slug": "ajanta-caves",
    "thumbnail": "/media/thumbnails/ajanta-caves.jpg",
    "height": 1080,
    "width": 1080,
    "year": 2025,
    "tags": [
      "Research",
      "UX",
      "3D World Building",
      "VR"
    ],
    "size": "1x1",
    "description": "An immersive VR experience that brings the Ajanta Caves to life, focusing on light, interaction, and atmosphere to recreate the feeling of being inside the space.",
    "featured": true
  },
  {
    "name": "Delhi's AQI",
    "slug": "del-aqi",
    "thumbnail": "/media/thumbnails/del-aqi.jpg",
    "height": 1080,
    "width": 1080,
    "year": 2026,
    "tags": [
      "Data Visualisation",
      "Research",
      "UI",
      "UX"
    ],
    "size": "1x1",
    "description": "An interactive data visualisation that exposes how clean air in Delhi has become a privilege, using personal data and narrative to shift users from awareness to discomfort.",
    "featured": true
  },
  {
    "name": "Digital Fatigue",
    "slug": "digital-fatigue",
    "thumbnail": "/media/thumbnails/digital-fatigue.jpg",
    "height": 1080,
    "width": 1080,
    "year": 2025,
    "tags": [
      "Research",
      "UX",
      "UI"
    ],
    "size": "1x1",
    "description": "A research-driven exploration into digital fatigue caused by Instagram Reels, focusing on why users continue to engage in behaviours they actively want to stop.",
    "featured": true
  },
  {
    "name": "Interactive Folk Art Map",
    "slug": "folk-art-map",
    "thumbnail": "/media/thumbnails/folk-art-map.jpg",
    "height": 1080,
    "width": 1080,
    "year": 2024,
    "tags": [
      "Research",
      "UX",
      "UI",
      "Industry"
    ],
    "size": "1x1",
    "description": "An interactive kiosk interface designed to complement a physical map of Indian folk art, allowing students and visitors to explore the history and cultural significance of each regional style.",
    "featured": false
  },
  {
    "name": "Order & Disorder",
    "slug": "order-disorder",
    "thumbnail": "/media/thumbnails/order-disorder.jpg",
    "height": 1080,
    "width": 1080,
    "year": 2025,
    "tags": [
      "Filmmaking"
    ],
    "size": "1x1",
    "description": "A black-and-white video poem that explores the tension between chaos and order through a split-screen narrative, ultimately revealing an underlying sense of structure within apparent disorder.",
    "featured": false
  },
  {
    "name": "Posture Corrector",
    "slug": "posture-corrector",
    "thumbnail": "/media/thumbnails/posture-corrector.png",
    "height": 1080,
    "width": 1080,
    "year": 2024,
    "tags": [
      "Research",
      "UX",
      "Product Design"
    ],
    "size": "1x1",
    "description": "A wearable posture-correcting device that detects slouching in real time and nudges users to sit upright, helping build awareness and healthier sitting habits without disrupting daily routines.",
    "featured": true
  }
];
