"use client";

import { useEffect, useRef } from "react";
import styles from "./DictionaryPlayground.module.css";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function getTextNodes(root: Node): Text[] {
  const nodes: Text[] = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node;
  while ((node = walker.nextNode())) {
    if (node.textContent && node.textContent.trim().length > 1) {
      nodes.push(node as Text);
    }
  }
  return nodes;
}

function getCaretInfo(
  x: number,
  y: number,
): { node: Text; offset: number } | null {
  if (document.caretRangeFromPoint) {
    const range = document.caretRangeFromPoint(x, y);
    if (range && range.startContainer.nodeType === Node.TEXT_NODE) {
      return { node: range.startContainer as Text, offset: range.startOffset };
    }
  }
  // Firefox fallback
  const doc = document as unknown as Record<string, unknown>;
  if (typeof doc.caretPositionFromPoint === "function") {
    const pos = (
      doc.caretPositionFromPoint as (
        x: number,
        y: number,
      ) => { offsetNode: Node; offset: number } | null
    )(x, y);
    if (pos?.offsetNode?.nodeType === Node.TEXT_NODE) {
      return { node: pos.offsetNode as Text, offset: pos.offset };
    }
  }
  return null;
}

function randomChar(original: string): string {
  const isUpper = original === original.toUpperCase();
  const ch = ALPHABET[Math.floor(Math.random() * 26)];
  return isUpper ? ch : ch.toLowerCase();
}

/** Split a text node at `offset`, insert a red <span> with a random char, return a cleanup fn. */
function glitchCharRed(textNode: Text, offset: number): (() => void) | null {
  const text = textNode.textContent || "";
  if (offset < 0 || offset >= text.length) return null;
  if (!/[a-zA-Z]/.test(text[offset])) return null;

  const parent = textNode.parentNode;
  if (!parent) return null;

  const originalChar = text[offset];
  const ch = randomChar(originalChar);

  // Use Range to surgically replace one character with a red span
  const range = document.createRange();
  range.setStart(textNode, offset);
  range.setEnd(textNode, offset + 1);
  range.deleteContents();

  const span = document.createElement("span");
  span.textContent = ch;
  span.style.color = "#283A77";
  range.insertNode(span);

  return () => {
    try {
      if (!span.parentNode) return;
      const charNode = document.createTextNode(originalChar);
      span.parentNode.replaceChild(charNode, span);
      charNode.parentNode?.normalize();
    } catch {
      // concurrent glitch already cleaned this up
    }
  };
}

export default function DictionaryPlayground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const timers = new Set<ReturnType<typeof setTimeout>>();
    let lastHover = 0;

    const scheduleHeal = (cleanup: () => void) => {
      const timer = setTimeout(
        () => {
          cleanup();
          timers.delete(timer);
        },
        300 + Math.random() * 400,
      );
      timers.add(timer);
    };

    // Hover: glitch the exact character under the cursor
    const onMove = (e: MouseEvent) => {
      const now = Date.now();
      if (now - lastHover < 20) return;
      lastHover = now;

      const info = getCaretInfo(e.clientX, e.clientY);
      if (!info || !container.contains(info.node)) return;

      // Glitch the character under cursor plus a couple nearby
      const text = info.node.textContent || "";
      for (let d = 0; d < 3; d++) {
        const off = info.offset + d;
        if (off < text.length && /[a-zA-Z]/.test(text[off])) {
          const cleanup = glitchCharRed(info.node, off);
          if (cleanup) scheduleHeal(cleanup);
          break; // after first successful glitch, stop (node is now split)
        }
      }
    };

    // Touch: same targeting via caretInfo
    const onTouch = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (!touch) return;
      const now = Date.now();
      if (now - lastHover < 20) return;
      lastHover = now;

      const info = getCaretInfo(touch.clientX, touch.clientY);
      if (!info || !container.contains(info.node)) return;

      const cleanup = glitchCharRed(info.node, info.offset);
      if (cleanup) scheduleHeal(cleanup);
    };

    // Ambient: random glitches at high rate
    const scheduleAmbient = () => {
      const delay = 200 + Math.random() * 600;
      const timer = setTimeout(() => {
        timers.delete(timer);
        const nodes = getTextNodes(container);
        if (nodes.length === 0) {
          scheduleAmbient();
          return;
        }

        const count = 2 + Math.floor(Math.random() * 4);
        for (let i = 0; i < count; i++) {
          const node = nodes[Math.floor(Math.random() * nodes.length)];
          const text = node.textContent || "";
          const alphas: number[] = [];
          for (let j = 0; j < text.length; j++) {
            if (/[a-zA-Z]/.test(text[j])) alphas.push(j);
          }
          if (alphas.length > 0) {
            const offset = alphas[Math.floor(Math.random() * alphas.length)];
            const cleanup = glitchCharRed(node, offset);
            if (cleanup) scheduleHeal(cleanup);
          }
        }
        scheduleAmbient();
      }, delay);
      timers.add(timer);
    };
    scheduleAmbient();

    container.addEventListener("mousemove", onMove);
    container.addEventListener("touchmove", onTouch, { passive: true });
    container.addEventListener("touchstart", onTouch, { passive: true });

    return () => {
      container.removeEventListener("mousemove", onMove);
      container.removeEventListener("touchmove", onTouch);
      container.removeEventListener("touchstart", onTouch);
      timers.forEach((t) => clearTimeout(t));
    };
  }, []);

  return (
    <div ref={containerRef} className={styles.entry}>
      <div className={styles.headword}>
        ishan <span className={styles.phonetic}>/ˈlɛf.ɪn/</span>
      </div>
      <div className={styles.pos}>noun</div>

      <ol className={styles.definitions}>
        <li>
          A new media artist building interactive installations on the human condition.
        </li>
        <li>
          A creative technologist who bridges code, physical materials, and
          human experience into experiential work.
        </li>
        <li>
          An AI product manager and designer who ships things from concept to reality.
        </li>
      </ol>

      <div className={styles.pos}>verb</div>

      <ol className={styles.definitions} start={4}>
        <li>
          To relentlessly bridge disciplines that aren&rsquo;t supposed to go
          together.
        </li>
      </ol>

      <div className={styles.synonyms}>
        <span className={styles.synonymsLabel}>Synonyms</span>
        multidisciplinary, interactive, technologist, experiential, introspective,
        immersive, human, storyteller, builder
      </div>

      <div className={styles.origin}>
        <span className={styles.originLabel}>Origin</span> Aerospace Engineering &rarr;
        High Performance Scientific Computing &rarr; Data Science &rarr; Design &rarr; Art
      </div>
    </div>
  );
}
