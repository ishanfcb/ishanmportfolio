import { Suspense } from "react";
import { projectsArray } from "@/data/projects";
import ProjectsGrid from "@/components/ProjectsGrid";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Explore ishan's full portfolio — installations, interactive art, product design, and more.",
};

export default function ProjectsPage() {
  return (
    <Suspense fallback={null}>
      <ProjectsGrid projects={projectsArray} />
    </Suspense>
  );
}
