"use client";

import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import { useRouter } from "next/navigation";
import { projectsArray } from "@/data/projects";
import { siteIndex } from "@/data/siteIndex";
import styles from "./CommandPalette.module.css";

// ─── Static data ─────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "Projects", href: "/projects" },
  { label: "Photographs", href: "/photographs" },
  { label: "About", href: "/about" },
];

// Unique tags from projects (exclude internal "Industry" tag)
const ALL_TAGS = Array.from(
  new Set(
    projectsArray.flatMap((p) => p.tags).filter((t) => t !== "Industry")
  )
).sort();

// ─── Types ────────────────────────────────────────────────────────────────────

type ResultItem =
  | { kind: "nav"; label: string; href: string }
  | { kind: "project"; label: string; href: string; meta: string }
  | { kind: "tag"; label: string; href: string }
  | { kind: "site"; label: string; href: string; meta: string };

// ─── Icons ───────────────────────────────────────────────────────────────────

function IconSearch({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.2" />
      <line x1="10" y1="10" x2="14" y2="14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="square" />
    </svg>
  );
}

function IconArrow({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.1" strokeLinecap="square" strokeLinejoin="miter" />
    </svg>
  );
}

function IconTag({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M2 2h4l4 4-4 4-4-4V2z" stroke="currentColor" strokeWidth="1.1" strokeLinecap="square" strokeLinejoin="miter" />
    </svg>
  );
}

