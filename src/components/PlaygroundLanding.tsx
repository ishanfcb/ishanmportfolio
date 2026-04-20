"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./PlaygroundLanding.module.css";

// --- Shape data ---

const shapeIDs = [
  "Iv",
  "St", "Svl", "Sm", "Svr", "Sb",
  "Hl", "Hm", "Hr",
  "Al", "At", "Am", "Ar",
  "Nl", "Ns", "Nr",
  "Dot",
] as const;

type ShapeID = (typeof shapeIDs)[number];

interface ShapeDims {
  w: number;
  h: number;
  rotation?: number;
  shapeType: "long" | "short" | "dot" | "slant" | "vertShort";
}

const unscaledShapes: Record<ShapeID, ShapeDims> = {
  Iv: { w: 3, h: 15, shapeType: "long" },
  St: { w: 9, h: 3, shapeType: "short" },
  Svl: { w: 3, h: 6, shapeType: "vertShort" },
  Sm: { w: 9, h: 3, shapeType: "short" },
  Svr: { w: 3, h: 6, shapeType: "vertShort" },
  Sb: { w: 9, h: 3, shapeType: "short" },
  Hl: { w: 3, h: 15, shapeType: "long" },
  Hm: { w: 9, h: 3, shapeType: "short" },
  Hr: { w: 3, h: 15, shapeType: "long" },
  Al: { w: 3, h: 15, shapeType: "long" },
  At: { w: 9, h: 3, shapeType: "short" },
  Am: { w: 9, h: 3, shapeType: "short" },
  Ar: { w: 3, h: 15, shapeType: "long" },
  Nl: { w: 3, h: 15, shapeType: "long" },
  Ns: { w: 15.84, h: 3, rotation: 57.55, shapeType: "slant" },
  Nr: { w: 3, h: 15, shapeType: "long" },
  Dot: { w: 3, h: 3, shapeType: "dot" },
};

// --- Text element data ---

interface TextElement {
  id: string;
  content: string;
  fontScale: number;
  minFontSize: number;
}

const textElements: TextElement[] = [
  { id: "t_0", content: "MULTIDISCIPLINARY", fontScale: 1.0, minFontSize: 9 },
  { id: "t_1", content: "INTERACTIVE", fontScale: 1.0, minFontSize: 9 },
  { id: "t_2", content: "TECHNOLOGIST", fontScale: 1.0, minFontSize: 9 },
  { id: "t_3", content: "IMMERSIVE", fontScale: 1.0, minFontSize: 9 },
  { id: "t_4", content: "EXPERIENTIAL", fontScale: 1.0, minFontSize: 9 },
  { id: "t_5", content: "STORYTELLER", fontScale: 1.0, minFontSize: 9 },
  { id: "t_6", content: "BUILDER", fontScale: 1.0, minFontSize: 9 },
];

// Chaos positions for text (percentage-based, like shape chaos)
const textChaosPositions: Record<string, { x: number; y: number }> = {
  t_0: { x: 70, y: 10 },
  t_1: { x: 15, y: 60 },
  t_2: { x: 80, y: 45 },
  t_3: { x: 25, y: 42 },
  t_4: { x: 85, y: 75 },
  t_5: { x: 8, y: 88 },
  t_6: { x: 92, y: 55 },
};

// --- Shape states ---

// "ISH.AN" — dot between H and A (the domain state)
const IshAnState: Record<ShapeID, { x: number; y: number }> = {
  Iv: { x: 0, y: 0 },
  St: { x: 6, y: 0 },
  Svl: { x: 6, y: 3 },
  Sm: { x: 6, y: 6 },
  Svr: { x: 12, y: 9 },
  Sb: { x: 6, y: 12 },
  Hl: { x: 18, y: 0 },
  Hr: { x: 24, y: 0 },
  Hm: { x: 18, y: 6 },
  Dot: { x: 30, y: 12 },
  Al: { x: 36, y: 0 },
  At: { x: 36, y: 0 },
  Am: { x: 36, y: 6 },
  Ar: { x: 42, y: 0 },
  Nl: { x: 48, y: 0 },
  Ns: { x: 46.1, y: 6 },
  Nr: { x: 57, y: 0 },
};

