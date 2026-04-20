"use client";

import { useEffect } from "react";

const UMAMI_SRC = "https://cloud.umami.is/script.js";
const WEBSITE_ID = "836b2b5c-a53a-48d3-88d4-06959b33b93d";

export default function UmamiLoader() {
    useEffect(() => {
        if (localStorage.getItem("umami.disabled") === "true") return;

        let loaded = false;

        function loadUmami() {
            if (loaded) return;
            loaded = true;

            const script = document.createElement("script");
            script.defer = true;
            script.src = UMAMI_SRC;
            script.dataset.websiteId = WEBSITE_ID;
            script.dataset.domains = "leff.in";
            document.head.appendChild(script);

            events.forEach((e) => window.removeEventListener(e, loadUmami));
        }

        const events: (keyof WindowEventMap)[] = [
            "mousemove",
            "scroll",
            "click",
            "touchstart",
            "keydown",
        ];

        events.forEach((e) =>
            window.addEventListener(e, loadUmami, { once: true, passive: true })
        );

        return () => {
            events.forEach((e) => window.removeEventListener(e, loadUmami));
        };
    }, []);

    return null;
}
