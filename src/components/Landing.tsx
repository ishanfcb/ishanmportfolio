"use client";

import PlaygroundHost from "./playground/PlaygroundHost";
import NewsSection from "./NewsSection";
import FeaturedProjects from "./FeaturedProjects";
import ThumbnailPreloader from "./ThumbnailPreloader";
import PagePreloader from "./PagePreloader";
import { projectsArray } from "../data/projects";
import newsItems from "../content/news.json";
import styles from "./Landing.module.css";

export default function Landing() {
  return (
    <div className={styles.landingContainer}>
      <PagePreloader />
      <PlaygroundHost />
      <NewsSection items={newsItems} />
      <FeaturedProjects projects={projectsArray} />
      <ThumbnailPreloader projects={projectsArray} />
    </div>
  );
}
