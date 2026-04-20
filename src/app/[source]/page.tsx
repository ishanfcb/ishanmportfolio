import { notFound } from "next/navigation";
import { trackingSources } from "@/config/trackingSources";
import SourceTracker from "./SourceTracker";

export default async function SourcePage({ params }: { params: Promise<{ source: string }> }) {
    const { source } = await params;
    const trackingName = trackingSources[source];

    if (!trackingName) {
        notFound();
    }

    return <SourceTracker trackingName={trackingName} />;
}
