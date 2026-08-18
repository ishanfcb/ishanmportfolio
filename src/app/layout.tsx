import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import Nav from "@/components/Nav";
import UmamiOptOut from "@/components/UmamiOptOut";
import UmamiLoader from "@/components/UmamiLoader";
import ScrollTracker from "@/components/ScrollTracker";
import Footer from "@/components/Footer";
import JourneyCursor from "@/components/JourneyCursor";

import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/next"

export const metadata: Metadata = {
  title: {
    default: "ishan - Portfolio Home",
    template: "ishan - %s",
  },
  description: "ishan is an artist who blends technology and creativity. Explore his immersive projects here.",
  openGraph: {
    title: "ishan | Interactive & Experiential Artist",
    description: "ishan is an artist who blends technology and creativity. Explore his immersive projects here.",
    url: "https://leff.in",
    siteName: "ishan Portfolio",
    images: [
      {
        url: "https://leff.in/ishan_opengraphimage.png",
        width: 1200,
        height: 630,
        alt: "Ishan Portfolio Preview",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ishan | Interactive & Experiential Artist",
    description: "ishan is an artist who blends technology and creativity. Explore his immersive projects here.",
    images: ["https://leff.in/ishan_opengraphimage.png"],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://use.typekit.net" crossOrigin="anonymous" />
        <link rel="stylesheet" href="https://use.typekit.net/qje5ynx.css" />
      </head>
      <body>
        <a href="#main-content" className="skip-to-content">
          Skip to content
        </a>
        <JourneyCursor />
        <Suspense fallback={null}>
          <UmamiOptOut />
          <ScrollTracker />
        </Suspense>
        <Nav />
        <div id="main-content" style={{ position: "relative", minHeight: "100vh", backgroundColor: "var(--background)", paddingBottom: "var(--space-xl)" }}>
          {children}
        </div>
        <Footer />
        <SpeedInsights />
        <Analytics />
        <UmamiLoader />
      </body>
    </html>
  );
}
