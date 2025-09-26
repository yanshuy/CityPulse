"use client"

import Image from "next/image"

type POI = {
  time: string
  duration: string
  title: string
  rating: number
  ratingsCount: number
  imageSrc: string
  notes?: string[]
}

export function PoiCard({ poi }: { poi: POI }) {
  return (
    <div className="rounded-2xl bg-card ring-1 ring-[color:var(--border)] p-4 flex gap-4 items-start">
      <Image
        src={poi.imageSrc || "/placeholder.svg"}
        alt={poi.title}
        width={80}
        height={80}
        className="h-16 w-16 rounded-lg object-cover"
      />
      <div className="flex-1 min-w-0">
        <div className="text-xs text-muted-foreground">
          {poi.time} • Duration {poi.duration}
        </div>
        <div className="mt-1 font-semibold">{poi.title}</div>
        <div className="mt-1 text-xs text-muted-foreground flex items-center gap-1">
          <span className="text-yellow-400">★</span>
          <span>{poi.rating.toFixed(1)}</span>
          <span>({poi.ratingsCount.toLocaleString()} ratings)</span>
        </div>
        {poi.notes?.length ? (
          <div className="mt-2 flex flex-wrap gap-2">
            {poi.notes.map((n, i) => (
              <span
                key={i}
                className="rounded-full border border-[color:var(--border)] px-2 py-0.5 text-xs text-muted-foreground"
              >
                {n}
              </span>
            ))}
          </div>
        ) : null}
      </div>
      <button
        className="ml-2 text-muted-foreground/70 hover:text-foreground transition"
        aria-label="Save place"
        title="Save place"
      >
        ⓘ
      </button>
    </div>
  )
}
