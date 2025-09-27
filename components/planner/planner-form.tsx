"use client"
import { useState, useMemo } from "react"
import type React from "react"
import { useRouter } from "next/navigation"
// Removed early SaveItineraryButton to avoid saving incomplete (no day plan) itineraries
import { PlannerFormProps } from "@/lib/types/component-schemas"
import { useItineraryStorage } from "@/hooks/use-itinerary-storage"
import { SaveItineraryButton } from "@/components/itinerary/save-itinerary-button"

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

  const { saveItinerary: persistItinerary } = useItineraryStorage()
  const [generatedItinerary, setGeneratedItinerary] = useState<any | null>(null)
  const [generating, setGenerating] = useState(false)
  const [genError, setGenError] = useState<string | null>(null)
  const [savedItineraryId, setSavedItineraryId] = useState<string | null>(null)

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
            destination: first.city,
            days: first.days,
            message: `Generating your ${first.days}-day itinerary for ${first.city}...`
          },
        }),
      )
    }

    try {
      setGenError(null)
      setGenerating(true)
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
      const hasDays = Array.isArray(itinerary?.days) && itinerary.days.length > 0 && Array.isArray(itinerary.days[0]?.items)
      if (!hasDays) throw new Error('Generated itinerary missing day-by-day structure')
      setGeneratedItinerary(itinerary)

      // Immediately save the itinerary and show the summary card
      try {
        const savedId = await persistItinerary(itinerary)
        setSavedItineraryId(savedId)
        const href = `/itinerary?id=${savedId}&readOnly=true`

        // Dispatch the summary event to show the itinerary card
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('gumo:add-itinerary-summary', {
            detail: {
              title: itinerary.title,
              blurb: itinerary.overview,
              bullets: itinerary.days[0]?.items.slice(0, 3).map((item: any) => item.name) || itinerary.generalTips.slice(0, 3),
              href,
              imageSrc: '/images/reference/itinerary-summary-user.png',
              itinerary: itinerary
            }
          }))
        }
      } catch (saveError) {
        console.error('Failed to save itinerary:', saveError)
        // Still show the summary even if save failed
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('gumo:add-itinerary-summary', {
            detail: {
              title: itinerary.title,
              blurb: itinerary.overview,
              bullets: itinerary.days[0]?.items.slice(0, 3).map((item: any) => item.name) || itinerary.generalTips.slice(0, 3),
              href: '#',
              imageSrc: '/images/reference/itinerary-summary-user.png',
              itinerary: itinerary
            }
          }))
        }
      }

    } catch (error) {
      console.error('Failed to generate itinerary:', error)
      setGenError(error instanceof Error ? error.message : 'Failed to generate itinerary')

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
    } finally {
      setGenerating(false)
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

        <div className="mt-4 flex flex-col gap-4">
          {genError && (
            <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg p-2">
              {genError}
            </div>
          )}
          <div className="flex items-center justify-end gap-2">
            <button type="button" className={`${outline} rounded-xl px-4 py-2 text-sm`} onClick={() => history.back()} disabled={generating}>
              Cancel
            </button>
            <button type="button" className={`${primary} rounded-xl px-4 py-2 text-sm disabled:opacity-50`} onClick={onNext} disabled={generating}>
              {generating ? 'Generating...' : (generatedItinerary ? 'Regenerate' : 'Generate Itinerary')}
            </button>
          </div>
          {generatedItinerary && (
            <div className="flex items-center justify-between gap-3 border border-white/10 rounded-xl p-3 bg-background/40">
              <div className="text-xs text-foreground/60 flex-1">
                <div className="font-medium text-foreground/80 mb-1">Itinerary ready</div>
                <div>{generatedItinerary.title}</div>
                <div className="mt-1">Days: {generatedItinerary.days.length}</div>
              </div>
              {savedItineraryId ? (
                <a
                  href={`/itinerary?id=${savedItineraryId}&readOnly=true`}
                  className="px-4 py-2 rounded-xl text-sm font-medium bg-yellow-400 text-black hover:bg-yellow-300 transition-colors"
                >
                  View Full Itinerary
                </a>
              ) : (
                <SaveItineraryButton
                  itineraryData={generatedItinerary}
                  variant="outline"
                  size="sm"
                  onSaved={(id) => {
                    setSavedItineraryId(id)
                    const href = `/itinerary?id=${id}&readOnly=true`
                    if (typeof window !== 'undefined') {
                      window.dispatchEvent(new CustomEvent('gumo:add-itinerary-summary', {
                        detail: {
                          title: generatedItinerary.title,
                          blurb: generatedItinerary.overview,
                          bullets: generatedItinerary.days[0]?.items.slice(0, 3).map((item: any) => item.name) || generatedItinerary.generalTips.slice(0, 3),
                          href,
                          imageSrc: '/images/reference/itinerary-summary-user.png',
                          itinerary: generatedItinerary
                        }
                      }))
                    }
                  }}
                  onError={(e) => console.error('Save failed:', e)}
                />
              )}
            </div>
          )}
        </div>
      </SectionCard>

      <div className="rounded-2xl border border-yellow-400/60 bg-background/40 p-3 text-sm text-foreground/60">
        Please confirm or cancel the form above to continue...
      </div>
    </div>
  )
}
