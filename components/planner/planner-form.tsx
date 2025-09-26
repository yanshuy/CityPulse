"use client"
import { useMemo, useState } from "react"
import type React from "react"

import { useRouter } from "next/navigation"
import { SaveItineraryButton } from "@/components/itinerary/save-itinerary-button"
import { PlannerFormProps } from "@/lib/types/component-schemas"

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

export default function PlannerForm({ data }: PlannerFormProps) {
  // Use data from AI directly
  const finalDestination = data.destination
  const finalDays = data.days
  const router = useRouter()

  const prefilled = useMemo(() => {
    const locs = finalDestination ? [finalDestination] : []
    return { locs, days: finalDays }
  }, [finalDestination, finalDays])

  const [destinations, setDestinations] = useState<Destination[]>(
    prefilled.locs.length
      ? [
        {
          id: "loc-1",
          city: prefilled.locs[0],
          days: prefilled.days ?? 3,
          includeHotels: true,
          places: data.highlights,
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

  async function onNext() {
    const first = destinations[0]

    if (!first?.city) {
      alert('Please select a destination first')
      return
    }

    // Show loading state
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("gumo:itinerary-generating", {
          detail: {
            message: `Generating your ${first.days}-day itinerary for ${first.city}...`
          },
        }),
      )
    }

    try {
      // Generate AI itinerary
      const response = await fetch('/api/generate-itinerary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          destination: first.city,
          days: first.days,
          preferences: first.places.join(', ') || data.highlights.join(', '),
          budget: data.estimatedBudget
        })
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to generate itinerary')
      }

      const itinerary = result.data

      // Build URL with generated itinerary
      const params = new URLSearchParams()
      params.set("itinerary", encodeURIComponent(JSON.stringify(itinerary)))

      const href = `/itinerary?${params.toString()}`

      // Fire event with generated itinerary data
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("gumo:add-itinerary-summary", {
            detail: {
              title: itinerary.title,
              blurb: itinerary.overview,
              bullets: itinerary.days[0]?.items.slice(0, 3).map(item => item.name) || itinerary.generalTips.slice(0, 3),
              href,
              imageSrc: "/images/reference/itinerary-summary-user.png",
              itinerary // Include full itinerary data
            },
          }),
        )
      }

    } catch (error) {
      console.error('Failed to generate itinerary:', error)

      // Show error state
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("gumo:itinerary-error", {
            detail: {
              error: error instanceof Error ? error.message : 'Failed to generate itinerary'
            },
          }),
        )
      }
    }
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <div className="flex flex-wrap gap-2">
        <span className={`${pill} border border-white/10 text-xs text-foreground/80`}>
          {data.days} {data.days === 1 ? 'day' : 'days'} • {data.estimatedBudget}
        </span>
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
              <div className="text-lg font-semibold leading-tight">{d.city || data.destination}</div>
              <div className="text-sm text-foreground/60">{data.bestTimeToVisit}</div>
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
            <input
              className="mt-1 w-full rounded-xl border border-white/10 bg-background px-3 py-2 text-sm outline-none"
              placeholder="Add place?"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const val = (e.target as HTMLInputElement).value.trim()
                  if (!val) return
                  updateDestination(d.id, { places: [...d.places, val] })
                    ; (e.target as HTMLInputElement).value = ""
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
              className={`h-8 w-14 rounded-full border border-white/10 ${d.includeHotels ? "bg-yellow-400" : "bg-background"
                } relative`}
              aria-pressed={d.includeHotels}
              onClick={() => updateDestination(d.id, { includeHotels: !d.includeHotels })}
            >
              <span
                className={`absolute top-1 h-6 w-6 rounded-full bg-black transition-all ${d.includeHotels ? "right-1" : "left-1"
                  }`}
              />
            </button>
          </div>

          <div className="text-xs text-foreground/50">
            <p className="mb-2">Suggested activities:</p>
            <ul className="space-y-1">
              {data.suggestedActivities.slice(0, 3).map((activity, i) => (
                <li key={i} className="flex justify-between">
                  <span>• {activity.activity}</span>
                  <span className="text-foreground/40">{activity.duration}</span>
                </li>
              ))}
            </ul>
          </div>
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

        <div className="mt-4 flex items-center justify-between gap-2">
          {/* Left side: Save Itinerary Button */}
          <SaveItineraryButton
            chatData={{
              title: data?.suggestedTitle || `${finalDays}-day ${finalDestination} Trip`,
              description: data?.description || `Explore ${finalDestination} in ${finalDays} days`,
              destination: finalDestination,
              days: finalDays,
              destinations: [{ city: finalDestination, days: finalDays }],
              highlights: data?.highlights || [],
              bestTimeToVisit: data?.bestTimeToVisit,
              estimatedBudget: data?.estimatedBudget,
              suggestedActivities: data?.suggestedActivities,
              chatData: data
            }}
            variant="outline"
            size="sm"
            onSaved={(id) => console.log('Itinerary saved:', id)}
            onError={(error) => console.error('Save failed:', error)}
          />

          {/* Right side: Action buttons */}
          <div className="flex gap-2">
            <button type="button" className={`${outline} rounded-xl px-4 py-2 text-sm`} onClick={() => history.back()}>
              Cancel
            </button>
            <button type="button" className={`${primary} rounded-xl px-4 py-2 text-sm`} onClick={onNext}>
              Next
            </button>
          </div>
        </div>
      </SectionCard>

      <div className="rounded-2xl border border-yellow-400/60 bg-background/40 p-3 text-sm text-foreground/60">
        Please confirm or cancel the form above to continue...
      </div>
    </div>
  )
}
