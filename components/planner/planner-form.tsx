"use client"
import { useMemo, useState } from "react"
import type React from "react"

import { useRouter, useSearchParams } from "next/navigation"

type Destination = {
  id: string
  city: string
  days: number
  includeHotels: boolean
  places: string[]
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="text-sm font-medium text-foreground/80">{children}</label>
}

function SectionCard({ children }: { children: React.ReactNode }) {
  return <section className="rounded-2xl border border-white/5 bg-background/40 p-4 shadow-sm">{children}</section>
}

export default function PlannerForm() {
  const router = useRouter()
  const sp = useSearchParams()

  const prefilled = useMemo(() => {
    const locs =
      sp
        .get("loc")
        ?.split(",")
        .map((s) => s.trim())
        .filter(Boolean) ?? []
    const days = sp.get("days") ? Number(sp.get("days")) : undefined
    return { locs, days }
  }, [sp])

  const [destinations, setDestinations] = useState<Destination[]>(
    prefilled.locs.length
      ? [
          {
            id: "loc-1",
            city: prefilled.locs[0],
            days: prefilled.days ?? 3,
            includeHotels: true,
            places: [],
          },
        ]
      : [
          {
            id: "loc-1",
            city: "",
            days: 3,
            includeHotels: true,
            places: [],
          },
        ],
  )
  const [newCity, setNewCity] = useState("")

  const primary = "bg-yellow-400 text-black"
  const outline = "border border-yellow-400 text-yellow-300"
  const pill = "rounded-full px-3 py-1.5"

  function updateDestination(id: string, patch: Partial<Destination>) {
    setDestinations((prev) => prev.map((d) => (d.id === id ? { ...d, ...patch } : d)))
  }

  function onAddDestination() {
    if (!newCity.trim()) return
    const id = `loc-${Date.now()}`
    setDestinations((prev) => [...prev, { id, city: newCity.trim(), days: 3, includeHotels: true, places: [] }])
    setNewCity("")
  }

  function onNext() {
    // Mock: send to /itinerary with simple encoded state
    const params = new URLSearchParams()
    params.set("plan", encodeURIComponent(JSON.stringify(destinations.map((d) => ({ city: d.city, days: d.days })))))
    router.push(`/itinerary?${params.toString()}`)
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <div className="flex flex-wrap gap-2">
        <span className={`${pill} border border-white/10 text-xs text-foreground/80`}>2-3 days (highlights)</span>
      </div>

      <h2 className="text-balance text-xl font-semibold">Your Curated Trip — Tweak to Match Your Vibe</h2>

      {destinations.map((d, idx) => (
        <SectionCard key={d.id}>
          <div className="mb-3 flex items-center justify-between">
            <div className="text-sm text-foreground/60">Location {idx + 1}</div>
            <div className="text-xs text-foreground/60">Days</div>
          </div>

          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-lg font-semibold leading-tight">{d.city || "—"}</div>
              <div className="text-sm text-foreground/60">Thailand</div>
            </div>
            <select
              className="rounded-xl border border-white/10 bg-background px-3 py-2 text-sm"
              value={d.days}
              onChange={(e) => updateDestination(d.id, { days: Number(e.target.value) })}
              aria-label="Days"
            >
              {Array.from({ length: 14 }).map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1} {i + 1 === 1 ? "day" : "days"}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <FieldLabel>Add place?</FieldLabel>
            <input
              className="mt-1 w-full rounded-xl border border-white/10 bg-background px-3 py-2 text-sm outline-none"
              placeholder="Add place?"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const val = (e.target as HTMLInputElement).value.trim()
                  if (!val) return
                  updateDestination(d.id, { places: [...d.places, val] })
                  ;(e.target as HTMLInputElement).value = ""
                }
              }}
            />
            {d.places.length > 0 && (
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-foreground/70">
                {d.places.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            )}
          </div>

          <div className="mb-2 flex items-center justify-between">
            <FieldLabel>Include hotels?</FieldLabel>
            <button
              type="button"
              className={`h-8 w-14 rounded-full border border-white/10 ${
                d.includeHotels ? "bg-yellow-400" : "bg-background"
              } relative`}
              aria-pressed={d.includeHotels}
              onClick={() => updateDestination(d.id, { includeHotels: !d.includeHotels })}
            >
              <span
                className={`absolute top-1 h-6 w-6 rounded-full bg-black transition-all ${
                  d.includeHotels ? "right-1" : "left-1"
                }`}
              />
            </button>
          </div>

          <p className="text-xs text-foreground/50">No POIs preselected for this location.</p>
        </SectionCard>
      ))}

      <SectionCard>
        <h3 className="mb-2 text-lg font-semibold">Add another destination</h3>
        <div className="flex items-center gap-2">
          <input
            value={newCity}
            onChange={(e) => setNewCity(e.target.value)}
            placeholder="Search for a city or country..."
            className="flex-1 rounded-xl border border-white/10 bg-background px-3 py-2 text-sm outline-none"
          />
          <button type="button" className={`${outline} rounded-xl px-3 py-2 text-sm`} onClick={onAddDestination}>
            Add
          </button>
        </div>

        <div className="mt-4 flex items-center justify-end gap-2">
          <button type="button" className={`${outline} rounded-xl px-4 py-2 text-sm`} onClick={() => history.back()}>
            Cancel
          </button>
          <button type="button" className={`${primary} rounded-xl px-4 py-2 text-sm`} onClick={onNext}>
            Next
          </button>
        </div>
      </SectionCard>

      <div className="rounded-2xl border border-yellow-400/60 bg-background/40 p-3 text-sm text-foreground/60">
        Please confirm or cancel the form above to continue...
      </div>
    </div>
  )
}
