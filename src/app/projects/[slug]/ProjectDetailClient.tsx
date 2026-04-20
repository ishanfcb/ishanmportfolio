"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import styles from "./ProjectDetail.module.css";
import Link from "next/link";

interface ProjectSection {
  id: string;
  label: string;
}

interface ContentBlock {
  type: string;
  sectionId?: string;
  content?: string | string[];
  src?: string;
  alt?: string;
  label?: string;
  links?: { text: string; href: string }[];
}

interface ProjectData {
  name: string;
  tags?: string[];
  year?: number;
  liveUrl?: string;
  team?: string;
  role?: string;
  timeline?: string;
  sections?: ProjectSection[];
  contentBlocks?: ContentBlock[];
}

interface NavProject {
  slug: string;
  name: string;
}

export default function ProjectDetailClient({
  project,
  prevProject,
  nextProject,
}: {
  project: ProjectData;
  prevProject: NavProject;
  nextProject: NavProject;
}) {
  const [activeSection, setActiveSection] = useState<string>(
    project.sections?.[0]?.id ?? ""
  );
  const observersRef = useRef<IntersectionObserver[]>([]);

  // Scroll-track active sidebar section
  useEffect(() => {
    if (!project.sections || project.sections.length === 0) return;

    observersRef.current.forEach((o) => o.disconnect());
    observersRef.current = [];

    const intersecting = new Map<string, boolean>();

    const sync = () => {
      for (const section of project.sections!) {
        if (intersecting.get(section.id)) {
          setActiveSection(section.id);
          return;
        }
      }
    };

    project.sections.forEach((section) => {
      const el = document.getElementById(`section-${section.id}`);
      if (!el) return;

      const obs = new IntersectionObserver(
        ([entry]) => {
          intersecting.set(section.id, entry.isIntersecting);
          sync();
        },
        { rootMargin: "0px 0px -70% 0px", threshold: 0 }
      );
      obs.observe(el);
      observersRef.current.push(obs);
    });

    return () => observersRef.current.forEach((o) => o.disconnect());
  }, [project.sections]);

  // Fade-in on scroll for content blocks
  useEffect(() => {
    const fadeEls = document.querySelectorAll<HTMLElement>(`.${styles.block}`);
    if (!fadeEls.length) return;

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            (e.target as HTMLElement).classList.add(styles.blockVisible);
            obs.unobserve(e.target);
          }
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.05 }
    );

    fadeEls.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const scrollToSection = useCallback((id: string) => {
    const el = document.getElementById(`section-${id}`);
    if (!el) return;
    const navHeight = parseInt(
      getComputedStyle(document.documentElement).getPropertyValue("--nav-height") || "60",
      10
    );
    const top = el.getBoundingClientRect().top + window.scrollY - navHeight - 24;
    window.scrollTo({ top, behavior: "smooth" });
  }, []);

  // Group consecutive images within the same section into an image grid
  const renderBody = () => {
    if (!project.contentBlocks) return null;

    const elements: React.ReactNode[] = [];
    let currentSectionId = "";

    // Buffer consecutive images
    let imgBuffer: { block: ContentBlock; i: number }[] = [];

    const flushImages = () => {
      if (imgBuffer.length === 0) return;
      if (imgBuffer.length === 1) {
        const { block, i } = imgBuffer[0];
        elements.push(
          <div key={i} className={styles.block}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={block.src ?? (block.content as string)}
              alt={block.alt ?? ""}
              className={styles.mediaImage}
              loading="lazy"
            />
          </div>
        );
      } else {
        elements.push(
          <div key={`grid-${imgBuffer[0].i}`} className={`${styles.block} ${styles.imageGrid}`}>
            {imgBuffer.map(({ block, i }) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={block.src ?? (block.content as string)}
                alt={block.alt ?? ""}
                className={styles.mediaImageGrid}
                loading="lazy"
              />
            ))}
          </div>
        );
      }
      imgBuffer = [];
    };

    project.contentBlocks.forEach((block, i) => {
      // Section change — flush image buffer first, then inject divider
      if (block.sectionId && block.sectionId !== currentSectionId) {
        flushImages();
        currentSectionId = block.sectionId;
        const section = project.sections?.find((s) => s.id === block.sectionId);
        if (section) {
          elements.push(
            <div
              key={`divider-${section.id}`}
              id={`section-${section.id}`}
              className={styles.sectionDivider}
            >
              <span className={styles.sectionDividerLine} />
              <span className={styles.sectionLabel}>{section.label}</span>
              <span className={styles.sectionDividerLine} />
            </div>
          );
          // Render context table right after the context divider
          if (section.id === "context" && (project.team || project.role || project.timeline)) {
            elements.push(
              <div key="context-table" className={styles.contextTable}>
                {project.team && (
                  <div className={styles.contextCell}>
                    <span className={styles.contextLabel}>Team</span>
                    <span className={styles.contextValue}>{project.team}</span>
                  </div>
                )}
                {project.role && (
                  <div className={styles.contextCell}>
                    <span className={styles.contextLabel}>My Role</span>
                    <span className={styles.contextValue}>{project.role}</span>
                  </div>
                )}
                {project.timeline && (
                  <div className={styles.contextCell}>
                    <span className={styles.contextLabel}>Timeline</span>
                    <span className={styles.contextValue}>{project.timeline}</span>
                  </div>
                )}
              </div>
            );
            // TL;DR label above first block
            elements.push(
              <p key="tldr-label" className={styles.tldrLabel}>TL;DR</p>
            );
          }
        }
      }

      // Buffer images, flush everything else
      if (block.type === "image") {
        imgBuffer.push({ block, i });
      } else {
        flushImages();
        const blockEl = renderBlock(block, i);
        if (blockEl) {
          elements.push(
            <div key={i} className={styles.block}>
              {blockEl}
            </div>
          );
        }
      }
    });

    flushImages(); // flush any trailing images
    return elements;
  };

  const renderBlock = (block: ContentBlock, i: number): React.ReactNode => {
    switch (block.type) {
      case "paragraph":
        return <p className={styles.paragraph}>{block.content as string}</p>;

      case "heading":
        return <h2 className={styles.heading}>{block.content as string}</h2>;

      case "quote":
        return (
          <blockquote className={styles.quote}>
            {block.content as string}
          </blockquote>
        );

      case "bulletList":
        return (
          <ul className={styles.list}>
            {(block.content as string[]).map((item, j) => (
              <li key={j} className={styles.listItem}>
                {item}
              </li>
            ))}
          </ul>
        );

      case "video":
        return (
          <div className={styles.videoWrapper}>
            <video
              src={block.src ?? (block.content as string)}
              controls
              className={styles.mediaVideo}
              playsInline
            />
          </div>
        );

      case "youtube":
      case "link": {
        const url = block.content as string;
        if (!url || url === "FIGMA_EMBED_URL_PLACEHOLDER") return null;
        const ytMatch = url.match(
          /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/
        );
        if (ytMatch?.[1]) {
          return (
            <div className={styles.videoWrapper}>
              <iframe
                src={`https://www.youtube.com/embed/${ytMatch[1]}?autoplay=0&controls=1&modestbranding=1&rel=0`}
                title="YouTube video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className={styles.iframe}
              />
            </div>
          );
        }
        return (
          <a href={url} target="_blank" rel="noopener noreferrer" className={styles.externalLink}>
            View ↗
          </a>
        );
      }

      case "figma": {
        const url = block.content as string;
        if (url === "FIGMA_EMBED_URL_PLACEHOLDER") {
          return (
            <div className={styles.figmaPlaceholder}>
              <span>Figma prototype — add embed URL in digital-fatigue.json</span>
            </div>
          );
        }
        return (
          <div className={styles.figmaWrapper}>
            <iframe src={url} allowFullScreen className={styles.iframe} title="Figma prototype" />
          </div>
        );
      }

      case "researchLinks": {
        const links = block.links as { text: string; href: string }[];
        const label = block.label as string;
        return (
          <div className={styles.researchLinks}>
            <span className={styles.researchLabel}>{label}:</span>
            {links.map((link, j) => (
              <span key={j} className={styles.researchLinkItem}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.researchLinkAnchor}
                >
                  {link.text} ↗
                </a>
                {j < links.length - 1 && (
                  <span className={styles.researchDivider}> · </span>
                )}
              </span>
            ))}
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <main className={styles.container}>
      {/* ── Hero ─────────────────────────────── */}
      <section className={styles.hero}>
        <h1 className={styles.title}>{project.name}</h1>
        <div className={styles.heroBottom}>
          <div className={styles.tagRow}>
            {project.tags?.map((tag) => (
              <span key={tag} className={styles.tag}>{tag}</span>
            ))}
            {project.year && (
              <span className={styles.year}>{project.year}</span>
            )}
          </div>
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.liveLink}
            >
              View Live ↗
            </a>
          )}
        </div>
      </section>

      {/* ── Body: sidebar + content ───────────── */}
      <div className={styles.body}>
        {project.sections && project.sections.length > 0 && (
          <aside className={styles.sidebar}>
            <nav>
              {project.sections.map((section) => (
                <button
                  key={section.id}
                  className={`${styles.sidebarItem} ${
                    activeSection === section.id ? styles.sidebarItemActive : ""
                  }`}
                  onClick={() => scrollToSection(section.id)}
                >
                  {section.label}
                </button>
              ))}
            </nav>
          </aside>
        )}

        <article className={styles.content}>{renderBody()}</article>
      </div>

      {/* ── Prev / Next ───────────────────────── */}
      <footer className={styles.footerNav}>
        <Link href={`/projects/${prevProject.slug}`} className={styles.navLinkLeft}>
          <svg
            className={styles.navArrowSVG}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span className={styles.navText}>Previous</span>
        </Link>
        <Link href={`/projects/${nextProject.slug}`} className={styles.navLinkRight}>
          <span className={styles.navText}>Next</span>
          <svg
            className={styles.navArrowSVG}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </Link>
      </footer>
    </main>
  );
}
