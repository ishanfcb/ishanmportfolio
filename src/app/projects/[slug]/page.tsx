import { notFound } from "next/navigation";
import path from "path";
import fs from "fs";
import { projectsArray } from "@/data/projects";
import ProjectDetailClient from "./ProjectDetailClient";
import type { Metadata } from "next";

export async function generateStaticParams() {
  return projectsArray.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = projectsArray.find((p) => p.slug === slug);
  return {
    title: project?.name ?? "Project",
    description: project?.description ?? "",
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const filePath = path.join(
    process.cwd(),
    "src/content/projects",
    `${slug}.json`
  );

  if (!fs.existsSync(filePath)) {
    notFound();
  }

  let project;
  try {
    project = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    notFound();
  }

  // Prev / next navigation (wraps around)
  const currentIndex = projectsArray.findIndex((p) => p.slug === slug);
  const totalProjects = projectsArray.length;
  const prevProject =
    projectsArray[(currentIndex - 1 + totalProjects) % totalProjects];
  const nextProject = projectsArray[(currentIndex + 1) % totalProjects];

  return (
    <ProjectDetailClient
      project={project}
      prevProject={{ slug: prevProject.slug, name: prevProject.name }}
      nextProject={{ slug: nextProject.slug, name: nextProject.name }}
    />
  );
}
