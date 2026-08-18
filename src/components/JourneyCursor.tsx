'use client';

import React, { useEffect, useRef } from 'react';

export default function JourneyCursor() {
  const horizRef = useRef<SVGLineElement>(null);
  const vertRef = useRef<SVGLineElement>(null);
  const dotRef = useRef<SVGCircleElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const horiz = horizRef.current;
    const vert = vertRef.current;
    const dot = dotRef.current;
    const svg = svgRef.current;
    if (!horiz || !vert || !dot || !svg) return;

    let isVisible = false;

    if (window.matchMedia('(pointer: fine)').matches) {
      document.body.classList.add('custom-cursor-active');
    }

    const handleMouseMove = (e: MouseEvent) => {
      const mouseX = e.clientX;
      const mouseY = e.clientY;

      if (!isVisible) {
        isVisible = true;
        svg.style.opacity = '1';
      }

      horiz.setAttribute('y1', `${mouseY}`);
      horiz.setAttribute('y2', `${mouseY}`);
      vert.setAttribute('x1', `${mouseX}`);
      vert.setAttribute('x2', `${mouseX}`);

      dot.setAttribute('cx', `${mouseX}`);
      dot.setAttribute('cy', `${mouseY}`);
    };

    const handleMouseLeave = () => {
      isVisible = false;
      svg.style.opacity = '0';
    };

    const handleMouseEnter = () => {
      isVisible = true;
      svg.style.opacity = '1';
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const isInteractive = target.closest('a, button, input, textarea, [role="button"], [data-cursor], .card');
      if (isInteractive) {
        dot.setAttribute('r', '7');
      } else {
        dot.setAttribute('r', '4');
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
    <svg
      ref={svgRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 999999,
        mixBlendMode: 'difference',
        opacity: 0,
        transition: 'opacity 0.25s ease',
      }}
      aria-hidden="true"
    >
      <line
        ref={horizRef}
        x1="0"
        y1="-100"
        x2="100%"
        y2="-100"
        stroke="#ffffff"
        strokeWidth="0.5"
        opacity="0.14"
      />
      <line
        ref={vertRef}
        x1="-100"
        y1="0"
        x2="-100"
        y2="100%"
        stroke="#ffffff"
        strokeWidth="0.5"
        opacity="0.14"
      />
      <circle
        ref={dotRef}
        cx="-100"
        cy="-100"
        r="4"
        fill="#ffffff"
        style={{ transition: 'r 0.2s ease' }}
      />
    </svg>
  );
}