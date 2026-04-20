"use client";

import { useRef } from "react";
import { useVideoVisibility, useVideoRetry } from "./hooks";

interface VideoVariant {
  quality: string;
  path: string;
}

interface ResponsiveVideoProps {
  src: string;
  poster?: string;
  variants?: VideoVariant[];
  className?: string;
  controls?: boolean;
}

/**
 * Video player that supports multiple quality variants.
 * Falls back to the original src if no variants are provided.
 * Uses IntersectionObserver to play/pause based on visibility.
 */
export default function ResponsiveVideo({
  src,
  poster,
  variants,
  className,
  controls,
}: ResponsiveVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  useVideoVisibility(videoRef, !controls);

  const noop = () => {};
  const { handleLoadedData, handleError } = useVideoRetry({
    videoRef,
    src,
    enabled: true,
    onSuccess: noop,
    onGiveUp: noop,
  });

  // If we have variants, use them as <source> elements (browser picks best)
  // Order: highest quality first, browser will pick what it can handle
  if (variants && variants.length > 0) {
    return (
      <video
        ref={videoRef}
        loop={!controls}
        muted={!controls}
        playsInline
        preload="metadata"
        poster={poster}
        className={className}
        controls={controls}
        onLoadedData={handleLoadedData}
        onError={handleError}
      >
        {variants.map((v) => (
          <source key={v.quality} src={v.path} type={v.path.endsWith('.webm') ? 'video/webm' : 'video/mp4'} />
        ))}
        {/* Fallback to original */}
        <source src={src} type={src.endsWith('.webm') ? 'video/webm' : 'video/mp4'} />
      </video>
    );
  }

  return (
    <video
      ref={videoRef}
      src={src}
      loop={!controls}
      muted={!controls}
      playsInline
      preload="metadata"
      poster={poster}
      className={className}
      controls={controls}
      onLoadedData={handleLoadedData}
      onError={handleError}
    />
  );
}
