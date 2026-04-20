"use client";

import { useEffect, useState } from "react";
import styles from "./PagePreloader.module.css";

interface PagePreloaderProps {
    backgroundColor?: string; // defaults to --background
    fadeDuration?: number;    // ms
    children?: React.ReactNode; // optional: loader icon, logo, etc.
}

export default function PagePreloader({
    backgroundColor = "var(--background)",
    children,
}: PagePreloaderProps) {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const handleLoad = () => setIsLoaded(true);

        if (document.readyState === "complete") {
            setIsLoaded(true);
        } else {
            window.addEventListener("load", handleLoad);
            return () => window.removeEventListener("load", handleLoad);
        }
    }, []);

    return (
        <div
            className={`${styles.preloader} ${isLoaded ? styles.hidden : ""}`}
            style={{
                backgroundColor,
            }}
        >
            {children}
        </div>
    );
}
