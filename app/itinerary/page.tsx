"use client"

import type React from "react"

import Image from "next/image"
import { useMemo, useState } from "react"

type POI = {
  id: string
  title: string
  img: string
  note?: string
  rating?: string
  time?: string
  duration?: string
  distanceKm?: number
}

function Tab({ active, children, onClick }: { active?: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-sm ${
        active ? "bg-yellow-400 text-black" : "border border-white/10 text-foreground/80"
      }`}
    >
      {children}
    </button>
  )
}

export default function ItineraryPage({ searchParams }: { searchParams: { plan?: string } }) {
  const days = 3
  const [day, setDay] = useState(1)

  const plan = useMemo(() => {
    try {
      return JSON.parse(decodeURIComponent(searchParams.plan ?? "")) as Array<{ city: string; days: number }>
    } catch {
      return [{ city: "Bangkok", days: 3 }]
    }
  }, [searchParams.plan])

  const city = plan[0]?.city || "Bangkok"

  // Mock POIs
  const pois: POI[] = [
    {
      id: "1",
      title: "Bangkokian Museum",
      img: "/bangkok-museum-photo.jpg",
      rating: "4.6 (1263 ratings)",
      time: "10:50 AM",
      duration: "1 hr 40 min",
      note: "Staffed by friendly volunteers • Third building has air conditioning",
      distanceKm: 1.2,
    },
    {
      id: "2",
      title: "SOI Bangkok Restaurant",
      img: "/thai-restaurant-interior-photo.jpg",
      rating: "4.7 (492 ratings)",
      time: "12:50 PM",
      duration: "1 hr 35 min",
      note: "Try the coconut ice cream • Meat dishes are particularly good",
      distanceKm: 2.5,
    },
    {
      id: "3",
      title: "Asiatique The Riverfront",
      img: "/asiatique-riverfront-photo-night.jpg",
      rating: "4.4 (66703 ratings)",
      time: "2:55 PM",
      duration: "1 hr 35 min",
      note: "Great spot for a river cruise • Diverse halal food options available",
      distanceKm: 4.5,
    },
  ]

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-6">
      <header className="mb-6 flex items-center justify-between">
        <div className="space-y-1">
          <button className="text-sm text-foreground/60" onClick={() => history.back()}>
            &larr; Itinerary
          </button>
          <h1 className="text-pretty text-2xl font-semibold">Trip to {city} (v1)</h1>
        </div>
        <div className="flex items-center gap-2">
          <button className="rounded-full border border-white/10 px-3 py-1.5 text-sm">Map View</button>
          <button className="rounded-full border border-white/10 px-3 py-1.5 text-sm">Hotels</button>
          <button className="rounded-full bg-yellow-400 px-3 py-1.5 text-sm text-black">Download</button>
        </div>
      </header>

      <div className="mb-5 flex flex-wrap gap-2">
        {Array.from({ length: days }).map((_, i) => (
          <Tab key={i} active={day === i + 1} onClick={() => setDay(i + 1)}>
            Day {i + 1}
          </Tab>
        ))}
      </div>

      <ol className="space-y-4">
        {pois.map((p) => (
          <li key={p.id} className="relative">
            <div className="mb-1 flex items-center gap-2 text-xs text-foreground/60">
              <span>{p.time}</span>
              <span>•</span>
              <span>Duration {p.duration}</span>
            </div>

            <div className="rounded-2xl border border-white/10 bg-background/40 p-3">
              <div className="flex gap-3">
                <Image
                  src={p.img || "/placeholder.svg"}
                  alt={p.title}
                  width={72}
                  height={72}
                  className="h-18 w-18 rounded-xl object-cover"
                />
                <div className="min-w-0">
                  <div className="font-semibold">{p.title}</div>
                  <div className="text-xs text-foreground/60">⭐ {p.rating}</div>
                  {p.note && <p className="mt-1 text-xs text-foreground/70">{p.note}</p>}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ol>

      <div className="sticky bottom-4 mt-6 flex flex-wrap items-center gap-2">
        <button className="rounded-full border border-white/10 px-3 py-1.5 text-sm">
          Open Day {day} in Google Maps
        </button>
        <button className="rounded-full border border-white/10 px-3 py-1.5 text-sm">WhatsApp</button>
        <button className="rounded-full bg-yellow-400 px-3 py-1.5 text-sm text-black">Share</button>
      </div>
    </main>
  )
}
