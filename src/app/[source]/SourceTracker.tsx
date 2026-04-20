"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SourceTracker({ trackingName }: { trackingName: string }) {
    const router = useRouter();

    useEffect(() => {
        window.umami?.track("source", { from: trackingName });
        router.replace("/");
    }, [trackingName, router]);

    return null;
}