// "ISHAN." — dot at the end (the name state)
const IshanDotState: Record<ShapeID, { x: number; y: number }> = {
  Iv: { x: 0, y: 0 },
  St: { x: 6, y: 0 },
  Svl: { x: 6, y: 3 },
  Sm: { x: 6, y: 6 },
  Svr: { x: 12, y: 9 },
  Sb: { x: 6, y: 12 },
  Hl: { x: 18, y: 0 },
  Hr: { x: 24, y: 0 },
  Hm: { x: 18, y: 6 },
  Al: { x: 30, y: 0 },
  At: { x: 30, y: 0 },
  Am: { x: 30, y: 6 },
  Ar: { x: 36, y: 0 },
  Nl: { x: 42, y: 0 },
  Ns: { x: 40.1, y: 6 },
  Nr: { x: 51, y: 0 },
  Dot: { x: 57, y: 12 },
};

// --- Animation config ---
const TRANSITION = 750;
const LETTER_HOLD = 1250;

// Phase definitions — base cycle between ISH.AN (0) and ISHAN. (1)
// Chaos is driven by mouse hover, not time
const PHASES: { type: "transition" | "hold"; from?: number; to?: number; state?: number; duration: number }[] = [
  { type: "transition", from: 0, to: 1, duration: TRANSITION },
  { type: "hold", state: 1, duration: LETTER_HOLD },
  { type: "transition", from: 1, to: 0, duration: TRANSITION },
  { type: "hold", state: 0, duration: LETTER_HOLD },
];
const CYCLE_DURATION = PHASES.reduce((sum, p) => sum + p.duration, 0);

const ease = (t: number) =>
  t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

// Chaos state — scattered layout target for blocks
const ChaosState: Record<ShapeID, { x: number; y: number }> = {
  Iv: { x: 25, y: 20 },
  St: { x: -5, y: 96 },
  Svl: { x: 48, y: 55 },
  Sm: { x: 15, y: 80 },
  Svr: { x: 50, y: 10 },
  Sb: { x: 30, y: 95 },
  Hl: { x: 15, y: 74 },
  Hm: { x: 18, y: 60 },
  Hr: { x: 62, y: 45 },
  Al: { x: 40, y: -7 },
  At: { x: 82, y: 88 },
  Am: { x: 8, y: 40 },
  Ar: { x: 30, y: 12 },
  Nl: { x: 70, y: 70 },
  Ns: { x: 105, y: 20 },
  Nr: { x: 100, y: 95 },
  Dot: { x: 55, y: 55 },
};

