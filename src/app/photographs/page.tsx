"use client";

import { useState, useEffect, useCallback } from "react";
import styles from "./Gallery.module.css";

export type Photo = {
  id: number;
  src: string;
  ratio: string;
  alt?: string;
};

// Real photographs
const PHOTOS: Photo[] = [
  { id: 1,  src: "/photographs/0S0A0203-a.JPG",      ratio: "4/5"  },
  { id: 2,  src: "/photographs/0S0A0236-a.jpg",      ratio: "4/5"  },
  { id: 3,  src: "/photographs/0S0A0450-a.JPG",      ratio: "4/5"  },
  { id: 4,  src: "/photographs/0S0A9775-a.JPG",      ratio: "4/5"  },
  { id: 5,  src: "/photographs/0S0A9812-a.jpg",      ratio: "3/2"  },
  { id: 6,  src: "/photographs/DSC00023.JPG",        ratio: "3/2"  },
  { id: 7,  src: "/photographs/DSC00028A.jpg",       ratio: "3/2"  },
  { id: 8,  src: "/photographs/DSC00045.png",        ratio: "4/3"  },
  { id: 9,  src: "/photographs/DSC00077.png",        ratio: "3/2"  },
  { id: 10, src: "/photographs/DSC00125.JPG",        ratio: "3/2"  },
  { id: 11, src: "/photographs/DSC00843.JPG",        ratio: "3/2"  },
  { id: 12, src: "/photographs/DSC01319.png",        ratio: "4/3"  },
  { id: 13, src: "/photographs/DSC01323.png",        ratio: "4/3"  },
  { id: 14, src: "/photographs/DSC01379.JPG",        ratio: "3/2"  },
  { id: 15, src: "/photographs/DSC01632B.JPG",       ratio: "3/2"  },
  { id: 16, src: "/photographs/DSC01662_edited.jpg", ratio: "3/2"  },
  { id: 17, src: "/photographs/DSC03320_a.jpg",      ratio: "3/2"  },
  { id: 18, src: "/photographs/DSC04373.JPG",        ratio: "3/2"  },
  { id: 19, src: "/photographs/DSC07069.jpg",        ratio: "3/2"  },
  { id: 20, src: "/photographs/DSC07118Edit2.jpg",   ratio: "3/2"  },
  { id: 21, src: "/photographs/DSC07136.JPG",        ratio: "3/2"  },
  { id: 22, src: "/photographs/DSC07645.jpg",        ratio: "3/2"  },
  { id: 23, src: "/photographs/DSC08266.png",        ratio: "4/3"  },
  { id: 24, src: "/photographs/DSC08409.png",        ratio: "4/3"  },
  { id: 25, src: "/photographs/DSC08659.png",        ratio: "3/2"  },
  { id: 26, src: "/photographs/DSC08882.jpg",        ratio: "3/2"  },
  { id: 27, src: "/photographs/DSC09642.JPG",        ratio: "3/2"  },
  { id: 28, src: "/photographs/DSC09649edited.JPG",  ratio: "3/2"  },
  { id: 29, src: "/photographs/DSC09827.JPG",        ratio: "3/2"  },
  { id: 30, src: "/photographs/DSC09848Edit.jpg",    ratio: "3/2"  },
  { id: 31, src: "/photographs/DSC09894.JPG",        ratio: "3/2"  },
  { id: 32, src: "/photographs/DSC09903.JPG",        ratio: "3/2"  },
  { id: 33, src: "/photographs/DSC09924.JPG",        ratio: "3/2"  },
  { id: 34, src: "/photographs/DSC09932.JPG",        ratio: "3/2"  },
];

export default function PhotographsPage() {
  const [active, setActive] = useState<null | number>(null);
  const [blurred, setBlurred] = useState(false);

  const activePhoto = PHOTOS.find((p) => p.id === active) ?? null;

  const closeLightbox = useCallback(() => setActive(null), []);

  // Navigate within lightbox
  const goNext = useCallback(() => {
    if (active === null) return;
    const idx = PHOTOS.findIndex((p) => p.id === active);
    setActive(PHOTOS[(idx + 1) % PHOTOS.length].id);
  }, [active]);

  const goPrev = useCallback(() => {
    if (active === null) return;
    const idx = PHOTOS.findIndex((p) => p.id === active);
    setActive(PHOTOS[(idx - 1 + PHOTOS.length) % PHOTOS.length].id);
  }, [active]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeLightbox, goNext, goPrev]);

  // Anti-screenshot blur
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isScreenshot =
        e.key === "PrintScreen" ||
        (e.metaKey && e.shiftKey && (e.key === "3" || e.key === "4" || e.key === "5")) ||
        (e.ctrlKey && e.key === "PrintScreen");
      if (isScreenshot) {
        setBlurred(true);
        setTimeout(() => setBlurred(false), 1500);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Disable right-click
  useEffect(() => {
    const block = (e: MouseEvent) => e.preventDefault();
    document.addEventListener("contextmenu", block);
    return () => document.removeEventListener("contextmenu", block);
  }, []);

  return (
    <main className={styles.page}>
      {blurred && <div className={styles.screenshotBlur} aria-hidden="true" />}

      <header className={styles.header}>
        <h1 className={styles.heading}>Photographs</h1>
        <p className={styles.subtext}>{PHOTOS.length} images</p>
      </header>

      <section className={styles.masonry}>
        {PHOTOS.map((photo) => (
          <div
            key={photo.id}
            className={styles.item}
            onClick={() => setActive(photo.id)}
            style={{ aspectRatio: photo.ratio }}
          >
            <div className={styles.shield} onContextMenu={(e) => e.preventDefault()} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.src}
              alt={photo.alt ?? "Photograph"}
              draggable={false}
              loading="lazy"
            />
          </div>
        ))}
      </section>

      {/* Lightbox */}
      {active !== null && activePhoto && (
        <div className={styles.lightbox} onClick={closeLightbox} role="dialog" aria-modal="true">
          <div className={styles.lightboxInner} onClick={(e) => e.stopPropagation()}>
            <div className={styles.shield} onContextMenu={(e) => e.preventDefault()} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={activePhoto.src} alt={activePhoto.alt ?? "Photograph"} draggable={false} />
          </div>
          <footer className={styles.lightboxFooter} onClick={(e) => e.stopPropagation()}>
            <button className={styles.navLinkLeft} onClick={goPrev} aria-label="Previous">
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
            </button>
            
            <span className={styles.lightboxClose} onClick={closeLightbox}>
              Press Esc to close
            </span>

            <button className={styles.navLinkRight} onClick={goNext} aria-label="Next">
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
            </button>
          </footer>
        </div>
      )}
    </main>
  );
}
