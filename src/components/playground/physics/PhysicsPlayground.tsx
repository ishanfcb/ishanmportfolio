"use client";

import { useEffect, useRef, useState } from "react";
import type { Body } from "planck";
import styles from "./PhysicsPlayground.module.css";

const LETTERS = [
  { id: "L", char: "L" },
  { id: "E", char: "E" },
  { id: "F1", char: "F" },
  { id: "F2", char: "F" },
  { id: "I", char: "I" },
  { id: "N", char: "N" },
];

const TAGS = [
  { id: "t_0", text: "MULTIDISCIPLINARY" },
  { id: "t_1", text: "INTERACTIVE" },
  { id: "t_2", text: "TECHNOLOGIST" },
  { id: "t_3", text: "INTROSPECTIVE" },
  { id: "t_4", text: "EMBODIED" },
  { id: "t_5", text: "IMMERSIVE" },
  { id: "t_6", text: "EXPERIMENTAL" },
  { id: "t_7", text: "HUMAN" },
  { id: "t_8", text: "STORYTELLER" },
  { id: "t_9", text: "BUILDER" },
];

// Pixels per meter for Box2D coordinate conversion
const PPM = 30;
const toM = (px: number) => px / PPM;
const toPx = (m: number) => m * PPM;
const FLOOR_INSET = 30;

