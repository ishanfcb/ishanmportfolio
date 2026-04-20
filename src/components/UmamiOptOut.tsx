"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function UmamiOptOut() {
    const searchParams = useSearchParams();

    useEffect(() => {
        // Check for ?notrack parameter to disable tracking
        if (searchParams.has("notrack")) {
            localStorage.setItem("umami.disabled", "true");
            // Remove the parameter from URL without reload
            const url = new URL(window.location.href);
            url.searchParams.delete("notrack");
            window.history.replaceState({}, "", url.pathname);
            console.log("Umami tracking disabled for this browser");
        }

        // Check for ?track parameter to re-enable tracking
        if (searchParams.has("track")) {
            localStorage.removeItem("umami.disabled");
            const url = new URL(window.location.href);
            url.searchParams.delete("track");
            window.history.replaceState({}, "", url.pathname);
            console.log("Umami tracking re-enabled for this browser");
        }
    }, [searchParams]);

    return null;
}