export default function PlaygroundLanding() {
  const interactionRef = useRef<HTMLDivElement>(null);
  const elRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const animRef = useRef<number>(0);
  const mousePos = useRef<{ x: number; y: number } | null>(null);
  const tapStartRef = useRef(0);
  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = interactionRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setContainerSize({ w: width, h: height });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Track mouse/touch exclusively within the interactive rectangle array
  useEffect(() => {
    const el = interactionRef.current;
    if (!el) return;
    const onMouse = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      mousePos.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const onLeave = () => { mousePos.current = null; };
    const onTouch = () => { tapStartRef.current = performance.now(); };
    el.addEventListener("mousemove", onMouse);
    el.addEventListener("mouseleave", onLeave);
    el.addEventListener("touchstart", onTouch, { passive: true });
    return () => {
      el.removeEventListener("mousemove", onMouse);
      el.removeEventListener("mouseleave", onLeave);
      el.removeEventListener("touchstart", onTouch);
    };
  }, []);

  useEffect(() => {
    if (containerSize.w === 0) return;

    const containerWidth = containerSize.w;
    const containerHeight = containerSize.h;
    const scaleFactor = containerWidth / 100;
    
    // ISHAN width is exactly 60 unscaled units
    const X_OFFSET = 20; 

    // --- Set text font sizes (must happen before measuring) ---
    const wordFontSize = Math.max(9, 1.0 * scaleFactor);
    for (const t of textElements) {
      const el = elRefs.current[t.id];
      if (el) el.style.fontSize = `${wordFontSize}px`;
    }

    // --- Measure actual rendered tag widths ---
    const tagWidths: Record<string, number> = {};
    for (const t of textElements) {
      const el = elRefs.current[t.id];
      tagWidths[t.id] = el ? el.offsetWidth : 0;
    }

    // --- Compute text settled layout ---
    const nameHeightPx = 15 * scaleFactor;
    const gapNameToWords = Math.max(12, 5 * scaleFactor);
    const nameWidthPx = 60 * scaleFactor;
    const wordGapPx = wordFontSize * 0.6;
    const lineHeightPx = wordFontSize * 2.2;

    // Dry-run word layout to count rows
    let tempX = 0;
    let numWordRows = 1;
    for (const t of textElements) {
      const tagWidth = tagWidths[t.id];
      if (tempX + tagWidth > nameWidthPx && tempX > 0) {
        tempX = 0;
        numWordRows++;
      }
      tempX += tagWidth + wordGapPx;
    }

    const totalContentPx =
      nameHeightPx + gapNameToWords + numWordRows * lineHeightPx;
    const Y_OFFSET = (containerHeight - totalContentPx) / 2;

    // --- Compute settled text positions (px, with Y_OFFSET) ---
    const textSettled: Record<string, { x: number; y: number; fontSize: number }> = {};
    const wordsStartY = nameHeightPx + gapNameToWords + Y_OFFSET;
    
    let rowX = 0;
    let rowY = wordsStartY;
    for (const t of textElements) {
      const tagWidth = tagWidths[t.id];
      if (rowX + tagWidth > nameWidthPx && rowX > 0) {
        rowX = 0;
        rowY += lineHeightPx;
      }
      textSettled[t.id] = { x: X_OFFSET * scaleFactor + rowX, y: rowY, fontSize: wordFontSize };
      rowX += tagWidth + wordGapPx;
    }

    // --- Pre-compute chaos positions (mouse-driven, not in phase cycle) ---
    const chaosPositions: Record<string, { x: number; y: number }> = {};
    for (const id of shapeIDs) {
      const rp = ChaosState[id];
      chaosPositions[id] = {
        x: (rp.x / 100) * containerWidth * 0.85,
        y: (rp.y / 100) * containerHeight * 0.85,
      };
    }
    for (const t of textElements) {
      const rp = textChaosPositions[t.id];
      chaosPositions[t.id] = {
        x: (rp.x / 100) * containerWidth * 0.85,
        y: (rp.y / 100) * containerHeight * 0.85,
      };
    }

    // --- Pre-compute assembled state positions ---
    const statePositions: Record<string, { x: number; y: number }>[] = [];

    // State 0: ISH.AN 
    const ishAn: Record<string, { x: number; y: number }> = {};
    for (const id of shapeIDs) {
      const pos = IshAnState[id];
      ishAn[id] = {
        x: (pos.x + X_OFFSET) * scaleFactor,
        y: pos.y * scaleFactor + Y_OFFSET,
      };
    }
    for (const t of textElements) {
      ishAn[t.id] = { x: textSettled[t.id].x, y: textSettled[t.id].y };
    }
    statePositions.push(ishAn);

    // State 1: ISHAN.
    const ishanDot: Record<string, { x: number; y: number }> = {};
    for (const id of shapeIDs) {
      const pos = IshanDotState[id];
      ishanDot[id] = {
        x: (pos.x + X_OFFSET) * scaleFactor,
        y: pos.y * scaleFactor + Y_OFFSET,
      };
    }
    for (const t of textElements) {
      ishanDot[t.id] = { x: textSettled[t.id].x, y: textSettled[t.id].y };
    }
    statePositions.push(ishanDot);

    // Pre-compute shape dimensions
    const shapeSizes: Record<string, { w: number; h: number }> = {};
    for (const id of shapeIDs) {
      const dims = unscaledShapes[id];
      shapeSizes[id] = { w: dims.w * scaleFactor, h: dims.h * scaleFactor };
    }

    const allKeys: string[] = [...shapeIDs, ...textElements.map(t => t.id)];
    let currentChaosBlend = 0;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;

      // --- Base assembled animation ---
      const cycleTime = elapsed % CYCLE_DURATION;
      let t = cycleTime;
      let phase = PHASES[0];
      for (const p of PHASES) {
        if (t < p.duration) {
          phase = p;
          break;
        }
        t -= p.duration;
      }

      let assembledPos: Record<string, { x: number; y: number }>;
      if (phase.type === "hold") {
        assembledPos = statePositions[phase.state!];
      } else {
        const progress = ease(t / phase.duration);
        assembledPos = {};
        const from = statePositions[phase.from!];
        const to = statePositions[phase.to!];
        for (const key of allKeys) {
          assembledPos[key] = {
            x: from[key].x + (to[key].x - from[key].x) * progress,
            y: from[key].y + (to[key].y - from[key].y) * progress,
          };
        }
      }

      // --- Compute chaos blend from mouse proximity ---
      let targetChaos = 0;
      if (mousePos.current) {
        const mx = mousePos.current.x;
        const my = mousePos.current.y;
        const cx = containerWidth / 2;
        const cy = containerHeight / 2;
        const maxDist = Math.sqrt(cx * cx + cy * cy);
        const dist = Math.sqrt((mx - cx) ** 2 + (my - cy) ** 2);
        targetChaos = Math.max(0, 1 - dist / maxDist);
        targetChaos = Math.pow(targetChaos, 0.6);
      }

      // Tap chaos
      if (tapStartRef.current > 0) {
        const tapElapsed = now - tapStartRef.current;
        if (tapElapsed < 2000) {
          targetChaos = Math.max(targetChaos, 1 - tapElapsed / 2000);
        } else {
          tapStartRef.current = 0;
        }
      }

      const blendRate = targetChaos > currentChaosBlend ? 0.15 : 0.06;
      currentChaosBlend += (targetChaos - currentChaosBlend) * blendRate;
      
      if (Math.abs(targetChaos - currentChaosBlend) < 0.001) {
        currentChaosBlend = targetChaos;
      }

      const blend = Math.max(0, Math.min(1, currentChaosBlend));

      // --- Animate elements ---
      for (const id of shapeIDs) {
        const el = elRefs.current[id];
        if (!el) continue;

        const aPos = assembledPos[id];
        const cPos = chaosPositions[id];
        const size = shapeSizes[id];
        const dims = unscaledShapes[id as ShapeID];
        const rotation = dims.rotation ?? 0;

        let finalX = aPos.x + (cPos.x - aPos.x) * blend;
        let finalY = aPos.y + (cPos.y - aPos.y) * blend;
        let finalW = size.w;
        let finalH = size.h;

        // Devise subpixel rounding at rest
        if (blend === 0) {
          finalX = Math.round(finalX);
          finalY = Math.round(finalY);
          finalW = Math.ceil(finalW) + 1;
          finalH = Math.ceil(finalH) + 1;
        }

        el.style.transform = `translate3d(${finalX}px, ${finalY}px, 0) rotate(${rotation}deg)`;
        el.style.width = `${finalW}px`;
        el.style.height = `${finalH}px`;
      }

      for (const te of textElements) {
        const el = elRefs.current[te.id];
        if (!el) continue;

        const aPos = assembledPos[te.id];
        const cPos = chaosPositions[te.id];

        const x = aPos.x + (cPos.x - aPos.x) * blend;
        const y = aPos.y + (cPos.y - aPos.y) * blend;

        el.style.transform = `translate(${x}px, ${y}px)`;
      }

      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [containerSize]);

  return (
    <div className={styles.container}>
      <div 
        ref={interactionRef} 
        className={styles.interactionArea}
      >
        {shapeIDs.map((id) => {
          const dims = unscaledShapes[id];
          const isDot = dims.shapeType === "dot";
          return (
            <div
              key={id}
              ref={(el) => {
                elRefs.current[id] = el;
              }}
              className={`${styles.shape} ${isDot ? styles.dot : ""}`}
            />
          );
        })}
        {textElements.map((t) => (
          <div
            key={t.id}
            ref={(el) => {
              elRefs.current[t.id] = el;
            }}
            className={styles.tag}
          >
            {t.content}
          </div>
        ))}
      </div>
    </div>
  );
}
