"use client"

import Image from "next/image"
import { useMemo, useState } from "react"
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, MapPin, Play } from "lucide-react"
import { BottomNav } from "@/components/gumo/bottom-nav"

type Reel = {
  id: string
  image: string
  creator: string
  location: string
  likes: number
  comments: number
}

const MOCK_REELS: Reel[] = [
  {
    id: "1",
    image: "/hiker-on-trail.jpg",
    creator: "Mishal Muneer",
    location: "Madgaon, Goa",
    likes: 1000000,
    comments: 200,
  },
  {
    id: "2",
    image: "/beach-sunset.jpg",
    creator: "Aditi Rao",
    location: "South Goa",
    likes: 24510,
    comments: 98,
  },
]

export default function ExplorePage({ searchParams }: { searchParams?: { prompt?: string } }) {
  const [index, setIndex] = useState(0)
  const [liked, setLiked] = useState(false)
  const [saved, setSaved] = useState(false)
  const reel = useMemo(() => MOCK_REELS[index % MOCK_REELS.length], [index])

  return (
    <main className="relative mx-auto max-w-md min-h-dvh">
      <article className="relative h-[84dvh] overflow-hidden rounded-b-[2rem]">
        <Image src={reel.image || "/placeholder.svg"} alt="Travel reel" fill className="object-cover" priority />
        <button
          className="absolute left-3 top-3 rounded-xl bg-[color:var(--gumo-bg)]/50 px-3 py-1.5 text-[color:var(--gumo-yellow)] font-semibold"
          onClick={() => alert("Mock: menu")}
        >
          gumo
        </button>

        {/* Right action rail */}
        <div className="absolute right-3 top-1/3 flex flex-col items-center gap-4">
          <button
            className="grid place-items-center rounded-xl bg-[color:var(--gumo-bg)]/60 p-3"
            onClick={() => setLiked((s) => !s)}
          >
            <Heart
              className={`size-6 ${liked ? "fill-[color:var(--gumo-yellow)] text-[color:var(--gumo-yellow)]" : "text-white"}`}
            />
            <span className="mt-1 text-xs text-white/80">{(reel.likes + (liked ? 1 : 0)).toLocaleString()}</span>
          </button>
          <button
            className="grid place-items-center rounded-xl bg-[color:var(--gumo-bg)]/60 p-3"
            onClick={() => alert("Mock: open comments")}
          >
            <MessageCircle className="size-6 text-white" />
            <span className="mt-1 text-xs text-white/80">{reel.comments}</span>
          </button>
          <button
            className="grid place-items-center rounded-xl bg-[color:var(--gumo-bg)]/60 p-3"
            onClick={() => alert("Mock: share")}
          >
            <Send className="size-6 text-white" />
          </button>
          <button
            className="grid place-items-center rounded-xl bg-[color:var(--gumo-bg)]/60 p-3"
            onClick={() => setSaved((s) => !s)}
          >
            <Bookmark className={`size-6 ${saved ? "text-[color:var(--gumo-yellow)]" : "text-white"}`} />
          </button>
        </div>

        {/* Creator info */}
        <div className="absolute left-3 right-3 bottom-24 text-white">
          <div className="flex items-center gap-3">
            <Image src="/placeholder-user.jpg" alt="" width={36} height={36} className="rounded-full" />
            <div className="flex-1">
              <p className="font-medium">{reel.creator}</p>
              <p className="text-sm text-white/70">Lorem ipsum dolor sit amet, consectetur…</p>
            </div>
            <button className="rounded-xl border border-white/30 px-3 py-1 text-sm">Follow</button>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <button className="rounded-xl bg-[color:var(--gumo-surface)] text-white px-3 py-2 text-sm border border-[color:var(--gumo-purple)]/40">
              <span className="inline-flex items-center gap-2">
                <Play className="size-4" /> Explore Itinerary
              </span>
            </button>
            <span className="ml-2 inline-flex items-center gap-1 text-sm text-white/80">
              <MapPin className="size-4" /> {reel.location}
            </span>
            <button className="ml-auto grid place-items-center rounded-xl bg-[color:var(--gumo-bg)]/60 p-2">
              <MoreHorizontal className="size-5" />
            </button>
          </div>
        </div>
      </article>

      {/* Simple pagination mock */}
      <div className="mx-4 mt-4">
        <div className="flex items-center justify-between">
          <button
            className="gumo-card px-4 py-2"
            onClick={() => setIndex((i) => (i - 1 + MOCK_REELS.length) % MOCK_REELS.length)}
          >
            Previous
          </button>
          <button className="gumo-card px-4 py-2" onClick={() => setIndex((i) => (i + 1) % MOCK_REELS.length)}>
            Next
          </button>
        </div>
      </div>
    </main>
  )
}
