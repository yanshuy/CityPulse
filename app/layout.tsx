import type React from "react";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { Suspense } from "react";
import { BottomNav } from "@/components/gumo/bottom-nav";

export const metadata: Metadata = {
  title: "CityPulse - Your Urban Assistant",
  description: "AI-powered urban assistant for traffic, events, food, and travel planning",
  generator: "Next.js",
  manifest: "/manifest.json",
  keywords: ["travel", "urban", "assistant", "AI", "traffic", "events", "food", "planner"],
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#facc15" },
    { media: "(prefers-color-scheme: dark)", color: "#facc15" },
  ],
  authors: [
    {
      name: "CityPulse Team",
    },
  ],
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "CityPulse",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "CityPulse",
    title: {
      default: "CityPulse - Your Urban Assistant",
      template: "%s - CityPulse",
    },
    description: "AI-powered urban assistant for traffic, events, food, and travel planning",
  },
  twitter: {
    card: "summary",
    title: {
      default: "CityPulse - Your Urban Assistant",
      template: "%s - CityPulse",
    },
    description: "AI-powered urban assistant for traffic, events, food, and travel planning",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="application-name" content="CityPulse" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="CityPulse" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/icons/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#facc15" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="theme-color" content="#facc15" />

        <link rel="apple-touch-icon" href="/icons/icon-152x152.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/icon-16x16.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="mask-icon" href="/icons/safari-pinned-tab.svg" color="#facc15" />
        <link rel="shortcut icon" href="/favicon.ico" />

        <meta name="twitter:card" content="summary" />
        <meta name="twitter:url" content="https://citypulse.app" />
        <meta name="twitter:title" content="CityPulse - Your Urban Assistant" />
        <meta name="twitter:description" content="AI-powered urban assistant for traffic, events, food, and travel planning" />
        <meta name="twitter:image" content="/icons/icon-192x192.png" />
        <meta name="twitter:creator" content="@citypulse" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="CityPulse - Your Urban Assistant" />
        <meta property="og:description" content="AI-powered urban assistant for traffic, events, food, and travel planning" />
        <meta property="og:site_name" content="CityPulse" />
        <meta property="og:url" content="https://citypulse.app" />
        <meta property="og:image" content="/icons/icon-512x512.png" />
      </head>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense>
          {children}
          <div className="fixed inset-x-0 bottom-3">
            <div className="mx-auto max-w-md px-4">
              <BottomNav />
            </div>
          </div>
          <Analytics />
        </Suspense>
      </body>
    </html>
  );
}
