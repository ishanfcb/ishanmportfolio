"use client";

import { useEffect, useRef } from "react";

const SIZE = 12;
const HOVER_SCALE = 2;
const INTERACTIVE = "a, button, [role='button'], input, textarea, select";

export default function CustomCursor() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let hovering = false;
    let cx = 0;
    let cy = 0;

    const update = () => {
      const s = hovering ? HOVER_SCALE : 1;
      el.style.transform = `translate(${cx - SIZE / 2}px, ${cy - SIZE / 2}px) scale(${s})`;
    };

    const onMove = (e: PointerEvent) => {
      cx = e.clientX;
      cy = e.clientY;
      update();
      el.style.opacity = "1";
    };

    const onOver = (e: Event) => {
      if ((e.target as Element)?.closest(INTERACTIVE)) {
        hovering = true;
        update();
      }
    };

    const onOut = (e: Event) => {
      if ((e.target as Element)?.closest(INTERACTIVE)) {
        hovering = false;
        update();
      }
    };

    const onLeave = () => {
      el.style.opacity = "0";
    };

    window.addEventListener("pointermove", onMove);
    document.addEventListener("pointerover", onOver);
    document.addEventListener("pointerout", onOut);
    document.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerout", onOut);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: SIZE,
        height: SIZE,
        backgroundColor: "var(--accent)",
        pointerEvents: "none",
        zIndex: "var(--z-cursor)",
        opacity: 0,
        willChange: "transform",
      }}
    />
  );
}
