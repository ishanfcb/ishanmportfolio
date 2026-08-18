'use client';

import React, { useEffect, useState, useRef } from 'react';
import styles from './JourneyCursor.module.css';

export default function JourneyCursor() {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const posRef = useRef({ x: -100, y: -100 });
  const reqRef = useRef<number | null>(null);

  useEffect(() => {
    // Hide default cursor on desktop fine-pointer devices
    if (window.matchMedia('(pointer: fine)').matches) {
      document.body.classList.add('custom-cursor-active');
    }

    const updatePosition = () => {
      if (containerRef.current) {
        containerRef.current.style.setProperty('--cursor-x', `${posRef.current.x}px`);
        containerRef.current.style.setProperty('--cursor-y', `${posRef.current.y}px`);
      }
      reqRef.current = null;
    };

    const handleMouseMove = (e: MouseEvent) => {
      posRef.current = { x: e.clientX, y: e.clientY };
      if (!isVisible) setIsVisible(true);
      if (!reqRef.current) {
        reqRef.current = requestAnimationFrame(updatePosition);
      }
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const isInteractive = target.closest('a, button, input, textarea, [role="button"], [data-cursor], .card');
      if (isInteractive) {
        setIsHovered(true);
      } else {
        setIsHovered(false);
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
      if (reqRef.current) cancelAnimationFrame(reqRef.current);
      document.body.classList.remove('custom-cursor-active');
    };
  }, [isVisible]);

  return (
    <div
      ref={containerRef}
      className={`${styles.cursorContainer} ${isVisible ? styles.cursorVisible : ''} ${
        isHovered ? styles.cursorHovered : ''
      }`}
      aria-hidden="true"
    >
      <div className={styles.crosshairHorizontal} />
      <div className={styles.crosshairVertical} />
      <div className={styles.reticle} />
    </div>
  );
}