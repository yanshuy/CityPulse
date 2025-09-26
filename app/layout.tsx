import type React from "react";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { Suspense } from "react";
import { BottomNav } from "@/components/gumo/bottom-nav";

export const metadata: Metadata = {
  title: "v0 App",
  description: "Created with v0",
  generator: "v0.app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
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
