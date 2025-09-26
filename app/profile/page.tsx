"use client"

import Image from "next/image"
import { useState } from "react"
import { BottomNav } from "@/components/gumo/bottom-nav"
import { Heart, Grid2X2, Bookmark, Settings } from "lucide-react"
import NotificationSettings from "@/components/notifications/notification-settings"

export default function ProfilePage() {
  const [following, setFollowing] = useState(false)
  const [tab, setTab] = useState<"posts" | "liked" | "bucket" | "settings">("posts")

  return (
    <main className="mx-auto max-w-md min-h-dvh">
      {/* Header */}
      <section className="px-4 pt-6 pb-5 rounded-b-[2rem] bg-[color:var(--gumo-surface)]/60">
        <div className="flex items-center gap-4">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-[color:var(--gumo-yellow)] text-black text-3xl">
            ☺
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-semibold">Gumo Traveller</h1>
            <p className="text-sm text-white/70">@gumo.me</p>
            <p className="mt-1 text-sm">
              <span className="font-medium">100</span> Followers • <span className="font-medium">10</span> Trips
            </p>
          </div>
          <button
            className={[
              "rounded-xl px-3 py-1.5 text-sm",
              following ? "bg-[color:var(--gumo-surface)] text-white" : "bg-[color:var(--gumo-yellow)] text-black",
            ].join(" ")}
            onClick={() => setFollowing((f) => !f)}
          >
            {following ? "Following" : "Follow"}
          </button>
        </div>

        <p className="mt-4 text-white/80">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean commodo ligula eget dolor.
        </p>

        <div className="mt-4 grid grid-cols-3 rounded-2xl bg-black/20 text-center py-3">
          <div>
            <div className="text-2xl font-semibold">12</div>
            <div className="text-xs text-white/70">Curated Stays</div>
          </div>
          <div>
            <div className="text-2xl font-semibold">24</div>
            <div className="text-xs text-white/70">Stays Booked</div>
          </div>
          <div>
            <div className="text-2xl font-semibold">4/5</div>
            <div className="text-xs text-white/70">Trust Score</div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div className="px-4 mt-5">
        <div className="flex items-center gap-6 border-b border-white/10">
          <button
            onClick={() => setTab("posts")}
            className={[
              "pb-3 inline-flex items-center gap-2",
              tab === "posts" ? "text-[color:var(--gumo-yellow)]" : "text-white/70",
            ].join(" ")}
          >
            <Grid2X2 className="size-4" /> Posts
          </button>
          <button
            onClick={() => setTab("liked")}
            className={[
              "pb-3 inline-flex items-center gap-2",
              tab === "liked" ? "text-[color:var(--gumo-yellow)]" : "text-white/70",
            ].join(" ")}
          >
            <Heart className="size-4" /> Liked Posts
          </button>
          <button
            onClick={() => setTab("bucket")}
            className={[
              "pb-3 inline-flex items-center gap-2",
              tab === "bucket" ? "text-[color:var(--gumo-yellow)]" : "text-white/70",
            ].join(" ")}
          >
            <Bookmark className="size-4" /> Bucket List
          </button>
          <button
            onClick={() => setTab("settings")}
            className={[
              "pb-3 inline-flex items-center gap-2",
              tab === "settings" ? "text-[color:var(--gumo-yellow)]" : "text-white/70",
            ].join(" ")}
          >
            <Settings className="size-4" /> Settings
          </button>
        </div>

        {/* Content */}
        {tab === "settings" ? (
          <div className="mt-4 space-y-4">
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-[color:var(--gumo-text)] px-1 flex items-center gap-2">
                <Settings className="h-5 w-5 text-[color:var(--gumo-yellow)]" />
                App Settings
              </h2>
              <NotificationSettings />
            </div>
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="gumo-card overflow-hidden">
                <Image
                  src={`/travel-post-.jpg?height=400&width=600&query=travel-post-${i + 1}`}
                  alt=""
                  width={600}
                  height={400}
                  className="h-36 w-full object-cover"
                />
                <div className="p-2">
                  <p className="text-sm text-white/90">Madgaon, Goa</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </main>
  )
}
