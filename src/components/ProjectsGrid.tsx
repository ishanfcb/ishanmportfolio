"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import type { Project } from "@/data/projects";
import { useVideoVisibility, useVideoRetry } from "./hooks";
import { loadedMedia, requestLoad, cancelLoad, signalLoaded } from "./mediaLoadStore";
import styles from "./ProjectsGrid.module.css";
import cardStyles from "./Card.module.css";

const HIDDEN_TAGS = new Set(["Industry"]);

const PRESETS: { label: string; tags: string[] }[] = [
  { label: "All", tags: [] },
  { label: "Industry", tags: ["Industry"] },
];

function GridCard({
  project,
  onTagClick,
  activeTags,
  cardRef,
}: {
  project: Project;
  onTagClick: (tag: string) => void;
  activeTags: Set<string>;
  cardRef?: (el: HTMLDivElement | null) => void;
}) {
  const isVideo = /\.(mp4|webm|ogg)$/i.test(project.thumbnail);
  const alreadyLoaded = loadedMedia.has(project.thumbnail);
  const [canLoadMedia, setCanLoadMedia] = useState(alreadyLoaded);
  const [mediaLoaded, setMediaLoaded] = useState(alreadyLoaded);
  const [showConfidential, setShowConfidential] = useState(false);

  const [isHovered, setIsHovered] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });

  const lockRef = useRef<HTMLSpanElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  useVideoVisibility(videoRef, isVideo && canLoadMedia);

  const handleMouseEnter = (e: React.MouseEvent) => {
    setIsHovered(true);
    setCursorPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    setCursorPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  useEffect(() => {
    if (alreadyLoaded) return;
    const cb = () => setCanLoadMedia(true);
    requestLoad(cb);
    return () => cancelLoad(cb);
  }, [alreadyLoaded]);

  const { handleLoadedData, handleError } = useVideoRetry({
    videoRef,
    src: project.thumbnail,
    enabled: canLoadMedia && isVideo,
    onSuccess: () => { loadedMedia.add(project.thumbnail); signalLoaded(); setMediaLoaded(true); },
    onGiveUp: () => { signalLoaded(); },
  });

  const [imgKey, setImgKey] = useState(0);
  const imgRetries = useRef(0);
  const handleImageLoad = () => { loadedMedia.add(project.thumbnail); signalLoaded(); setMediaLoaded(true); };
  const handleImageError = () => {
    if (imgRetries.current < 2) {
      imgRetries.current++;
      setImgKey(k => k + 1);
    } else {
      signalLoaded();
    }
  };

  const showVideo = canLoadMedia && isVideo;
  const showImage = canLoadMedia && !isVideo;
  const thumbClass = `${cardStyles.thumbnail} ${mediaLoaded ? cardStyles.thumbnailLoaded : ""}`;

  const thumbnailContent = (
    <>
      <div
        className={`${cardStyles.thumbnailWrap} ${mediaLoaded ? cardStyles.thumbnailWrapLoaded : ""} ${project.locked ? cardStyles.thumbnailWrapLocked : ""}`}
        data-hide-cursor="true"
        onMouseEnter={handleMouseEnter}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {showVideo && (
          <video
            ref={videoRef}
            src={project.thumbnail}
            loop
            muted
            playsInline
            preload="metadata"
            tabIndex={-1}
            className={thumbClass}
            onLoadedData={handleLoadedData}
            onError={handleError}
          />
        )}
        {showImage && (
          <img
            key={imgKey}
            src={project.thumbnail}
            alt={`${project.name} thumbnail`}
            width={project.width}
            height={project.height}
            className={thumbClass}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        )}
        {/* Hover Description Overlay on Thumbnail */}
        <div className={cardStyles.gridHoverOverlay}>
          <p className={cardStyles.gridHoverDescription}>{project.description}</p>
        </div>

        {/* Dynamic Cursor Pill Badge: VIEW MORE */}
        {isHovered && (
          <div
            className={cardStyles.cursorViewMoreBadge}
            style={{
              left: `${cursorPos.x}px`,
              top: `${cursorPos.y}px`,
            }}
          >
            VIEW MORE
          </div>
        )}

        {project.locked && (
          <div className={cardStyles.lockedOverlay}>
            <span ref={lockRef} className={cardStyles.lockIcon}>&#x1F512;</span>
            {showConfidential && <span className={cardStyles.confidentialText}>Confidential</span>}
          </div>
        )}
      </div>
      <div className={cardStyles.cardInfo}>
        <span className={cardStyles.cardName}>{project.name}</span>
        <span className={cardStyles.cardYear}>{project.year}</span>
      </div>
    </>
  );

  return (
    <div ref={cardRef} className={cardStyles.card}>
      {project.locked ? (
        <div
          className={`${cardStyles.cardLink} ${cardStyles.cardLocked}`}
          onClick={() => {
            setShowConfidential(true);
            setTimeout(() => setShowConfidential(false), 2000);
            const el = lockRef.current;
            if (el) {
              el.classList.remove(cardStyles.lockWiggle);
              void el.offsetWidth;
              el.classList.add(cardStyles.lockWiggle);
            }
          }}
        >
          {thumbnailContent}
        </div>
      ) : (
        <Link
          href={`/projects/${project.slug}`}
          className={cardStyles.cardLink}
          onClick={() => {
            sessionStorage.setItem("navigated-from-landing", "true");
            window.umami?.track("project-click", { project: project.slug });
          }}
        >
          {thumbnailContent}
        </Link>
      )}
      <div className={cardStyles.cardTags}>
        {project.tags
          .filter((t) => !HIDDEN_TAGS.has(t))
          .map((tag) => {
            const isActive = activeTags.has(tag);
            return (
              <button
                key={tag}
                className={`${cardStyles.cardTag} ${isActive ? cardStyles.cardTagActive : ""}`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onTagClick(tag);
                }}
              >
                {tag}
              </button>
            );
          })}
      </div>
    </div>
  );
}

