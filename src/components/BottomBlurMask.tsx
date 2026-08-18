"use client";

import { useEffect, useState } from "react";

export default function BottomBlurMask() {
  const [hideAtFooter, setHideAtFooter] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollBottom = window.scrollY + window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      if (documentHeight - scrollBottom < 140) {
        setHideAtFooter(true);
      } else {
        setHideAtFooter(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className="bottomViewportBlurMask"
      style={{
        opacity: hideAtFooter ? 0 : 1,
        transition: "opacity 0.4s ease",
      }}
      aria-hidden="true"
    />
  );
}