"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import styles from "./WordSearchPlayground.module.css";

const CENTER_WORD = "ISHAN";
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

type Dir = [number, number];
const H: Dir = [0, 1];
const V: Dir = [1, 0];

interface WordPlacement {
  word: string;
  row: number;
  col: number;
  dir: Dir;
}

// Landscape (40×20), ISHAN at row 10 col 17
// Crossings:
//   MULTIDISCIPLINARY ↕ shares I with ISHAN at (10,21)
//   HUMAN ↕ shares H with TECHNOLOGIST at (3,5)
//   ENGINEER → shares I with EXPERIMENTAL ↕ at (6,28)
const LANDSCAPE: WordPlacement[] = [
  { word: "MULTIDISCIPLINARY", row: 1, col: 21, dir: V },
  { word: "TECHNOLOGIST", row: 3, col: 2, dir: H },
  { word: "HUMAN", row: 3, col: 5, dir: V },
  { word: "EXPERIMENTAL", row: 1, col: 28, dir: V },
  { word: "ENGINEER", row: 6, col: 25, dir: H },
  { word: "INTROSPECTIVE", row: 13, col: 2, dir: H },
  { word: "STORYTELLER", row: 14, col: 9, dir: H },
  { word: "INTERACTIVE", row: 16, col: 26, dir: H },
  { word: "IMMERSIVE", row: 5, col: 34, dir: V },
  { word: "EMBODIED", row: 18, col: 0, dir: H },
  { word: "BUILDER", row: 17, col: 13, dir: H },
  { word: "EXPERIENTIAL", row: 0, col: 0, dir: H },
];

// Portrait (20×30), ISHAN at row 15 col 7
// Crossings:
//   MULTIDISCIPLINARY ↕ shares I with ISHAN at (15,11)
//   ENGINEER ↕ shares E with ISHAN at (15,8)
//   HUMAN → shares H with TECHNOLOGIST ↕ at (3,3)
const PORTRAIT: WordPlacement[] = [
  { word: "MULTIDISCIPLINARY", row: 6, col: 11, dir: V },
  { word: "TECHNOLOGIST", row: 0, col: 3, dir: V },
  { word: "HUMAN", row: 3, col: 3, dir: H },
  { word: "ENGINEER", row: 15, col: 8, dir: V },
  { word: "EXPERIMENTAL", row: 2, col: 16, dir: V },
  { word: "INTROSPECTIVE", row: 25, col: 0, dir: H },
  { word: "STORYTELLER", row: 19, col: 19, dir: V },
  { word: "INTERACTIVE", row: 27, col: 5, dir: H },
  { word: "IMMERSIVE", row: 5, col: 18, dir: V },
  { word: "EMBODIED", row: 0, col: 8, dir: H },
  { word: "BUILDER", row: 28, col: 0, dir: H },
  { word: "EXPERIENTIAL", row: 29, col: 0, dir: H },
];

const LETTER_TICK = 50; // ms per letter reveal
const WORD_GAP_TICKS = 8; // extra ticks (400ms) pause between words

function generateGrid(cols: number, rows: number): {
  grid: string[][];
  cellWordIndex: Map<string, number>;
  cellRevealStep: Map<string, number>;
  totalSteps: number;
  totalWords: number;
} {
  const grid: string[][] = Array.from({ length: rows }, () =>
    Array(cols).fill(""),
  );
  const cellWordIndex = new Map<string, number>();
  const cellRevealStep = new Map<string, number>();
  let step = 0;

  // Place ISHAN in the center (word index 0)
  const centerRow = Math.floor(rows / 2);
  const startCol = Math.floor((cols - CENTER_WORD.length) / 2);
  for (let i = 0; i < CENTER_WORD.length; i++) {
    const key = `${centerRow},${startCol + i}`;
    grid[centerRow][startCol + i] = CENTER_WORD[i];
    cellWordIndex.set(key, 0);
    cellRevealStep.set(key, step++);
  }
  step += WORD_GAP_TICKS;

  // Place identity words (word index 1, 2, ...)
  const layout = cols >= 40 ? LANDSCAPE : PORTRAIT;
  for (let wi = 0; wi < layout.length; wi++) {
    const p = layout[wi];
    for (let i = 0; i < p.word.length; i++) {
      const r = p.row + p.dir[0] * i;
      const c = p.col + p.dir[1] * i;
      grid[r][c] = p.word[i];
      const key = `${r},${c}`;
      if (!cellWordIndex.has(key)) {
        cellWordIndex.set(key, wi + 1);
      }
      if (!cellRevealStep.has(key)) {
        cellRevealStep.set(key, step);
      }
      step++;
    }
    if (wi < layout.length - 1) step += WORD_GAP_TICKS;
  }

  // Fill empty cells with random letters
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (!grid[r][c]) {
        grid[r][c] = ALPHABET[Math.floor(Math.random() * 26)];
      }
    }
  }

  return { grid, cellWordIndex, cellRevealStep, totalSteps: step, totalWords: 1 + layout.length };
}

