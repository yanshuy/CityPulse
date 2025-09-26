"use client"

import type React from "react"

import Image from "next/image"
import { useMemo, useState } from "react"
import { MapPin, Share2, MessageCircle, Star, Download, Hotel } from "lucide-react"

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
      className={`rounded-full px-3 py-1.5 text-sm ${active ? "bg-yellow-400 text-black" : "border border-white/10 text-foreground/80"
        }`}
    >
      {children}
    </button>
  )
}

export default function ItineraryPage({ searchParams }: { searchParams: { plan?: string } }) {
  const plan = useMemo(() => {
    try {
      return JSON.parse(decodeURIComponent(searchParams.plan ?? "")) as Array<{ city: string; days: number }>
    } catch {
      return [{ city: "Bangkok", days: 3 }]
    }
  }, [searchParams.plan])

  const city = plan[0]?.city || "Bangkok"
  const daysTotal = Math.max(1, plan.reduce((acc, d) => acc + (d?.days ?? 0), 0) || 3)
  const [day, setDay] = useState(1)

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
        <div className="flex items-center gap-2">
          <button className="rounded-full bg-[color:var(--gumo-yellow)] px-3 py-1.5 text-xs text-black font-medium flex items-center gap-1">
            Map View
          </button>
          <button className="rounded-full bg-[color:var(--gumo-yellow)] px-3 py-1.5 text-xs text-black font-medium flex items-center gap-1">
            Hotels
          </button>
          <button className="rounded-full bg-[color:var(--gumo-yellow)] px-3 py-1.5 text-xs text-black font-medium flex items-center gap-1">
            <Download className="size-3" /> Download
          </button>
        </div>
      </header>
      <div className="space-y-1">
        <button className="text-sm text-foreground/60 flex items-center gap-2" onClick={() => history.back()}>
          ← Itinerary
        </button>
        <h1 className="text-pretty text-2xl font-semibold mb-2">Trip to {city} (v1)</h1>
      </div>

      <div id="day-section" className="mb-6 flex flex-wrap gap-2">
        {Array.from({ length: daysTotal }).map((_, i) => (
          <button
            key={i}
            onClick={() => setDay(i + 1)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${day === i + 1
              ? "bg-[color:var(--gumo-yellow)] text-black"
              : "border border-white/10 text-foreground/80 hover:bg-white/5"
              }`}
          >
            Day {i + 1}
          </button>
        ))}
      </div>

      <div className="relative">
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-[color:var(--border)]" />

        <div className="space-y-6">
          {pois.map((p, idx) => (
            <div key={p.id} className="relative flex gap-4">
              <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[color:var(--gumo-yellow)] text-black">
                <Hotel />
              </div>

              <div className="flex-1 min-w-0 pb-2">
                {/* Time and duration */}
                <div className="mb-2 text-xs text-foreground/60 flex items-center gap-2">
                  <span>{p.time}</span>
                  <span>•</span>
                  <span>Duration {p.duration}</span>
                  <button className="ml-auto text-foreground/60 hover:text-foreground">
                    <MapPin className="size-4" />
                  </button>
                </div>

                {/* POI Card */}
                <div className="rounded-2xl bg-card border border-[color:var(--border)] p-4">
                  <div className="flex gap-3">
                    <Image
                      src={p.img || "/placeholder.svg"}
                      alt={p.title}
                      width={80}
                      height={80}
                      className="h-16 w-16 rounded-xl object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground">{p.title}</h3>
                      <div className="mt-1 flex items-center gap-1 text-xs text-foreground/70">
                        <Star className="size-3 text-yellow-400 fill-current" />
                        <span>{p.rating}</span>
                      </div>
                      {p.note && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {p.note.split("•").map((tip, i) => (
                            <span
                              key={i}
                              className="rounded-full bg-yellow-400/10 border border-yellow-400/20 px-2 py-0.5 text-xs text-yellow-200"
                            >
                              {tip.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Travel info to next destination */}
                {idx < pois.length - 1 && (
                  <div className="mt-4 flex items-center gap-4 text-sm text-foreground/60">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{p.distanceKm?.toFixed(1)} km</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">14 min</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="sticky bottom-4 mt-8 grid items-center gap-2 p-4 rounded-2xl bg-card/80 backdrop-blur border border-[color:var(--border)]">
        <button className="flex-1 rounded-full bg-[color:var(--gumo-yellow)] px-4 py-2.5 text-sm font-medium text-black flex items-center justify-center gap-2">
          Open Day {day} in Google Maps
        </button>
        <div className="flex gap-2">
          <button className="rounded-full bg-green-500 px-4 py-2.5 text-white text-sm font-medium flex items-center gap-2">
            <MessageCircle className="size-4" />
            WhatsApp
          </button>
          <button className="rounded-full bg-foreground px-4 py-2.5 text-background text-sm font-medium flex items-center gap-2">
            <Share2 className="size-4" />
          </button>
        </div>

      </div>
    </main>
  )
}