export default function ProjectsGrid({ projects }: { projects: Project[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [hoveredProject, setHoveredProject] = useState<Project | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const gridRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const allTags = useMemo(() => {
    const set = new Set<string>();
    for (const p of projects) {
      for (const t of p.tags) {
        if (!HIDDEN_TAGS.has(t)) set.add(t);
      }
    }
    return Array.from(set).sort();
  }, [projects]);

  const activeTags = useMemo(() => {
    const raw = searchParams.get("tags");
    if (!raw) return new Set<string>();
    const valid = raw.split(",").filter((t) => allTags.includes(t));
    return new Set(valid);
  }, [searchParams, allTags]);

  const activePreset = useMemo(() => {
    if (activeTags.size === 0) return "All";
    for (const preset of PRESETS) {
      if (preset.tags.length === 0) continue;
      const allInPreset =
        preset.tags.every((t) => activeTags.has(t)) &&
        activeTags.size === preset.tags.length;
      if (allInPreset) return preset.label;
    }
    return null;
  }, [activeTags]);

  const updateTags = useCallback(
    (newTags: Set<string>) => {
      const params = new URLSearchParams(searchParams.toString());
      if (newTags.size === 0) {
        params.delete("tags");
      } else {
        params.set("tags", [...newTags].join(","));
      }
      const qs = params.toString();
      router.replace(`/projects${qs ? `?${qs}` : ""}`, { scroll: false });
    },
    [searchParams, router]
  );

  const toggleTag = useCallback(
    (tag: string) => {
      window.umami?.track("tag-click", { tag });
      if (activeTags.has(tag) && activeTags.size === 1) {
        updateTags(new Set());
      } else {
        updateTags(new Set([tag]));
      }
    },
    [activeTags, updateTags]
  );

  const applyPreset = useCallback(
    (preset: (typeof PRESETS)[number]) => {
      window.umami?.track("preset-click", { preset: preset.label });
      if (preset.tags.length === 0) {
        updateTags(new Set());
      } else {
        updateTags(new Set(preset.tags));
      }
    },
    [updateTags]
  );

  const filtered = useMemo(() => {
    if (activeTags.size === 0) return projects;
    return projects.filter((p) => p.tags.some((t) => activeTags.has(t)));
  }, [projects, activeTags]);

  const handleRowHover = (p: Project, e: React.MouseEvent) => {
    setHoveredProject(p);
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleRowLeave = () => {
    setHoveredProject(null);
  };

  const handleRowMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  const [showAllTags, setShowAllTags] = useState(false);
  const visibleTags = showAllTags ? allTags : allTags.slice(0, 12);

  return (
    <div className={styles.container}>
      <div className={styles.filterBar}>
        <div className={styles.presetsRow}>
          <div className={styles.presets}>
            {PRESETS.map((preset) => (
              <button
                key={preset.label}
                className={`${styles.presetBtn} ${activePreset === preset.label ? styles.presetActive : ""}`}
                onClick={() => applyPreset(preset)}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.tagsRow}>
          <div className={styles.tagsGroup}>
            {visibleTags.map((tag) => (
              <button
                key={tag}
                className={`${styles.tagBtn} ${activeTags.has(tag) ? styles.tagActive : ""}`}
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </button>
            ))}
            {allTags.length > 12 && (
              <button
                className={styles.tagBtn}
                onClick={() => setShowAllTags(!showAllTags)}
              >
                {showAllTags ? "Less" : `+${allTags.length - 12} more`}
              </button>
            )}
          </div>

          <div className={styles.viewToggle}>
            <button
              className={`${styles.viewBtn} ${viewMode === "grid" ? styles.viewBtnActive : ""}`}
              onClick={() => setViewMode("grid")}
            >
              GRID
            </button>
            <button
              className={`${styles.viewBtn} ${viewMode === "list" ? styles.viewBtnActive : ""}`}
              onClick={() => setViewMode("list")}
            >
              LIST
            </button>
          </div>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === "grid" && (
        <div ref={gridRef} className={styles.grid}>
          {filtered.map((project) => (
            <GridCard
              key={project.slug}
              project={project}
              onTagClick={toggleTag}
              activeTags={activeTags}
              cardRef={(el) => {
                if (el) cardRefs.current.set(project.slug, el);
                else cardRefs.current.delete(project.slug);
              }}
            />
          ))}
        </div>
      )}

      {/* List View */}
      {viewMode === "list" && (
        <div className={styles.listView}>
          <div className={styles.listHeader}>
            <span>#</span>
            <span>TITLE</span>
            <span>TYPE</span>
            <span className={styles.listYear}>YEAR</span>
          </div>

          {filtered.map((project, index) => {
            const indexStr = (index + 1).toString().padStart(2, "0");
            const tagsStr = project.tags.filter(t => !HIDDEN_TAGS.has(t)).slice(0, 3).join(" / ").toUpperCase();

            return (
              <Link
                key={project.slug}
                href={`/projects/${project.slug}`}
                className={styles.listRow}
                data-hide-cursor="true"
                onMouseEnter={(e) => handleRowHover(project, e)}
                onMouseLeave={handleRowLeave}
                onMouseMove={handleRowMove}
              >
                <span className={styles.listIndex}>{indexStr}</span>
                <span className={styles.listTitle}>{project.name}</span>
                <span className={styles.listTags}>{tagsStr}</span>
                <span className={styles.listYear}>{project.year}</span>
              </Link>
            );
          })}
        </div>
      )}

      {/* Floating Image Preview on Hover in List View */}
      {viewMode === "list" && hoveredProject && (
        <div
          className={styles.floatingPreview}
          style={{
            left: `${mousePos.x}px`,
            top: `${mousePos.y}px`,
          }}
        >
          {hoveredProject.thumbnail.endsWith(".mp4") ? (
            <video
              src={hoveredProject.thumbnail}
              autoPlay
              loop
              muted
              playsInline
              className={styles.previewMedia}
            />
          ) : (
            <img
              src={hoveredProject.thumbnail}
              alt={hoveredProject.name}
              className={styles.previewMedia}
            />
          )}
        </div>
      )}
    </div>
  );
}