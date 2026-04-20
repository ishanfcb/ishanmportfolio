"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export default function ScrollTracker() {
    const pathname = usePathname();
    const trackedDepths = useRef<Set<number>>(new Set());

    useEffect(() => {
        // Reset tracked depths on route change
        trackedDepths.current = new Set();

        const handleScroll = () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;

            if (docHeight <= 0) return;

            const scrollPercent = Math.round((scrollTop / docHeight) * 100);

            // Track at 25%, 50%, 75%, 100%
            const milestones = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

            for (const milestone of milestones) {
                if (scrollPercent >= milestone && !trackedDepths.current.has(milestone)) {
                    trackedDepths.current.add(milestone);
                    window.umami?.track("scroll-depth", {
                        depth: `${milestone}%`,
                        page: pathname
                    });
                }
            }
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, [pathname]);

    return null;
}
