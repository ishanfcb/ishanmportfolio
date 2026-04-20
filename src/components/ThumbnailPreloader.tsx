"use client";

import { useEffect } from "react";
import type { Project } from "@/data/projects";
import { loadedMedia } from "./mediaLoadStore";

export default function ThumbnailPreloader({
  projects,
}: {
  projects: Project[];
}) {
  useEffect(() => {
    const toPreload = projects.filter((p) => !loadedMedia.has(p.thumbnail));
    if (toPreload.length === 0) return;

    let cancelled = false;
    let currentIndex = 0;

    const preloadNext = () => {
      if (cancelled || currentIndex >= toPreload.length) return;

      const src = toPreload[currentIndex].thumbnail;
      const isVideo = /\.(mp4|webm|ogg)$/i.test(src);

      const advance = () => {
        currentIndex++;
        preloadNext();
      };

      if (isVideo) {
        const video = document.createElement("video");
        video.preload = "auto";
        video.src = src;
        video.oncanplaythrough = () => {
          loadedMedia.add(src);
          advance();
        };
        video.onerror = advance;
      } else {
        const img = new Image();
        img.src = src;
        img.onload = () => {
          loadedMedia.add(src);
          advance();
        };
        img.onerror = advance;
      }
    };

    // Let the landing page content load first, then preload during idle time
    const timeoutId = setTimeout(() => {
      if ("requestIdleCallback" in window) {
        requestIdleCallback(() => preloadNext());
      } else {
        preloadNext();
      }
    }, 2000);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [projects]);

  return null;
}
