"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./ProjectDetail.module.css";
import Link from "next/link";

interface SubSection {
  id: string;
  label: string;
}

interface ProjectSection {
  id: string;
  label: string;
  subsections?: SubSection[];
}

interface ContentBlock {
  type: string;
  sectionId?: string;
  subSectionId?: string;
  content?: string | string[];
  src?: string;
  alt?: string;
  label?: string;
  caption?: string;
  links?: { text: string; href: string }[];
}

interface ProjectData {
  name: string;
  description?: string;
  tags?: string[];
  year?: number | string;
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
  const [isNavHovered, setIsNavHovered] = useState(false);
  const [activeSection, setActiveSection] = useState<string>(
    project.sections?.[0]?.id ?? ""
  );
  const [showStickyTitle, setShowStickyTitle] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const thumbnailRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const galleryImages = (project.contentBlocks || [])
    .filter((block) => block.type === "image" && block.src)
    .map((block) => ({
      src: block.src!,
      alt: block.alt ?? "",
      caption: block.caption || block.label,
    }));

  const handlePrevLightboxImage = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (lightboxIndex === null || galleryImages.length === 0) return;
    setLightboxIndex((prev) =>
      prev !== null ? (prev - 1 + galleryImages.length) % galleryImages.length : 0
    );
  };

  const handleNextLightboxImage = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (lightboxIndex === null || galleryImages.length === 0) return;
    setLightboxIndex((prev) =>
      prev !== null ? (prev + 1) % galleryImages.length : 0
    );
  };

  // Lightbox keyboard navigation, body scroll lock
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === "Escape") {
        setLightboxIndex(null);
      } else if (e.key === "ArrowLeft") {
        handlePrevLightboxImage();
      } else if (e.key === "ArrowRight") {
        handleNextLightboxImage();
      }
    };
    if (lightboxIndex !== null) {
      document.body.style.overflow = "hidden";
      document.body.classList.add("lightbox-open");
    } else {
      document.body.style.overflow = "";
      document.body.classList.remove("lightbox-open");
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      document.body.classList.remove("lightbox-open");
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [lightboxIndex, galleryImages.length]);

  useEffect(() => {
    if (lightboxIndex !== null && thumbnailRefs.current[lightboxIndex]) {
      thumbnailRefs.current[lightboxIndex]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [lightboxIndex]);
  const [showSidebarNav, setShowSidebarNav] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  const heroRef = useRef<HTMLElement>(null);
  const observersRef = useRef<IntersectionObserver[]>([]);

  // Scroll listener for sticky header title & progress bar
  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        const pastTitleMeta = rect.top < -100 || window.scrollY > 160;
        setShowStickyTitle(pastTitleMeta);
        if (pastTitleMeta) {
          document.body.classList.add("past-project-hero");
        } else {
          document.body.classList.remove("past-project-hero");
        }

        // Show sidebar nav ONLY when the Overview section moves up to the upper viewport (Image 2 state)
        const overviewEl = document.getElementById("section-overview") || document.querySelector(`.${styles.sectionDivider}`);
        if (overviewEl) {
          const overviewRect = overviewEl.getBoundingClientRect();
          setShowSidebarNav(overviewRect.top <= 220);
        } else if (heroRef.current) {
          const heroRect = heroRef.current.getBoundingClientRect();
          setShowSidebarNav(heroRect.bottom <= 80);
        }
      }

      const documentHeight = document.documentElement.scrollHeight;
      const maxScroll = documentHeight - window.innerHeight;
      const progress =
        maxScroll > 0
          ? Math.min(100, Math.max(0, (window.scrollY / maxScroll) * 100))
          : 0;
      setScrollProgress(progress);
    };

    document.body.classList.add("is-project-page");
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.body.classList.remove("past-project-hero");
      document.body.classList.remove("is-project-page");
    };
  }, []);

  // Scroll-track active sidebar section
  useEffect(() => {
    if (!project.sections || project.sections.length === 0) return;

    observersRef.current.forEach((o) => o.disconnect());
    observersRef.current = [];

    const intersecting = new Map<string, boolean>();

    const sync = () => {
      for (const section of project.sections!) {
        if (section.subsections) {
          for (const sub of section.subsections) {
            if (intersecting.get(sub.id)) {
              setActiveSection(sub.id);
              return;
            }
          }
        }
        if (intersecting.get(section.id)) {
          setActiveSection(section.id);
          return;
        }
      }
    };

    project.sections.forEach((section) => {
      const allIds = [section.id, ...(section.subsections?.map((sub) => sub.id) || [])];
      allIds.forEach((id) => {
        const el = document.getElementById(`section-${id}`);
        if (!el) return;

        const obs = new IntersectionObserver(
          ([entry]) => {
            intersecting.set(id, entry.isIntersecting);
            sync();
          },
          { rootMargin: "0px 0px -60% 0px", threshold: 0 }
        );
        obs.observe(el);
        observersRef.current.push(obs);
      });
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
            e.target.classList.add(styles.blockVisible);
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.08 }
    );
    fadeEls.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(`section-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Render content blocks, wrapping first block of each section with section anchor + context data if available
  const renderBody = () => {
    if (!project.contentBlocks || project.contentBlocks.length === 0) return null;

    const elements: React.ReactNode[] = [];
    const seenSections = new Set<string>();
    let imgBuffer: { block: ContentBlock; i: number }[] = [];

    const flushImages = () => {
      if (imgBuffer.length === 0) return;

      if (imgBuffer.length === 1) {
        const { block, i } = imgBuffer[0];
        const captionText = block.caption || block.label;
        elements.push(
          <div key={i} className={`${styles.block} ${styles.singleImageBlock}`}>
            <figure
              className={`${styles.imageFigure} ${styles.singleImageFigure}`}
              onClick={(e) => {
                e.stopPropagation();
                const gIdx = galleryImages.findIndex((g) => g.src === block.src);
                setLightboxIndex(gIdx !== -1 ? gIdx : 0);
              }}
            >
              <img
                src={block.src}
                alt={block.alt ?? ""}
                className={`${styles.mediaImage} ${styles.clickableImage}`}
                loading="lazy"
              />
              {captionText && (
                <figcaption className={styles.imageCaption}>
                  {captionText}
                </figcaption>
              )}
            </figure>
          </div>
        );
      } else {
        const key = `img-grid-${imgBuffer[0].i}`;
        elements.push(
          <div key={key} className={`${styles.block} ${styles.imageGrid}`}>
            {imgBuffer.map(({ block, i }, idx) => {
              const captionText = block.caption || block.label;
              const isFullWidthRow =
                imgBuffer.length === 3 && idx === 2;
              return (
                <figure
                  key={i}
                  className={`${styles.imageFigure} ${
                    isFullWidthRow ? styles.fullWidthGridFigure : ""
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    const gIdx = galleryImages.findIndex((g) => g.src === block.src);
                    setLightboxIndex(gIdx !== -1 ? gIdx : 0);
                  }}
                >
                  <img
                    src={block.src}
                    alt={block.alt ?? ""}
                    className={`${styles.mediaImageGrid} ${styles.clickableImage}`}
                    loading="lazy"
                  />
                  {captionText && (
                    <figcaption className={styles.imageCaption}>
                      {captionText}
                    </figcaption>
                  )}
                </figure>
              );
            })}
          </div>
        );
      }
      imgBuffer = [];
    };

    project.contentBlocks.forEach((block, i) => {
      const sectionId = block.sectionId;
      const subSectionId = block.subSectionId;

      // Skip "context" section in body as it is rendered in top hero viewport
      if (sectionId === "context") return;

      // Section level anchor element
      if (sectionId && !seenSections.has(sectionId)) {
        seenSections.add(sectionId);
        flushImages();
        elements.push(
          <div
            key={`anchor-${sectionId}`}
            id={`section-${sectionId}`}
            className={styles.sectionAnchor}
          />
        );

        const secObj = project.sections?.find((s) => s.id === sectionId);
        if (secObj && sectionId !== "context") {
          elements.push(
            <div key={`divider-${sectionId}`} className={styles.sectionDivider}>
              <span className={styles.sectionDividerTag}>{secObj.label}</span>
            </div>
          );
        }
      }

      // Subsection level anchor element for index scrolling
      if (subSectionId && !seenSections.has(subSectionId)) {
        seenSections.add(subSectionId);
        flushImages();
        elements.push(
          <div
            key={`anchor-${subSectionId}`}
            id={`section-${subSectionId}`}
            className={styles.sectionAnchor}
          />
        );
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

    flushImages();
    return elements;
  };

  const renderBlock = (block: ContentBlock, i: number): React.ReactNode => {
    switch (block.type) {
      case "paragraph":
        return <p className={styles.paragraph}>{block.content as string}</p>;

      case "heading":
        return <h2 className={styles.heading}>{block.content as string}</h2>;

      case "subheading":
        return <h3 className={styles.subheading}>{block.content as string}</h3>;

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
                  <span className={styles.researchDivider}> — </span>
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
      {/* Top sticky blur mask + centered project title with progress bar & back link */}
      <div
        className={`${styles.topStickyHeader} ${
          showStickyTitle ? styles.topStickyHeaderVisible : ""
        }`}
        aria-hidden={!showStickyTitle}
      >
        <div className={styles.topBlurMask} />
        <Link href="/projects" className={styles.stickyBackLink}>
          <svg
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={styles.stickyBackIcon}
            aria-hidden="true"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span>back</span>
        </Link>
        <div className={styles.stickyTitleWrapper}>
          <span className={styles.stickyProjectTitle}>{project.name}</span>
          <div className={styles.progressBarTrack}>
            <div
              className={styles.progressBarFill}
              style={{ width: `${scrollProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Hero */}
      {/* Hero Section — Figma 12-Column Grid (Margin: 72px, Gutter: 20px) */}
      {/* Hero Section — Figma 12-Column Grid (Margin: 72px, Gutter: 20px) */}
      {/* Hero Section — Figma 12-Column Grid (Margin: 72px, Gutter: 20px) */}
      <section className={styles.heroViewportGrid} ref={heroRef}>
        {/* Left 6 Columns (Columns 1–6): Top Block + Bottom TL;DR Block */}
        <div className={styles.heroLeftCol}>
          {/* Top Block: Title + Tags + Divider + 3-Column Metadata Table (Moved UP) */}
          <div className={styles.heroTopBlock}>
            <h1 className={styles.heroTitle}>{project.name}</h1>
            <div className={styles.heroTagsRow}>
              {project.tags?.map((tag) => (
                <span key={tag} className={styles.heroTagPill}>{tag}</span>
              ))}
              {project.year && (
                <span className={styles.heroYear}>{project.year}</span>
              )}
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.heroLiveLink}
                >
                  View Live ↗
                </a>
              )}
            </div>

            <div className={styles.heroDividerLine} />

            {/* 3-Column Metadata Table */}
            {(project.team || project.role || project.timeline) && (
              <div className={styles.heroMetaGrid}>
                {project.team && (
                  <div className={styles.heroMetaCol}>
                    <span className={styles.heroMetaLabel}>TEAM</span>
                    <span className={styles.heroMetaValue}>{project.team}</span>
                  </div>
                )}
                {project.role && (
                  <div className={styles.heroMetaCol}>
                    <span className={styles.heroMetaLabel}>MY ROLE</span>
                    <span className={styles.heroMetaValue}>{project.role}</span>
                  </div>
                )}
                {project.timeline && (
                  <div className={styles.heroMetaCol}>
                    <span className={styles.heroMetaLabel}>TIMELINE</span>
                    <span className={styles.heroMetaValue}>{project.timeline}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bottom Block: TL;DR Summary Block (Bottom-aligned) */}
          {project.description && (
            <div className={styles.heroBottomBlock}>
              <div className={styles.heroTldrBlock}>
                <span className={styles.heroTldrLabel}>TL;DR</span>
                <div className={styles.heroTldrQuote}>
                  <p className={styles.heroTldrText}>{project.description}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right 6 Columns (Columns 7–12): Featured Hero Media */}
        <div className={styles.heroRightCol}>
          {(project as any).thumbnail ? (
            <div className={styles.heroMediaWrapper}>
              <img
                src={(project as any).thumbnail}
                alt={project.name}
                className={styles.heroMediaImg}
              />
            </div>
          ) : (
            <div className={styles.heroMediaPlaceholder} />
          )}
        </div>
      </section>

      {/* Body: sidebar + content */}
      <div className={styles.body}>
        {project.sections && project.sections.filter((s) => s.id !== "context").length > 0 && (
          <aside
            className={`${styles.sidebarNavContainer} ${
              showSidebarNav ? styles.sidebarNavContainerVisible : ""
            } ${isNavHovered ? styles.sidebarNavContainerHovered : ""}`}
            onMouseEnter={() => setIsNavHovered(true)}
            onMouseLeave={() => setIsNavHovered(false)}
            aria-label="Section navigation"
          >
            <nav className={styles.sidebarNavTrack}>
              {project.sections
                .filter((s) => s.id !== "context")
                .map((section) => {
                const isDirectActive = activeSection === section.id;
                const isChildActive = section.subsections?.some((sub) => sub.id === activeSection);
                const isParentEmphasized = isDirectActive || isChildActive;

                return (
                  <div key={section.id} className={styles.sidebarNavGroup}>
                    <button
                      className={`${styles.sidebarNavItem} ${
                        isParentEmphasized ? styles.sidebarNavItemActive : ""
                      }`}
                      onClick={() => scrollToSection(section.id)}
                    >
                      <span className={styles.tickLine} />
                      <span className={styles.sidebarNavLabel}>{section.label}</span>
                    </button>
                    {section.subsections && section.subsections.length > 0 && (
                      <div className={styles.sidebarSubGroup}>
                        {section.subsections.map((sub) => {
                          const isSubActive = activeSection === sub.id;
                          return (
                            <button
                              key={sub.id}
                              className={`${styles.sidebarNavItem} ${styles.sidebarSubNavItem} ${
                                isSubActive ? styles.sidebarNavItemActive : ""
                              }`}
                              onClick={() => scrollToSection(sub.id)}
                            >
                              <span className={`${styles.tickLine} ${styles.subTickLine}`} />
                              <span className={styles.sidebarNavLabel}>{sub.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </aside>
        )}

        <article className={styles.content}>
          {renderBody()}

          {/* Prev / Next Navigation aligned directly with gallery content */}
          <div className={styles.footerNav}>
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
              <span className={styles.navText}>{prevProject.name}</span>
            </Link>
            <Link href={`/projects/${nextProject.slug}`} className={styles.navLinkRight}>
              <span className={styles.navText}>{nextProject.name}</span>
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
          </div>
        </article>
      </div>

      {/* Scroll to Top button (Red Spot: bottom 28px, right 28px) */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={`${styles.scrollTopBtn} ${
          showStickyTitle ? styles.scrollTopBtnVisible : ""
        }`}
        aria-label="Scroll to top"
      >
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="18 15 12 9 6 15" />
        </svg>
      </button>

      {/* Lightbox Modal Overlay */}
      {lightboxIndex !== null && galleryImages[lightboxIndex] && (
        <div
          className={styles.lightboxOverlay}
          onClick={() => setLightboxIndex(null)}
          role="dialog"
          aria-modal="true"
        >
          <button
            className={styles.lightboxCloseBtn}
            onClick={() => setLightboxIndex(null)}
            aria-label="Close image preview"
          >
            &#x2715;
          </button>

          {galleryImages.length > 1 && (
            <div className={styles.lightboxCounter}>
              {lightboxIndex + 1} / {galleryImages.length}
            </div>
          )}

          {galleryImages.length > 1 && (
            <button
              className={`${styles.lightboxNavBtn} ${styles.lightboxNavBtnLeft}`}
              onClick={handlePrevLightboxImage}
              aria-label="Previous image"
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          )}

          <div
            className={styles.lightboxContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.lightboxImageWrapper}>
              <img
                src={galleryImages[lightboxIndex].src}
                alt={galleryImages[lightboxIndex].alt}
                className={styles.lightboxImage}
              />
            </div>

            {galleryImages[lightboxIndex].caption && (
              <p className={styles.lightboxCaption}>
                {galleryImages[lightboxIndex].caption}
              </p>
            )}
          </div>

          {galleryImages.length > 1 && (
            <div
              className={styles.lightboxThumbnailsTrack}
              onClick={(e) => e.stopPropagation()}
            >
              {galleryImages.map((img, idx) => {
                const isActive = idx === lightboxIndex;
                return (
                  <button
                    key={idx}
                    ref={(el) => {
                      thumbnailRefs.current[idx] = el;
                    }}
                    className={`${styles.lightboxThumbBtn} ${
                      isActive ? styles.lightboxThumbBtnActive : ""
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setLightboxIndex(idx);
                    }}
                    aria-label={`View image ${idx + 1}`}
                  >
                    <img
                      src={img.src}
                      alt={img.alt}
                      className={styles.lightboxThumbImg}
                    />
                  </button>
                );
              })}
            </div>
          )}

          {galleryImages.length > 1 && (
            <button
              className={`${styles.lightboxNavBtn} ${styles.lightboxNavBtnRight}`}
              onClick={handleNextLightboxImage}
              aria-label="Next image"
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          )}
        </div>
      )}
    </main>
  );
}