function swapCellColor(
  target: HTMLElement,
  timers: Map<HTMLElement, ReturnType<typeof setTimeout>>,
) {
  const type = target.dataset.type;
  if (!type) return;

  const existing = timers.get(target);
  if (existing) clearTimeout(existing);

  if (type === "ishan" || type === "word") {
    target.style.color = "rgba(39, 39, 38, 0.18)";
  } else {
    target.style.color =
      Math.random() > 0.5 ? "var(--accent)" : "var(--foreground)";
  }

  const timer = setTimeout(() => {
    target.style.color = "";
    timers.delete(target);
  }, 3000);
  timers.set(target, timer);
}

interface GridConfig {
  cols: number;
  rows: number;
  colW: number;
  rowH: number;
}

export default function WordSearchPlayground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const healTimers = useRef(
    new Map<HTMLElement, ReturnType<typeof setTimeout>>(),
  );
  const lastHovered = useRef<HTMLElement | null>(null);
  const [config, setConfig] = useState<GridConfig | null>(null);
  const [gridData, setGridData] = useState<{
    grid: string[][];
    cellWordIndex: Map<string, number>;
    cellRevealStep: Map<string, number>;
    totalSteps: number;
    totalWords: number;
    cols: number;
    rows: number;
  } | null>(null);
  const [revealedStep, setRevealedStep] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      if (width > 0 && height > 0) {
        const portrait = height > width * 1.2;
        const cols = portrait ? 20 : 40;
        const rows = portrait ? 30 : 20;
        setConfig({ cols, rows, colW: width / cols, rowH: height / rows });
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Regenerate grid when cols/rows change
  const prevDimsRef = useRef<string>("");
  useEffect(() => {
    if (!config) return;
    const key = `${config.cols}x${config.rows}`;
    if (key === prevDimsRef.current) return;
    prevDimsRef.current = key;
    const data = generateGrid(config.cols, config.rows);
    setGridData({ ...data, cols: config.cols, rows: config.rows });
    setRevealedStep(0);
  }, [config]);

  // Sequential letter-by-letter reveal animation
  useEffect(() => {
    if (!gridData) return;
    const { totalSteps } = gridData;

    let current = 0;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const startTimer = setTimeout(() => {
      intervalId = setInterval(() => {
        current++;
        setRevealedStep(current);
        if (current >= totalSteps) {
          if (intervalId) clearInterval(intervalId);
        }
      }, LETTER_TICK);
    }, 600);

    return () => {
      clearTimeout(startTimer);
      if (intervalId) clearInterval(intervalId);
    };
  }, [gridData]);

  // Touch handler for mobile
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let lastTouchTarget: HTMLElement | null = null;

    const onTouch = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (!touch) return;
      const el = document.elementFromPoint(
        touch.clientX,
        touch.clientY,
      ) as HTMLElement;
      if (!el || el === lastTouchTarget || !el.dataset.type) return;
      lastTouchTarget = el;
      swapCellColor(el, healTimers.current);
    };

    const onTouchEnd = () => {
      lastTouchTarget = null;
    };

    container.addEventListener("touchmove", onTouch, { passive: true });
    container.addEventListener("touchstart", onTouch, { passive: true });
    container.addEventListener("touchend", onTouchEnd);

    return () => {
      container.removeEventListener("touchmove", onTouch);
      container.removeEventListener("touchstart", onTouch);
      container.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  // Cleanup heal timers on unmount
  useEffect(() => {
    const timers = healTimers.current;
    return () => {
      timers.forEach((t) => clearTimeout(t));
    };
  }, []);

  const handleGridHover = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target === lastHovered.current) return;
    lastHovered.current = target;
    swapCellColor(target, healTimers.current);
  }, []);

  const cellClass = (r: number, c: number) => {
    if (!gridData) return styles.cell;
    const key = `${r},${c}`;
    const wordIdx = gridData.cellWordIndex.get(key);
    const step = gridData.cellRevealStep.get(key);

    if (wordIdx === undefined) {
      return `${styles.cell} ${styles.filler}`;
    }

    if (step !== undefined && step < revealedStep) {
      if (wordIdx === 0) return `${styles.cell} ${styles.ishan}`;
      return styles.cell;
    }

    return `${styles.cell} ${styles.filler}`;
  };

  const cellType = (r: number, c: number): string => {
    if (!gridData) return "filler";
    const key = `${r},${c}`;
    const wordIdx = gridData.cellWordIndex.get(key);
    const step = gridData.cellRevealStep.get(key);

    if (wordIdx === undefined) return "filler";
    if (step !== undefined && step < revealedStep) {
      return wordIdx === 0 ? "ishan" : "word";
    }
    return "filler";
  };

  return (
    <div ref={containerRef} className={styles.container}>
      {config && gridData && (
        <div
          className={styles.grid}
          style={{
            gridTemplateColumns: `repeat(${gridData.cols}, ${config.colW}px)`,
            gridTemplateRows: `repeat(${gridData.rows}, ${config.rowH}px)`,
            fontSize: `${Math.min(config.colW, config.rowH) * 0.55}px`,
          }}
          onMouseOver={handleGridHover}
        >
          {gridData.grid.flatMap((row, r) =>
            row.map((letter, c) => (
              <span
                key={`${r}-${c}`}
                className={cellClass(r, c)}
                data-type={cellType(r, c)}
              >
                {letter}
              </span>
            )),
          )}
        </div>
      )}
    </div>
  );
}
