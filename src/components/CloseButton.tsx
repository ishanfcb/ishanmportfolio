"use client";
import { useRouter, usePathname } from "next/navigation";
import styles from "./ProjectPage.module.css";

export default function CloseButton() {
    const router = useRouter();
    const pathname = usePathname();

    const handleClick = () => {
        // Track close button click with current project
        const projectSlug = pathname.split('/').pop() || 'unknown';
        window.umami?.track('close-button-click', { project: projectSlug });

        const cameFromSite = sessionStorage.getItem('navigated-from-landing');
        if (cameFromSite) {
            sessionStorage.removeItem('navigated-from-landing');
            window.history.back();
        } else {
            router.push("/projects");
        }
    };

    return (
        <button className={styles.closeButton} onClick={handleClick} aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="1" y1="1" x2="17" y2="17" />
                <line x1="17" y1="1" x2="1" y2="17" />
            </svg>
        </button>
    );
}
