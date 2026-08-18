'use client';

import React, { useEffect, useRef } from 'react';
import styles from './JourneyCursor.module.css';

export default function JourneyCursor() {
  const containerRef = useRef<HTMLDivElement>(null);
  const horizRef = useRef<HTMLDivElement>(null);
  const vertRef = useRef<HTMLDivElement>(null);
  const reticleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const horiz = horizRef.current;
    const vert = vertRef.current;
    const reticle = reticleRef.current;
    if (!container || !horiz || !vert || !reticle) return;

    let isVisible = false;

    // Hide default cursor on desktop fine-pointer devices
    if (window.matchMedia('(pointer: fine)').matches) {
      document.body.classList.add('custom-cursor-active');
    }

    const handleMouseMove = (e: MouseEvent) => {
      const mouseX = e.clientX;
      const mouseY = e.clientY;

      if (!isVisible) {
        isVisible = true;
        container.style.opacity = '1';
      }

      horiz.style.transform = `translate3d(0, ${mouseY}px, 0)`;
      vert.style.transform = `translate3d(${mouseX}px, 0, 0)`;
      reticle.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
    };

    const handleMouseLeave = () => {
      isVisible = false;
      container.style.opacity = '0';
    };

    const handleMouseEnter = () => {
      isVisible = true;
      container.style.opacity = '1';
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const isInteractive = target.closest('a, button, input, textarea, [role="button"], [data-cursor], .card');
      if (isInteractive) {
        container.classList.add(styles.cursorHovered);
      } else {
        container.classList.remove(styles.cursorHovered);
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.body.addEventListener('mouseleave', handleMouseLeave);
    document.body.addEventListener('mouseenter', handleMouseEnter);
    window.addEventListener('mouseover', handleMouseOver, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.body.removeEventListener('mouseleave', handleMouseLeave);
      document.body.removeEventListener('mouseenter', handleMouseEnter);
      window.removeEventListener('mouseover', handleMouseOver);
      document.body.classList.remove('custom-cursor-active');
    };
  }, []);

  return (
    <div ref={containerRef} className={styles.cursorContainer} aria-hidden="true">
      <div ref={horizRef} className={styles.crosshairHorizontal} />
      <div ref={vertRef} className={styles.crosshairVertical} />
      <div ref={reticleRef} className={styles.reticle} />
    </div>
  );
}