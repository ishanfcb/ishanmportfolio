"use client";

import { useState, useCallback, useRef } from "react";
import { playgroundRegistry } from "./playgroundRegistry";
import styles from "./PlaygroundHost.module.css";

type Transition = "idle" | "covering" | "revealing" | "returning";

const COVER_MS = 500;
const REVEAL_MS = 500;
const RETURN_MS = 250;
const TOTAL = playgroundRegistry.length;

/** Fisher-Yates shuffle. If `exclude` is given, ensures it isn't first. */
function createBag(exclude?: number): number[] {
  const indices = Array.from({ length: TOTAL }, (_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  if (
    exclude !== undefined &&
    indices[0] === exclude &&
    indices.length > 1
  ) {
    const swap = 1 + Math.floor(Math.random() * (indices.length - 1));
    [indices[0], indices[swap]] = [indices[swap], indices[0]];
  }
  return indices;
}

export default function PlaygroundHost() {
  const bagRef = useRef<number[]>([]);
  const pendingIndexRef = useRef<number | null>(null);
  const [playgroundIndex, setPlaygroundIndex] = useState(
    () => Math.floor(Math.random() * TOTAL)
  );
  const [cycleCount, setCycleCount] = useState(0);
  const [transition, setTransition] = useState<Transition>("idle");

  const cyclePlayground = useCallback(() => {
    if (transition !== "idle") return;

    if (bagRef.current.length === 0) {
      bagRef.current = createBag(playgroundIndex);
    }

    const next = bagRef.current.shift()!;
    pendingIndexRef.current = next;
    setTransition("covering");
    window.umami?.track("playground-cycle");

    setTimeout(() => {
      setPlaygroundIndex(pendingIndexRef.current!);
      setCycleCount((c) => c + 1);
      setTransition("revealing");

      setTimeout(() => {
        setTransition("returning");

        setTimeout(() => {
          setTransition("idle");
        }, RETURN_MS);
      }, REVEAL_MS);
    }, COVER_MS);
  }, [transition, playgroundIndex]);

  const currentPlayground = playgroundRegistry[playgroundIndex];
  const PlaygroundComponent = currentPlayground.component;

  const overlayClass =
    transition === "covering"
      ? styles.covering
      : transition === "revealing"
        ? styles.revealing
        : "";

  const earmarkClass =
    transition === "returning"
      ? styles.earmarkReturning
      : transition !== "idle"
        ? styles.earmarkHidden
        : styles.earmarkNudge;

  return (
    <div className={styles.heroOuter}>
      <div className={styles.heroContainer}>
        {/* Playground content */}
        <div className={styles.playgroundContent}>
          <PlaygroundComponent key={`${currentPlayground.id}-${cycleCount}`} />
        </div>

        {/* Page-turn overlay */}
        <div className={`${styles.pageTurnOverlay} ${overlayClass}`} />

        {/* Playground name */}
        <span className={styles.playgroundName}>
          {currentPlayground.name}
        </span>

        {/* Playground counter */}
        <span className={styles.playgroundCounter}>
          Playground #{playgroundIndex + 1}/{TOTAL}
        </span>

        {/* Earmark corner button */}
        <button
          className={`${styles.earmark} ${earmarkClass}`}
          onClick={cyclePlayground}
          aria-label="Show a different playground"
        >
          <svg
            className={styles.earmarkIcon}
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M0 0 L40 0 L0 40 Z" className={styles.earmarkTriangle} />
            <path
              d="M32 32 L24 24 M24 24 L29 24 M24 24 L24 29"
              className={styles.earmarkArrow}
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