function IconPage({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <rect x="2" y="1" width="8" height="10" rx="0" stroke="currentColor" strokeWidth="1.1" />
      <line x1="4" y1="4" x2="8" y2="4" stroke="currentColor" strokeWidth="1" />
      <line x1="4" y1="6.5" x2="8" y2="6.5" stroke="currentColor" strokeWidth="1" />
      <line x1="4" y1="9" x2="6.5" y2="9" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

function IconSection({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <line x1="2" y1="3" x2="10" y2="3" stroke="currentColor" strokeWidth="1.1" strokeLinecap="square" />
      <line x1="2" y1="6" x2="8" y2="6" stroke="currentColor" strokeWidth="1.1" strokeLinecap="square" />
      <line x1="2" y1="9" x2="6" y2="9" stroke="currentColor" strokeWidth="1.1" strokeLinecap="square" />
    </svg>
  );
}

// ─── OS-aware modifier key label ─────────────────────────────────────────────

function useModKey() {
  const [isMac, setIsMac] = useState(false);
  useEffect(() => {
    setIsMac(/mac|iphone|ipad|ipod/i.test(navigator.userAgent));
  }, []);
  return isMac ? "⌘" : "Ctrl";
}

// ─── Command Palette ──────────────────────────────────────────────────────────

export default function CommandPalette() {
  const router = useRouter();
  const modKey = useModKey();

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // ── Open / close ─────────────────────────────────────────────────────────

  const openPalette = useCallback(() => {
    setOpen(true);
    setQuery("");
    setActiveIndex(0);
  }, []);

  const closePalette = useCallback(() => {
    setOpen(false);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 30);
      return () => clearTimeout(t);
    }
  }, [open]);

  // ── Global keyboard shortcut: Ctrl/Cmd + Shift ────────────────────────────

  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;

      if (mod && e.shiftKey && !e.altKey) {
        e.preventDefault();
        openPalette();
        return;
      }

      if (!open) return;

      if (e.key === "Escape") {
        e.preventDefault();
        closePalette();
      }
    };

    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [open, openPalette, closePalette]);

  // ── Hide JourneyCursor while palette is open ──────────────────────────────

  useEffect(() => {
    const svg = document.querySelector<SVGSVGElement>('[aria-hidden="true"][style*="mixBlendMode"]') as SVGSVGElement | null;
    if (!svg) return;
    svg.style.opacity = open ? "0" : "";
  }, [open]);

  // ── Filter results ────────────────────────────────────────────────────────

  const results = useMemo<ResultItem[]>(() => {
    const q = query.trim().toLowerCase();

    const matchNav = NAV_ITEMS.filter((n) =>
      n.label.toLowerCase().includes(q)
    ).map<ResultItem>((n) => ({ kind: "nav", label: n.label, href: n.href }));

    const matchProjects = projectsArray
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q)) ||
          p.description.toLowerCase().includes(q)
      )
      .map<ResultItem>((p) => ({
        kind: "project",
        label: p.name,
        href: `/projects/${p.slug}`,
        meta: String(p.year),
      }));

    const matchTags = ALL_TAGS.filter((t) =>
      t.toLowerCase().includes(q)
    ).map<ResultItem>((t) => ({
      kind: "tag",
      label: t,
      href: `/projects?tags=${encodeURIComponent(t)}`,
    }));

    // Site-wide content index: match against label AND keyword list
    const matchSite = siteIndex
      .filter((entry) => {
        const labelMatch = entry.label.toLowerCase().includes(q);
        const keywordMatch = entry.keywords.some((k) =>
          k.toLowerCase().includes(q)
        );
        return labelMatch || keywordMatch;
      })
      // De-duplicate: skip site entries whose href already appears in matchNav
      .filter((entry) => !matchNav.some((n) => n.href === entry.href))
      .map<ResultItem>((entry) => ({
        kind: "site",
        label: entry.label,
        href: entry.href,
        meta: entry.section,
      }));

    return [...matchNav, ...matchProjects, ...matchTags, ...matchSite];
  }, [query]);

  // Reset active index when results change
  useEffect(() => {
    setActiveIndex(0);
  }, [results]);

  // ── Arrow key navigation ──────────────────────────────────────────────────

  const handleInputKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, results.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter" && results[activeIndex]) {
        e.preventDefault();
        router.push(results[activeIndex].href);
        closePalette();
      }
    },
    [results, activeIndex, router, closePalette]
  );

  // Scroll active item into view
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const el = list.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  // ── Navigate on item click ────────────────────────────────────────────────

  const handleSelect = useCallback(
    (href: string) => {
      router.push(href);
      closePalette();
    },
    [router, closePalette]
  );

  // ── Grouped results ───────────────────────────────────────────────────────

  const grouped = useMemo(() => {
    const nav = results.filter((r) => r.kind === "nav");
    const projects = results.filter((r) => r.kind === "project");
    const tags = results.filter((r) => r.kind === "tag");
    const site = results.filter((r) => r.kind === "site");
    return { nav, projects, tags, site };
  }, [results]);

  // Flat absolute index offsets for keyboard navigation
  const navOffset = 0;
  const projectOffset = grouped.nav.length;
  const tagOffset = grouped.nav.length + grouped.projects.length;
  const siteOffset = grouped.nav.length + grouped.projects.length + grouped.tags.length;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Bottom-left trigger hint */}
      <div
        role="button"
        tabIndex={0}
        className={styles.trigger}
        onClick={openPalette}
        onKeyDown={(e) => e.key === "Enter" && openPalette()}
        aria-label="Open command palette"
        data-hide-cursor="true"
      >
        <span className={styles.triggerTitle}>Keyword Search?</span>
        <span className={styles.triggerSub}>ctrl+shift or cmd+shift</span>
      </div>

      {/* Backdrop */}
      <div
        className={`${styles.backdrop} ${open ? styles.visible : ""}`}
        onClick={closePalette}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className={`${styles.modal} ${open ? styles.visible : ""}`}
      >
        {/* Search row */}
        <div className={styles.searchRow}>
          <span className={styles.searchIcon}>
            <IconSearch size={15} />
          </span>
          <input
            ref={inputRef}
            type="text"
            className={styles.searchInput}
            placeholder="Search projects, pages, or keywords…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleInputKeyDown}
            spellCheck={false}
            autoComplete="off"
          />
          <span className={styles.escBadge}>esc</span>
        </div>

        {/* Results */}
        <div className={styles.results} ref={listRef} role="listbox">
          {results.length === 0 && (
            <div className={styles.empty}>No results found.</div>
          )}

          {/* Pages / Nav */}
          {grouped.nav.length > 0 && (
            <div className={styles.section}>
              <span className={styles.sectionLabel}>Pages</span>
              {grouped.nav.map((item, i) => {
                const absIdx = navOffset + i;
                return (
                  <button
                    key={item.href}
                    role="option"
                    aria-selected={absIdx === activeIndex}
                    data-index={absIdx}
                    className={`${styles.item} ${absIdx === activeIndex ? styles.active : ""}`}
                    onClick={() => handleSelect(item.href)}
                    onMouseEnter={() => setActiveIndex(absIdx)}
                  >
                    <span className={styles.itemLeft}>
                      <span className={styles.itemIcon}><IconPage /></span>
                      <span className={styles.itemLabel}>{item.label}</span>
                    </span>
                    <span className={styles.itemIcon}><IconArrow /></span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Projects */}
          {grouped.projects.length > 0 && (
            <>
              {grouped.nav.length > 0 && <div className={styles.divider} />}
              <div className={styles.section}>
                <span className={styles.sectionLabel}>Projects</span>
                {grouped.projects.map((item, i) => {
                  const absIdx = projectOffset + i;
                  return (
                    <button
                      key={item.href}
                      role="option"
                      aria-selected={absIdx === activeIndex}
                      data-index={absIdx}
                      className={`${styles.item} ${absIdx === activeIndex ? styles.active : ""}`}
                      onClick={() => handleSelect(item.href)}
                      onMouseEnter={() => setActiveIndex(absIdx)}
                    >
                      <span className={styles.itemLeft}>
                        <span className={styles.itemIcon}><IconArrow size={11} /></span>
                        <span className={styles.itemLabel}>{item.label}</span>
                      </span>
                      {"meta" in item && (
                        <span className={styles.itemMeta}>{item.meta}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* Keywords / Tags */}
          {grouped.tags.length > 0 && (
            <>
              {(grouped.nav.length > 0 || grouped.projects.length > 0) && (
                <div className={styles.divider} />
              )}
              <div className={styles.section}>
                <span className={styles.sectionLabel}>Keywords</span>
                {grouped.tags.map((item, i) => {
                  const absIdx = tagOffset + i;
                  return (
                    <button
                      key={item.href}
                      role="option"
                      aria-selected={absIdx === activeIndex}
                      data-index={absIdx}
                      className={`${styles.item} ${absIdx === activeIndex ? styles.active : ""}`}
                      onClick={() => handleSelect(item.href)}
                      onMouseEnter={() => setActiveIndex(absIdx)}
                    >
                      <span className={styles.itemLeft}>
                        <span className={styles.itemIcon}><IconTag /></span>
                        <span className={styles.itemLabel}>{item.label}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* On this site — full-text content index */}
          {grouped.site.length > 0 && (
            <>
              {(grouped.nav.length > 0 || grouped.projects.length > 0 || grouped.tags.length > 0) && (
                <div className={styles.divider} />
              )}
              <div className={styles.section}>
                <span className={styles.sectionLabel}>On this site</span>
                {grouped.site.map((item, i) => {
                  const absIdx = siteOffset + i;
                  return (
                    <button
                      key={item.href + item.label}
                      role="option"
                      aria-selected={absIdx === activeIndex}
                      data-index={absIdx}
                      className={`${styles.item} ${absIdx === activeIndex ? styles.active : ""}`}
                      onClick={() => handleSelect(item.href)}
                      onMouseEnter={() => setActiveIndex(absIdx)}
                    >
                      <span className={styles.itemLeft}>
                        <span className={styles.itemIcon}><IconSection /></span>
                        <span className={styles.itemLabel}>{item.label}</span>
                      </span>
                      {"meta" in item && (
                        <span className={styles.itemMeta}>{item.meta}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Footer hints */}
        <div className={styles.footer}>
          <span className={styles.footerHint}>
            <kbd className={styles.footerKbd}>↑↓</kbd> navigate
          </span>
          <span className={styles.footerHint}>
            <kbd className={styles.footerKbd}>↵</kbd> open
          </span>
          <span className={styles.footerHint}>
            <kbd className={styles.footerKbd}>esc</kbd> close
          </span>
        </div>
      </div>
    </>
  );
}


