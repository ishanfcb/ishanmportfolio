import { useEffect, useRef, useCallback } from "react";

const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_STALL_TIMEOUT = 8000;

interface UseVideoRetryOptions {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  src: string;
  enabled: boolean;
  maxRetries?: number;
  stallTimeoutMs?: number;
  onSuccess: () => void;
  onGiveUp: () => void;
}

// Hook to retry video loads on error or stall
export function useVideoRetry({
  videoRef,
  src,
  enabled,
  maxRetries = DEFAULT_MAX_RETRIES,
  stallTimeoutMs = DEFAULT_STALL_TIMEOUT,
  onSuccess,
  onGiveUp,
}: UseVideoRetryOptions) {
  const retryCount = useRef(0);
  const settled = useRef(false); // true once success or give-up called
  const stallTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = useCallback(() => {
    if (stallTimer.current) { clearTimeout(stallTimer.current); stallTimer.current = null; }
    if (retryTimer.current) { clearTimeout(retryTimer.current); retryTimer.current = null; }
  }, []);

  const doRetry = useCallback(() => {
    const video = videoRef.current;
    if (!video || settled.current) return;

    retryCount.current++;
    // Clear src and re-set after backoff to force a fresh request
    video.removeAttribute("src");
    video.load();

    const delay = 1000 * Math.pow(2, retryCount.current - 1); // 1s, 2s, 4s
    retryTimer.current = setTimeout(() => {
      const v = videoRef.current;
      if (!v || settled.current) return;
      v.src = src;
      v.load();
      // Reset stall timer for this new attempt
      if (stallTimer.current) clearTimeout(stallTimer.current);
      stallTimer.current = setTimeout(() => {
        const el = videoRef.current;
        if (!el || settled.current) return;
        if (el.readyState < 2) handleError();
      }, stallTimeoutMs);
    }, delay);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoRef, src, stallTimeoutMs]);

  const handleLoadedData = useCallback(() => {
    if (settled.current) return;
    settled.current = true;
    clearTimers();
    onSuccess();
  }, [clearTimers, onSuccess]);

  const handleError = useCallback(() => {
    if (settled.current) return;
    clearTimers();
    if (retryCount.current < maxRetries) {
      doRetry();
    } else {
      settled.current = true;
      onGiveUp();
    }
  }, [clearTimers, maxRetries, doRetry, onGiveUp]);

  // Start stall detection when enabled
  useEffect(() => {
    if (!enabled) return;
    settled.current = false;
    retryCount.current = 0;

    stallTimer.current = setTimeout(() => {
      const video = videoRef.current;
      if (!video || settled.current) return;
      if (video.readyState < 2) handleError();
    }, stallTimeoutMs);

    return () => {
      clearTimers();
      // Free queue slot on unmount if not yet settled
      if (!settled.current) {
        settled.current = true;
        onGiveUp();
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  return { handleLoadedData, handleError };
}

// Hook to play/pause video based on visibility
export function useVideoVisibility(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  isActive: boolean
): void {
  useEffect(() => {
    if (!isActive) return;
    const video = videoRef.current;
    if (!video) return;

    let isVisible = false;

    const tryPlay = () => {
      video.play().catch(() => {
        // Video not ready yet — retry once it can play
        video.addEventListener("canplay", () => {
          if (isVisible) video.play().catch(() => {});
        }, { once: true });
      });
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        isVisible = entry.isIntersecting;
        if (isVisible) {
          tryPlay();
        } else {
          video.pause();
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, [videoRef, isActive]);
}
