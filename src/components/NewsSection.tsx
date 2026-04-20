"use client";

import { useEffect, useRef } from "react";
import styles from "./NewsSection.module.css";

// Constant scroll speed in pixels per second
const PX_PER_SECOND = 60;

interface NewsItem {
  text: string;
  link?: string;
  linkText?: string;
  date: string;
  expires: string;
}

export default function NewsSection({ items }: { items: NewsItem[] }) {
  const contentRef = useRef<HTMLDivElement>(null);
  const now = Date.now();
  const current = items.filter(
    (item) => new Date(item.expires).getTime() > now
  );

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    // One repetition = totalWidth / 6; duration = that distance / speed
    const oneRep = el.scrollWidth / 6;
    const duration = oneRep / PX_PER_SECOND;
    el.style.animationDuration = `${duration}s`;
  }, [current.length]);

  if (current.length === 0) return null;

  // Repeat enough times to guarantee no gaps on wide screens
  const reps = Array.from({ length: 6 }, (_, r) =>
    current.map((item, i) => (
      <span key={`${r}-${i}`} className={styles.tickerItem}>
        <span className={styles.bullet} />
        <span className={styles.itemText}>{item.text}</span>
        {item.link && (
          <a
            href={item.link}
            className={styles.link}
            onClick={(e) => e.stopPropagation()}
            {...(item.link.startsWith("http")
              ? { target: "_blank", rel: "noopener noreferrer" }
              : {})}
          >
            {item.linkText || "Learn more"}
          </a>
        )}
      </span>
    ))
  );

  return (
    <section className={styles.ticker}>
      <div className={styles.tickerTrack}>
        <div ref={contentRef} className={styles.tickerContent}>{reps}</div>
      </div>
    </section>
  );
}