export default function PhysicsPlayground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cursorElRef = useRef<HTMLDivElement>(null);
  const elRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const threadElRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const cleanupRef = useRef<(() => void) | null>(null);
  const mousePos = useRef<{ x: number; y: number } | null>(null);
  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 });

  // Observe container size
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setContainerSize({ w: width, h: height });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Track mouse/touch position
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onMouse = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      mousePos.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const onTouch = (e: TouchEvent) => {
      const rect = el.getBoundingClientRect();
      const t = e.touches[0];
      if (t) mousePos.current = { x: t.clientX - rect.left, y: t.clientY - rect.top };
    };
    const onLeave = () => { mousePos.current = null; };

    el.addEventListener("mousemove", onMouse);
    el.addEventListener("touchmove", onTouch, { passive: true });
    el.addEventListener("mouseleave", onLeave);
    el.addEventListener("touchend", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMouse);
      el.removeEventListener("touchmove", onTouch);
      el.removeEventListener("mouseleave", onLeave);
      el.removeEventListener("touchend", onLeave);
    };
  }, []);

  // Physics setup
  useEffect(() => {
    if (containerSize.w === 0 || !containerRef.current) return;

    let cancelled = false;
    let animId = 0;

    import("planck").then((planck) => {
      if (cancelled || !containerRef.current) return;

      const { World, Vec2, Box, Edge, RevoluteJoint } = planck;
      const cw = containerSize.w;
      const ch = containerSize.h;

      // Font sizing — scales with container, 128px on desktop, ~45px on phone
      const letterFontSize = Math.max(36, Math.min(cw * 0.12, 128));
      const tagFontSize = Math.max(9, Math.min(cw * 0.016, 14));

      // Set font sizes first
      for (const letter of LETTERS) {
        const el = elRefs.current[letter.id];
        if (el) el.style.fontSize = `${letterFontSize}px`;
      }
      for (const tag of TAGS) {
        const el = elRefs.current[tag.id];
        if (el) el.style.fontSize = `${tagFontSize}px`;
      }

      // Measure text elements
      const elSizes: Record<string, { w: number; h: number }> = {};
      for (const letter of LETTERS) {
        const el = elRefs.current[letter.id];
        if (el) elSizes[letter.id] = { w: el.offsetWidth, h: el.offsetHeight };
      }
      for (const tag of TAGS) {
        const el = elRefs.current[tag.id];
        if (el) elSizes[tag.id] = { w: el.offsetWidth, h: el.offsetHeight };
      }

      // Create world with gravity
      const world = World(Vec2(0, 15));

      // Floor (raised FLOOR_INSET px from bottom)
      const floorY = ch - FLOOR_INSET;
      const floorBody = world.createBody();
      floorBody.createFixture(
        Edge(Vec2(toM(-60), toM(floorY)), Vec2(toM(cw + 60), toM(floorY))),
        { friction: 0.6 }
      );

      // Left wall
      const leftBody = world.createBody();
      leftBody.createFixture(
        Edge(Vec2(0, toM(-ch)), Vec2(0, toM(ch * 2))),
        { friction: 0.3 }
      );

      // Right wall
      const rightBody = world.createBody();
      rightBody.createFixture(
        Edge(Vec2(toM(cw), toM(-ch)), Vec2(toM(cw), toM(ch * 2))),
        { friction: 0.3 }
      );

      // --- Hanging letters with thread bodies ---
      const totalLetterWidth = LETTERS.reduce((sum, l) => {
        const size = elSizes[l.id] || { w: 30, h: 40 };
        return sum + size.w;
      }, 0);
      const letterSpacing = Math.min(cw * 0.02, 12);
      const totalSpan = totalLetterWidth + (LETTERS.length - 1) * letterSpacing;
      const startX = (cw - totalSpan) / 2;

      const threadLengthPx = ch * 0.45;
      const threadWidthPx = 1;
      const threadHalfH = toM(threadLengthPx / 2);
      const threadHalfW = toM(threadWidthPx / 2);

      const bodies: Record<string, Body> = {};
      const threadBodies: Record<string, Body> = {};

      let currentX = startX;
      for (const letter of LETTERS) {
        const size = elSizes[letter.id] || { w: 30, h: 40 };
        const boxW = size.w * 0.6;
        const boxH = size.h * 0.6;
        const letterHalfH = toM(boxH / 2);

        const anchorXPx = currentX + size.w / 2;

        // Static anchor body at ceiling
        const anchorBody = world.createBody({
          type: "static",
          position: Vec2(toM(anchorXPx), 0),
        });

        // Thread body: thin rectangle, sensor (no collision), connects anchor to letter
        const threadCenterYPx = threadLengthPx / 2;
        const threadBody = world.createDynamicBody({
          position: Vec2(toM(anchorXPx), toM(threadCenterYPx)),
          linearDamping: 0.4,
          angularDamping: 0.6,
        });
        threadBody.createFixture(
          Box(threadHalfW, threadHalfH),
          { density: 0.1, isSensor: true }
        );
        threadBodies[letter.id] = threadBody;

        // Set thread element size
        const threadEl = threadElRefs.current[letter.id];
        if (threadEl) {
          threadEl.style.width = `${threadWidthPx}px`;
          threadEl.style.height = `${threadLengthPx}px`;
        }

        // RevoluteJoint: anchor ↔ top of thread
        const topJointPt = Vec2(toM(anchorXPx), 0);
        world.createJoint(RevoluteJoint({}, anchorBody, threadBody, topJointPt));

        // Letter body
        const bodyCenterYPx = threadLengthPx + boxH / 2;
        const body = world.createDynamicBody({
          position: Vec2(
            toM(anchorXPx + (Math.random() - 0.5) * 20),
            toM(bodyCenterYPx)
          ),
          linearDamping: 0.5,
          angularDamping: 0.3,
        });
        body.createFixture(
          Box(toM(boxW / 2), letterHalfH),
          { density: 0.8, friction: 0.3, restitution: 0.2 }
        );
        bodies[letter.id] = body;

        // RevoluteJoint: bottom of thread ↔ top of letter body
        const bottomJointPt = Vec2(toM(anchorXPx), toM(threadLengthPx));
        world.createJoint(RevoluteJoint({}, threadBody, body, bottomJointPt));

        currentX += size.w + letterSpacing;
      }

      // --- Falling word tags ---
      for (let i = 0; i < TAGS.length; i++) {
        const tag = TAGS[i];
        const size = elSizes[tag.id] || { w: 80, h: 24 };

        const xPx = cw * 0.1 + Math.random() * cw * 0.8;
        const yPx = -40 - i * 50 - Math.random() * 30;

        const body = world.createDynamicBody({
          position: Vec2(toM(xPx), toM(yPx)),
          angle: (Math.random() - 0.5) * 0.3,
          linearDamping: 0.5,
          angularDamping: 0.5,
        });
        body.createFixture(
          Box(toM(size.w / 2), toM(size.h / 2)),
          { density: 0.8, friction: 0.5, restitution: 0.25 }
        );
        bodies[tag.id] = body;
      }

      // --- Cursor body (visible red box, follows mouse via kinematic) ---
      const cursorSizePx = Math.max(12, Math.min(cw * 0.02, 18));
      const cursorBody = world.createBody({
        type: "kinematic",
        position: Vec2(toM(-100), toM(-100)),
      });
      cursorBody.createFixture(
        Box(toM(cursorSizePx / 2), toM(cursorSizePx / 2)),
        { density: 0, friction: 0, restitution: 0.15 }
      );

      // Animation loop
      const timeStep = 1 / 60;
      let lastTime = performance.now();
      let accumulator = 0;
      let cursorWasOffscreen = true;

      const animate = (now: number) => {
        const frameDelta = Math.min((now - lastTime) / 1000, 0.05);
        lastTime = now;
        accumulator += frameDelta;

        // Move cursor body
        const cursorEl = cursorElRef.current;
        if (mousePos.current) {
          const targetPos = Vec2(toM(mousePos.current.x), toM(mousePos.current.y));
          if (cursorWasOffscreen) {
            cursorBody.setPosition(targetPos);
            cursorBody.setLinearVelocity(Vec2(0, 0));
            cursorWasOffscreen = false;
          } else {
            const curPos = cursorBody.getPosition();
            cursorBody.setLinearVelocity(Vec2(
              (targetPos.x - curPos.x) / timeStep,
              (targetPos.y - curPos.y) / timeStep,
            ));
          }
          if (cursorEl) {
            cursorEl.style.transform = `translate(${mousePos.current.x - cursorSizePx / 2}px, ${mousePos.current.y - cursorSizePx / 2}px)`;
            cursorEl.style.opacity = "1";
          }
        } else {
          cursorBody.setLinearVelocity(Vec2(0, 0));
          cursorBody.setPosition(Vec2(toM(-100), toM(-100)));
          cursorWasOffscreen = true;
          if (cursorEl) cursorEl.style.opacity = "0";
        }

        // Fixed timestep physics
        while (accumulator >= timeStep) {
          world.step(timeStep, 12, 10);
          accumulator -= timeStep;
        }

        // Sync letter + thread positions
        for (const letter of LETTERS) {
          const el = elRefs.current[letter.id];
          const body = bodies[letter.id];
          if (!el || !body) continue;

          const size = elSizes[letter.id] || { w: 30, h: 40 };
          const pos = body.getPosition();
          const angle = body.getAngle();
          el.style.transform = `translate(${toPx(pos.x) - size.w / 2 + 3}px, ${toPx(pos.y) - size.h / 2 + 3}px) rotate(${angle}rad)`;

          // Thread body — same transform pattern, no trig needed
          const threadBody = threadBodies[letter.id];
          const threadEl = threadElRefs.current[letter.id];
          if (threadBody && threadEl) {
            const tp = threadBody.getPosition();
            const ta = threadBody.getAngle();
            threadEl.style.transform = `translate(${toPx(tp.x) - threadWidthPx / 2}px, ${toPx(tp.y) - threadLengthPx / 2}px) rotate(${ta}rad)`;
          }
        }

        // Sync tag positions
        for (const tag of TAGS) {
          const el = elRefs.current[tag.id];
          const body = bodies[tag.id];
          if (!el || !body) continue;

          const size = elSizes[tag.id] || { w: 80, h: 24 };
          const pos = body.getPosition();
          const angle = body.getAngle();
          el.style.transform = `translate(${toPx(pos.x) - size.w / 2}px, ${toPx(pos.y) - size.h / 2}px) rotate(${angle}rad)`;
        }

        animId = requestAnimationFrame(animate);
      };
      animId = requestAnimationFrame(animate);

      cleanupRef.current = () => {
        cancelAnimationFrame(animId);
      };
    });

    return () => {
      cancelled = true;
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, [containerSize]);

  return (
    <div ref={containerRef} className={styles.container}>
      {/* Thread divs — thin rectangles, positioned by Box2D */}
      {LETTERS.map((letter) => (
        <div
          key={`thread-${letter.id}`}
          ref={(el) => { threadElRefs.current[letter.id] = el; }}
          className={styles.thread}
        />
      ))}
      {LETTERS.map((letter) => (
        <div
          key={letter.id}
          ref={(el) => { elRefs.current[letter.id] = el; }}
          className={styles.letter}
        >
          {letter.char}
        </div>
      ))}
      {TAGS.map((tag) => (
        <div
          key={tag.id}
          ref={(el) => { elRefs.current[tag.id] = el; }}
          className={styles.tag}
        >
          {tag.text}
        </div>
      ))}
      <div ref={cursorElRef} className={styles.cursorDot} />
      <div className={styles.groundLine} style={{ bottom: `${FLOOR_INSET}px` }} />
    </div>
  );
}
