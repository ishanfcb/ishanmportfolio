import PlaygroundLanding from "../components/PlaygroundLanding";
import MissionStatement from "../components/MissionStatement";
import LandingProjects from "../components/LandingProjects";
import { projectsArray } from "../data/projects";

// JSON-LD structured data for featured projects on landing page
const featured = projectsArray.slice(0, 4);
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  itemListElement: featured.map((p, index) => ({
    "@type": "ListItem",
    position: index + 1,
    url: `https://leff.in/projects/${p.slug}`,
    name: p.name,
    datePublished: p.year,
  })),
};

export default function Home() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PlaygroundLanding />
      <MissionStatement />
      <LandingProjects />
    </main>
  );
}
